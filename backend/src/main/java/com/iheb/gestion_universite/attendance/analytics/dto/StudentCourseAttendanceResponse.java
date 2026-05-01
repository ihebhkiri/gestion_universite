package com.iheb.gestion_universite.attendance.analytics.dto;

public record StudentCourseAttendanceResponse(
        Long courseId,
        String courseCode,
        String courseTitle,
        String teacherName,
        long totalSessions,
        long presentCount,
        long absentCount,
        long lateCount,
        long excusedCount,
        double presenceRate,
        double absenceRate
) {}
