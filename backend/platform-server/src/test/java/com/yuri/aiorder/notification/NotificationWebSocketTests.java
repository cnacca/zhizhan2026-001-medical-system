package com.yuri.aiorder.notification;

import static org.assertj.core.api.Assertions.assertThat;

import com.yuri.aiorder.collaboration.BillRequest;
import com.yuri.aiorder.collaboration.CollaborationService;
import com.yuri.aiorder.common.BootstrapIdentity;
import com.yuri.aiorder.common.UserRole;
import com.yuri.aiorder.common.auth.BearerTokenService;
import java.net.URLEncoder;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.util.UUID;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.TimeUnit;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketHttpHeaders;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.client.standard.StandardWebSocketClient;
import org.springframework.web.socket.handler.TextWebSocketHandler;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class NotificationWebSocketTests {

    private static final long CS_USER_ID = 9901L;
    private static final long DOCTOR_USER_ID = 9902L;

    @LocalServerPort
    private int port;

    @Autowired
    private BearerTokenService tokenService;

    @Autowired
    private CollaborationService collaborationService;

    @Autowired
    private JdbcClient jdbcClient;

    private WebSocketSession session;
    private long clinicId;
    private long orderId;
    private long fileId;

    @BeforeEach
    void setUp() {
        String suffix = UUID.randomUUID().toString().replace("-", "");
        jdbcClient.sql("INSERT INTO clinic (clinic_name) VALUES (:clinicName)")
                .param("clinicName", "WebSocket测试诊所-" + suffix)
                .update();
        clinicId = lastInsertId();
        jdbcClient.sql("""
                        INSERT INTO orders
                            (order_no, clinic_id, doctor_user_id, cs_user_id, product_type,
                             internal_status, external_status, production_note)
                        VALUES
                            (:orderNo, :clinicId, :doctorUserId, :csUserId, 'WS_TEST',
                             'PENDING_PRODUCTION_REVIEW', 'PENDING_REVIEW', 'WebSocket内部备注')
                        """)
                .param("orderNo", "WS" + suffix.substring(0, 12))
                .param("clinicId", clinicId)
                .param("doctorUserId", DOCTOR_USER_ID)
                .param("csUserId", CS_USER_ID)
                .update();
        orderId = lastInsertId();
        jdbcClient.sql("""
                        INSERT INTO file_resource
                            (order_id, owner_user_id, source_type, visibility, bucket_name,
                             object_key, original_filename, content_type, file_size, upload_status)
                        VALUES
                            (:orderId, :ownerUserId, 'BILL', 'DOCTOR_CS', 'ai-order-private',
                             :objectKey, 'bill.pdf', 'application/pdf', 1024, 'COMPLETED')
                        """)
                .param("orderId", orderId)
                .param("ownerUserId", CS_USER_ID)
                .param("objectKey", "test/ws/" + suffix + ".pdf")
                .update();
        fileId = lastInsertId();
    }

    @AfterEach
    void tearDown() throws Exception {
        if (session != null && session.isOpen()) {
            session.close();
        }
    }

    @Test
    void websocketPushesDoctorNotificationAndMarksItDelivered() throws Exception {
        LinkedBlockingQueue<String> messages = new LinkedBlockingQueue<>();
        String token = tokenService.issue(new BootstrapIdentity(UserRole.DOCTOR, DOCTOR_USER_ID, clinicId));
        session = connect(token, messages);

        collaborationService.uploadBill(
                orderId,
                new BillRequest(fileId),
                new BootstrapIdentity(UserRole.CS, CS_USER_ID, null));

        String payload = messages.poll(5, TimeUnit.SECONDS);
        assertThat(payload).isNotNull();
        assertThat(payload).contains("BILL_UPLOADED");
        assertThat(payload).contains("账单已上传");
        assertThat(payload).doesNotContain("WebSocket内部备注");
        assertThat(deliveredNotificationCount()).isEqualTo(1L);
    }

    @Test
    void websocketAllowsLoopbackViteOrigin() throws Exception {
        LinkedBlockingQueue<String> messages = new LinkedBlockingQueue<>();
        String token = tokenService.issue(new BootstrapIdentity(UserRole.DOCTOR, DOCTOR_USER_ID, clinicId));

        session = connect(token, messages, "http://127.0.0.1:5173");

        assertThat(session.isOpen()).isTrue();
    }

    private WebSocketSession connect(String token, LinkedBlockingQueue<String> messages) throws Exception {
        return connect(token, messages, null);
    }

    private WebSocketSession connect(String token, LinkedBlockingQueue<String> messages, String origin) throws Exception {
        StandardWebSocketClient client = new StandardWebSocketClient();
        String encodedToken = URLEncoder.encode(token, StandardCharsets.UTF_8);
        WebSocketHttpHeaders headers = new WebSocketHttpHeaders();
        if (origin != null) {
            headers.setOrigin(origin);
        }
        return client.execute(new TextWebSocketHandler() {
                    @Override
                    protected void handleTextMessage(WebSocketSession session, TextMessage message) {
                        messages.offer(message.getPayload());
                    }
                }, headers, URI.create("ws://localhost:%d/ws/connect?token=%s".formatted(port, encodedToken)))
                .get(5, TimeUnit.SECONDS);
    }

    private long deliveredNotificationCount() {
        return jdbcClient.sql("""
                        SELECT COUNT(*)
                        FROM user_notification un
                        JOIN notification_event ne ON ne.event_id = un.event_id
                        WHERE ne.order_id = :orderId
                          AND un.user_id = :userId
                          AND un.delivered_at IS NOT NULL
                          AND ne.delivery_status = 'DELIVERED'
                        """)
                .param("orderId", orderId)
                .param("userId", DOCTOR_USER_ID)
                .query(Long.class)
                .single();
    }

    private long lastInsertId() {
        return jdbcClient.sql("SELECT LAST_INSERT_ID()").query(Long.class).single();
    }
}
