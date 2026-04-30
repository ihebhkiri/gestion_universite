package com.iheb.gestion_universite.attendance.controller;

import com.iheb.gestion_universite.attendance.dto.AttendanceSessionDetailsResponse;
import com.iheb.gestion_universite.attendance.dto.AttendanceSessionResponse;
import com.iheb.gestion_universite.attendance.dto.AttendanceSlotResponse;
import com.iheb.gestion_universite.attendance.dto.AttendanceSummaryResponse;
import com.iheb.gestion_universite.attendance.dto.StartAttendanceSessionRequest;
import com.iheb.gestion_universite.attendance.dto.UpdateAttendanceRecordRequest;
import com.iheb.gestion_universite.attendance.service.AttendanceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/admin/attendance")
public class AttendanceController {

    private final AttendanceService attendanceService;

    @GetMapping("/sessions")
    public ResponseEntity<List<AttendanceSessionResponse>> getSessions(
            @RequestParam(required = false) Long classId,
            @RequestParam(required = false) Long courseId
    ) {
        return ResponseEntity.ok(attendanceService.getSessions(classId, courseId));
    }

    @GetMapping("/available-slots")
    public ResponseEntity<List<AttendanceSlotResponse>> getAvailableSlots() {
        return ResponseEntity.ok(attendanceService.getAvailableSlots());
    }

    @PostMapping("/sessions")
    public ResponseEntity<AttendanceSessionDetailsResponse> startSession(@Valid @RequestBody StartAttendanceSessionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(attendanceService.startSession(request));
    }

    @GetMapping("/sessions/{id}")
    public ResponseEntity<AttendanceSessionDetailsResponse> getDetails(@PathVariable Long id) {
        return ResponseEntity.ok(attendanceService.getDetails(id));
    }

    @GetMapping("/sessions/{id}/summary")
    public ResponseEntity<AttendanceSummaryResponse> getSummary(@PathVariable Long id) {
        return ResponseEntity.ok(attendanceService.getSummary(id));
    }

    @PatchMapping("/records/{id}/status")
    public ResponseEntity<AttendanceSessionDetailsResponse> updateRecord(
            @PathVariable Long id,
            @Valid @RequestBody UpdateAttendanceRecordRequest request
    ) {
        return ResponseEntity.ok(attendanceService.updateRecord(id, request));
    }

    @PatchMapping("/sessions/{id}/close")
    public ResponseEntity<AttendanceSessionDetailsResponse> closeSession(@PathVariable Long id) {
        return ResponseEntity.ok(attendanceService.closeSession(id));
    }
}
