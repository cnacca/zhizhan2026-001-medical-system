FROM eclipse-temurin:21-jre

LABEL org.opencontainers.image.title="ai-order-platform-backend"
LABEL org.opencontainers.image.description="Phase-one Spring Boot backend for AI order platform"

WORKDIR /app

ENV SPRING_PROFILES_ACTIVE=prod
ENV SERVER_PORT=8080
# APP_AUTH_TOKEN_SECRET must be injected by compose or the runtime environment.

ARG JAR_FILE=backend/platform-server/target/platform-server-0.1.0-SNAPSHOT.jar
COPY ${JAR_FILE} /app/app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
