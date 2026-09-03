package com.yuri.aiorder.file.api;

public record FileArchiveEntryContent(String filename, String contentType, byte[] bytes) {
}
