package com.iheb.gestion_universite.attendance.analytics.service;

import com.iheb.gestion_universite.attendance.analytics.dto.AttendanceAiReportData;
import com.iheb.gestion_universite.attendance.analytics.dto.CourseAbsenceStatResponse;
import com.iheb.gestion_universite.attendance.analytics.dto.GroupStudentAttendanceResponse;
import com.iheb.gestion_universite.attendance.analytics.dto.RiskLevel;
import com.iheb.gestion_universite.attendance.analytics.dto.TeacherAbsenceStatResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AttendanceAiReportService {

    private static final int MAX_RISK_STUDENTS = 10;
    private static final int MAX_RANKING_ROWS = 5;

    private final AttendanceAnalyticsService analyticsService;
    private final AttendanceAiService aiService;
    private final AttendancePdfReportService pdfReportService;

    public byte[] generatePdfReport(Long academicYearId, Long semesterId, Long classId, Long groupId) {
        AttendanceAiReportData reportData = buildReportData(academicYearId, semesterId, classId, groupId);
        String aiReport = aiService.generateReport(reportData);
        return pdfReportService.createPdf(aiReport, reportData);
    }

    private AttendanceAiReportData buildReportData(Long academicYearId, Long semesterId, Long classId, Long groupId) {
        List<GroupStudentAttendanceResponse> studentsAtRisk = analyticsService
                .getGroupStudents(academicYearId, semesterId, classId, groupId)
                .stream()
                .filter(student -> student.riskLevel() != RiskLevel.LOW)
                .limit(MAX_RISK_STUDENTS)
                .toList();

        List<CourseAbsenceStatResponse> courseAbsenceRanking = analyticsService
                .getCourseAbsenceRanking(academicYearId, semesterId, classId, groupId)
                .stream()
                .limit(MAX_RANKING_ROWS)
                .toList();

        List<TeacherAbsenceStatResponse> teacherAbsenceRanking = analyticsService
                .getTeacherAbsenceRanking(academicYearId, semesterId, classId, groupId)
                .stream()
                .limit(MAX_RANKING_ROWS)
                .toList();

        return new AttendanceAiReportData(
                analyticsService.getGroupSummary(academicYearId, semesterId, classId, groupId),
                studentsAtRisk,
                analyticsService.getStudentCourseAttendanceRisks(academicYearId, semesterId, classId, groupId),
                courseAbsenceRanking,
                teacherAbsenceRanking
        );
    }
}
