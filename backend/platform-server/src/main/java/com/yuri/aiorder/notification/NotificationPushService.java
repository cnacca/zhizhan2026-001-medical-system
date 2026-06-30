package com.yuri.aiorder.notification;

import java.io.IOException;
import java.util.List;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Service;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

@Service
public class NotificationPushService {

    private final JdbcClient jdbcClient;
    private final List<NotificationBroadcaster> broadcasters;
    private final String instanceId;
    private final ConcurrentHashMap<Long, Set<WebSocketSession>> sessionsByUser = new ConcurrentHashMap<>();

    public NotificationPushService(
            JdbcClient jdbcClient,
            List<NotificationBroadcaster> broadcasters,
            @Value("${app.notification.instance-id}") String instanceId) {
        this.jdbcClient = jdbcClient;
        this.broadcasters = broadcasters;
        this.instanceId = instanceId;
    }

    public void register(long userId, WebSocketSession session) {
        sessionsByUser.computeIfAbsent(userId, ignored -> ConcurrentHashMap.newKeySet()).add(session);
    }

    public void unregister(long userId, WebSocketSession session) {
        Set<WebSocketSession> sessions = sessionsByUser.get(userId);
        if (sessions == null) {
            return;
        }
        sessions.remove(session);
        if (sessions.isEmpty()) {
            sessionsByUser.remove(userId, sessions);
        }
    }

    public void pushToUser(Long userId, long eventId, String payload) {
        if (userId == null) {
            return;
        }
        pushLocalToUser(userId, eventId, payload);
        broadcast(userId, eventId, payload);
    }

    void pushLocalToUser(long userId, long eventId, String payload) {
        Set<WebSocketSession> sessions = sessionsByUser.get(userId);
        if (sessions == null || sessions.isEmpty()) {
            return;
        }
        boolean delivered = false;
        for (WebSocketSession session : sessions) {
            if (!session.isOpen()) {
                sessions.remove(session);
                continue;
            }
            try {
                synchronized (session) {
                    session.sendMessage(new TextMessage(payload));
                }
                delivered = true;
            } catch (IOException ex) {
                sessions.remove(session);
            }
        }
        if (delivered) {
            markDelivered(userId, eventId);
        }
    }

    private void broadcast(long userId, long eventId, String payload) {
        if (broadcasters.isEmpty()) {
            return;
        }
        NotificationBroadcastMessage message = new NotificationBroadcastMessage(userId, eventId, payload, instanceId);
        for (NotificationBroadcaster broadcaster : broadcasters) {
            try {
                broadcaster.broadcast(message);
            } catch (RuntimeException ignored) {
                // Local delivery and durable user_notification rows remain the source of truth if Redis is unavailable.
            }
        }
    }

    private void markDelivered(long userId, long eventId) {
        jdbcClient.sql("""
                        UPDATE user_notification
                        SET delivered_at = CURRENT_TIMESTAMP(3)
                        WHERE event_id = :eventId
                          AND user_id = :userId
                          AND delivered_at IS NULL
                        """)
                .param("eventId", eventId)
                .param("userId", userId)
                .update();
        jdbcClient.sql("""
                        UPDATE notification_event
                        SET delivery_status = 'DELIVERED'
                        WHERE event_id = :eventId
                        """)
                .param("eventId", eventId)
                .update();
    }
}
