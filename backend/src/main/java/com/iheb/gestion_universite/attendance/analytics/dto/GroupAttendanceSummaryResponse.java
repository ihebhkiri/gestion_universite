package com.iheb.gestion_universite.attendance.analytics.dto;

public record GroupAttendanceSummaryResponse(
        long totalStudents,
        long totalSessions,
        long totalRecords,
        long presentCount,
        long absentCount,
        long lateCount,
        long excusedCount,
        double presenceRate,
        double absenceRate,
        double lateRate,
        double excusedRate
) {}
