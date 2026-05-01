package com.iheb.gestion_universite.attendance.analytics.dto;

public record AttendanceAnalyticsSummaryResponse(
        long totalSessions,
        long presentCount,
        long absentCount,
        long lateCount,
        long excusedCount,
        double presenceRate,
        double absenceRate,
        double lateRate,
        double excusedRate
) {}
