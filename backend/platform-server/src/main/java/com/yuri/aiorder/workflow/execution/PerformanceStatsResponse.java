package com.yuri.aiorder.workflow.execution;

import com.fasterxml.jackson.annotation.JsonProperty;

public record PerformanceStatsResponse(
        @JsonProperty("user_id") Long userId,
        @JsonProperty("performance_formula_version") String performanceFormulaVersion,
        @JsonProperty("completed_count") long completedCount,
        @JsonProperty("effective_duration") long effectiveDuration,
        @JsonProperty("standard_duration") long standardDuration,
        @JsonProperty("standard_covered_count") long standardCoveredCount,
        @JsonProperty("standard_missing_count") long standardMissingCount,
        @JsonProperty("standard_coverage_rate") int standardCoverageRate,
        @JsonProperty("rework_count") long reworkCount,
        @JsonProperty("responsible_rework_count") long responsibleReworkCount,
        @JsonProperty("non_worker_responsibility_rework_count") long nonWorkerResponsibilityReworkCount,
        @JsonProperty("unclassified_rework_count") long unclassifiedReworkCount,
        @JsonProperty("on_time_rate") int onTimeRate,
        @JsonProperty("pass_rate") int passRate,
        @JsonProperty("duration_efficiency") int durationEfficiency,
        @JsonProperty("performance_score") int performanceScore) {
}
