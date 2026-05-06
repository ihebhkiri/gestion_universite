package com.iheb.gestion_universite.attendance.analytics.dto;

import java.util.List;

public record AttendanceAiReportData(
        GroupAttendanceSummaryResponse summary,
        List<GroupStudentAttendanceResponse> studentsAtRisk,
        List<StudentCourseAttendanceRiskResponse> studentCourseRisks,
        List<CourseAbsenceStatResponse> courseAbsenceRanking,
        List<TeacherAbsenceStatResponse> teacherAbsenceRanking
) {}
