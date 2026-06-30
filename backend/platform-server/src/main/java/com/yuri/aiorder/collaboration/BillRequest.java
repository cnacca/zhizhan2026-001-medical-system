package com.yuri.aiorder.collaboration;

import com.fasterxml.jackson.annotation.JsonProperty;

public record BillRequest(@JsonProperty("file_id") Long fileId) {
}
