package com.iheb.gestion_universite.attendance.analytics.dto;

public record StudentCourseAttendanceRiskResponse(
        Long studentId,
        String studentName,
        String matricule,
        String groupName,
        Long courseId,
        String courseCode,
        String courseTitle,
        Integer courseHourlyVolume,
        double totalSessions,
        long absenceCount,
        long lateCount,
        int absenceLimitSessions,
        int remainingBeforeElimination,
        AbsenceRiskStatus absenceStatus,
        LatenessStatus latenessStatus
) {}
