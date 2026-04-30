package com.iheb.gestion_universite.attendance.analytics.dto;

import java.util.List;

public record StudentAttendanceProfileResponse(
        Long studentId,
        String matricule,
        String studentName,
        String groupName,
        String classCode,
        AttendanceAnalyticsSummaryResponse globalSummary,
        List<StudentCourseAttendanceResponse> courseSummaries,
        List<StudentAttendanceHistoryResponse> history
) {}
