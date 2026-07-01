package com.yuri.aiorder.workflow.execution;

import com.fasterxml.jackson.annotation.JsonProperty;

public record PerformanceStatsResponse(
        @JsonProperty("user_id") Long userId,
        @JsonProperty("completed_count") long completedCount,
        @JsonProperty("effective_duration") long effectiveDuration,
        @JsonProperty("rework_count") long reworkCount,
        @JsonProperty("responsible_rework_count") long responsibleReworkCount,
        @JsonProperty("non_worker_responsibility_rework_count") long nonWorkerResponsibilityReworkCount,
        @JsonProperty("unclassified_rework_count") long unclassifiedReworkCount,
        @JsonProperty("on_time_rate") int onTimeRate,
        @JsonProperty("pass_rate") int passRate,
        @JsonProperty("duration_efficiency") int durationEfficiency) {
}
