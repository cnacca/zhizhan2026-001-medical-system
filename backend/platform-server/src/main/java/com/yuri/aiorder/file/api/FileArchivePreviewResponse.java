package com.yuri.aiorder.file.api;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public record FileArchivePreviewResponse(
        @JsonProperty("file_id") long fileId,
        @JsonProperty("filename") String filename,
        List<Entry> entries,
        boolean truncated) {

    public record Entry(
            String path,
            @JsonProperty("uncompressed_size") long uncompressedSize,
            boolean directory,
            @JsonProperty("preview_supported") boolean previewSupported) {
    }
}
