FROM nginx:1.27-alpine

LABEL org.opencontainers.image.title="ai-order-platform-frontend"
LABEL org.opencontainers.image.revision="24cfd5dc7b91004b3c2713d74e2775be4186eb84"

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY dist /usr/share/nginx/html

EXPOSE 80
