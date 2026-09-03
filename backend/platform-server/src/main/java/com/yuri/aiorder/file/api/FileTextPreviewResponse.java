package com.yuri.aiorder.file.api;

import com.fasterxml.jackson.annotation.JsonProperty;

public record FileTextPreviewResponse(
        @JsonProperty("file_id") long fileId,
        @JsonProperty("filename") String filename,
        @JsonProperty("text") String text,
        @JsonProperty("truncated") boolean truncated) {
}
