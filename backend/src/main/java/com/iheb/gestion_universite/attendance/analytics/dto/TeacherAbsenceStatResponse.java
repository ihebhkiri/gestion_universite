package com.iheb.gestion_universite.attendance.analytics.dto;

public record TeacherAbsenceStatResponse(
        Long teacherId,
        String teacherName,
        long totalCourses,
        long totalSessions,
        long totalRecords,
        long absentCount,
        double absenceRate
) {}
