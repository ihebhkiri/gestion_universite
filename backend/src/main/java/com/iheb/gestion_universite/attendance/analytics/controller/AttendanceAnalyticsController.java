package com.iheb.gestion_universite.attendance.analytics.controller;

import com.iheb.gestion_universite.attendance.analytics.dto.CourseAbsenceStatResponse;
import com.iheb.gestion_universite.attendance.analytics.dto.GroupAttendanceSummaryResponse;
import com.iheb.gestion_universite.attendance.analytics.dto.GroupStudentAttendanceResponse;
import com.iheb.gestion_universite.attendance.analytics.dto.StudentAttendanceProfileResponse;
import com.iheb.gestion_universite.attendance.analytics.dto.TeacherAbsenceStatResponse;
import com.iheb.gestion_universite.attendance.analytics.service.AttendanceAnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/admin/attendance/analytics")
public class AttendanceAnalyticsController {

    private final AttendanceAnalyticsService analyticsService;

    @GetMapping("/group-summary")
    public ResponseEntity<GroupAttendanceSummaryResponse> groupSummary(
            @RequestParam(required = false) Long academicYearId,
            @RequestParam(required = false) Long semesterId,
            @RequestParam(required = false) Long classId,
            @RequestParam(required = false) Long groupId
    ) {
        return ResponseEntity.ok(analyticsService.getGroupSummary(academicYearId, semesterId, classId, groupId));
    }

    @GetMapping("/group-students")
    public ResponseEntity<List<GroupStudentAttendanceResponse>> groupStudents(
            @RequestParam(required = false) Long academicYearId,
            @RequestParam(required = false) Long semesterId,
            @RequestParam(required = false) Long classId,
            @RequestParam(required = false) Long groupId
    ) {
        return ResponseEntity.ok(analyticsService.getGroupStudents(academicYearId, semesterId, classId, groupId));
    }

    @GetMapping("/course-absence-ranking")
    public ResponseEntity<List<CourseAbsenceStatResponse>> courseAbsenceRanking(
            @RequestParam(required = false) Long academicYearId,
            @RequestParam(required = false) Long semesterId,
            @RequestParam(required = false) Long classId,
            @RequestParam(required = false) Long groupId
    ) {
        return ResponseEntity.ok(analyticsService.getCourseAbsenceRanking(academicYearId, semesterId, classId, groupId));
    }

    @GetMapping("/teacher-absence-ranking")
    public ResponseEntity<List<TeacherAbsenceStatResponse>> teacherAbsenceRanking(
            @RequestParam(required = false) Long academicYearId,
            @RequestParam(required = false) Long semesterId,
            @RequestParam(required = false) Long classId,
            @RequestParam(required = false) Long groupId
    ) {
        return ResponseEntity.ok(analyticsService.getTeacherAbsenceRanking(academicYearId, semesterId, classId, groupId));
    }

    @GetMapping("/students/{studentId}/profile")
    public ResponseEntity<StudentAttendanceProfileResponse> studentProfile(
            @PathVariable Long studentId,
            @RequestParam(required = false) Long academicYearId,
            @RequestParam(required = false) Long semesterId,
            @RequestParam(required = false) Long classId,
            @RequestParam(required = false) Long groupId
    ) {
        return ResponseEntity.ok(analyticsService.getStudentProfile(studentId, academicYearId, semesterId, classId, groupId));
    }
}
