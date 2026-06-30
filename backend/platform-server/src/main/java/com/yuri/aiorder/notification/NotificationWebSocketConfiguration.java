package com.yuri.aiorder.notification;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@Configuration
@EnableWebSocket
public class NotificationWebSocketConfiguration implements WebSocketConfigurer {

    private final NotificationWebSocketHandler handler;
    private final NotificationWebSocketAuthInterceptor authInterceptor;
    private final String allowedOrigin;

    public NotificationWebSocketConfiguration(
            NotificationWebSocketHandler handler,
            NotificationWebSocketAuthInterceptor authInterceptor,
            @Value("${app.cors.allowed-origin:http://localhost:5173}") String allowedOrigin) {
        this.handler = handler;
        this.authInterceptor = authInterceptor;
        this.allowedOrigin = allowedOrigin;
    }

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(handler, "/ws/connect")
                .addInterceptors(authInterceptor)
                .setAllowedOrigins(allowedOrigin);
    }
}
