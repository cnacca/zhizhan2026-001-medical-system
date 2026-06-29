package com.yuri.aiorder.file.api;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.file")
public record FileStorageProperties(
        String endpoint,
        String accessKey,
        String secretKey,
        String bucket,
        int uploadUrlTtlSeconds,
        int previewUrlTtlSeconds,
        int downloadUrlTtlSeconds,
        long maxFileSizeBytes) {
}
