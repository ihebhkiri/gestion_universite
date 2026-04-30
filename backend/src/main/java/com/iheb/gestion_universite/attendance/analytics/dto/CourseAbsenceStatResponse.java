package com.iheb.gestion_universite.attendance.analytics.dto;

public record CourseAbsenceStatResponse(
        Long courseId,
        String courseCode,
        String courseTitle,
        String teacherName,
        long totalSessions,
        long totalRecords,
        long absentCount,
        double absenceRate
) {}
