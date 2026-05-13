package com.iheb.gestion_universite.attendance.controller;

import com.iheb.gestion_universite.attendance.dto.StudentAttendanceResponse;
import com.iheb.gestion_universite.attendance.dto.StudentAttendanceSummaryDto;
import com.iheb.gestion_universite.attendance.dto.StudentTopAbsenceDto;
import com.iheb.gestion_universite.attendance.service.StudentAttendanceService;
import com.iheb.gestion_universite.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/students/me/attendance")
@PreAuthorize("hasRole('STUDENT')")
public class StudentAttendanceController {

    private final StudentAttendanceService studentAttendanceService;

    @GetMapping
    public ResponseEntity<Page<StudentAttendanceResponse>> getMyAttendance(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String excludeStatus,
            @RequestParam(required = false) String period,
            @RequestParam(required = false) Long subjectId,
            @RequestParam(required = false) Long teacherId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @PageableDefault(size = 10, sort = "sessionDate", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ResponseEntity.ok(studentAttendanceService.getMyAttendance(
                principal,
                status,
                excludeStatus,
                period,
                subjectId,
                teacherId,
                fromDate,
                toDate,
                pageable
        ));
    }

    @GetMapping("/summary")
    public ResponseEntity<StudentAttendanceSummaryDto> getMyAttendanceSummary(
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        return ResponseEntity.ok(studentAttendanceService.getMySummary(principal));
    }

    @GetMapping("/top-absences")
    public ResponseEntity<List<StudentTopAbsenceDto>> getTopAbsences(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(defaultValue = "5") int limit
    ) {
        return ResponseEntity.ok(studentAttendanceService.getTopAbsences(principal, limit));
    }
}
