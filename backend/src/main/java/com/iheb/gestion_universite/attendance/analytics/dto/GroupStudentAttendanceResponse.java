package com.iheb.gestion_universite.attendance.analytics.dto;

public record GroupStudentAttendanceResponse(
        Long studentId,
        String matricule,
        String studentName,
        String groupName,
        long totalSessions,
        long presentCount,
        long absentCount,
        long lateCount,
        long excusedCount,
        double presenceRate,
        double absenceRate,
        RiskLevel riskLevel
) {}
