package com.iheb.gestion_universite.evaluation.result_management.dto;

public record ResultStatsResponse(
        long totalRecords,
        long evaluatedCount,
        long passedCount,
        long failedCount,
        long absentCount,
        long pendingCount,
        Double averageScore,
        Double bestScore,
        Double successRate
) {}
