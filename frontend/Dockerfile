FROM node:22-alpine AS build

WORKDIR /workspace

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY frontend/package.json frontend/package.json
COPY frontend/tsconfig.json frontend/tsconfig.json
COPY frontend/vite.config.ts frontend/vite.config.ts
COPY frontend/index.html frontend/index.html
COPY frontend/src frontend/src

RUN pnpm install --frozen-lockfile
RUN pnpm --filter ai-order-platform-frontend build

FROM nginx:1.27-alpine

LABEL org.opencontainers.image.title="ai-order-platform-frontend"
LABEL org.opencontainers.image.description="Phase-one Vue frontend for AI order platform"

COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /workspace/frontend/dist /usr/share/nginx/html

EXPOSE 80
