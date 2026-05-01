package com.iheb.gestion_universite.evaluation.exam;

import com.iheb.gestion_universite.evaluation.exam.dto.ExamConflictCheckRequest;
import com.iheb.gestion_universite.evaluation.exam.dto.ExamConflictResponse;
import com.iheb.gestion_universite.evaluation.exam.dto.ExamRequest;
import com.iheb.gestion_universite.evaluation.exam.dto.ExamResponse;
import com.iheb.gestion_universite.evaluation.exam.dto.ExamStatusRequest;
import com.iheb.gestion_universite.evaluation.exam.dto.ExamSummaryResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/admin/exams")
public class AdminExamController {

    private final ExamService examService;

    @PostMapping
    public ResponseEntity<ExamResponse> createExam(@Valid @RequestBody ExamRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(examService.createManagedExam(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ExamResponse> updateExam(@PathVariable Long id, @Valid @RequestBody ExamRequest request) {
        return ResponseEntity.ok(examService.updateManagedExam(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteExam(@PathVariable Long id) {
        examService.deleteExam(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<ExamResponse> cancelExam(@PathVariable Long id) {
        return ResponseEntity.ok(examService.cancelExam(id));
    }

    @GetMapping
    public ResponseEntity<List<ExamResponse>> getExams(
            @RequestParam(required = false) Long academicYearId,
            @RequestParam(required = false) Long semesterId,
            @RequestParam(required = false) Long classId,
            @RequestParam(required = false) Long groupId,
            @RequestParam(required = false) Long courseId,
            @RequestParam(required = false) Long supervisorId,
            @RequestParam(required = false) Long roomId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) ExamStatus status
    ) {
        return ResponseEntity.ok(examService.findExams(academicYearId, semesterId, classId, groupId, courseId, supervisorId, roomId, date, status));
    }

    @GetMapping("/day/{date}")
    public ResponseEntity<List<ExamResponse>> getExamsByDay(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) Long classId,
            @RequestParam(required = false) Long groupId,
            @RequestParam(required = false) Long roomId
    ) {
        return ResponseEntity.ok(examService.findExamsByDay(date, classId, groupId, roomId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ExamResponse> getExamDetails(@PathVariable Long id) {
        return ResponseEntity.ok(examService.getExamDetails(id));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ExamResponse> changeStatus(@PathVariable Long id, @Valid @RequestBody ExamStatusRequest request) {
        return ResponseEntity.ok(examService.changeStatus(id, request.status()));
    }

    @GetMapping("/summary")
    public ResponseEntity<ExamSummaryResponse> getSummary(
            @RequestParam(required = false) Long academicYearId,
            @RequestParam(required = false) Long semesterId,
            @RequestParam(required = false) Long classId,
            @RequestParam(required = false) Long groupId,
            @RequestParam(required = false) Long courseId,
            @RequestParam(required = false) Long supervisorId,
            @RequestParam(required = false) Long roomId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) ExamStatus status
    ) {
        return ResponseEntity.ok(examService.getSummary(academicYearId, semesterId, classId, groupId, courseId, supervisorId, roomId, date, status));
    }

    @PostMapping("/conflicts/check")
    public ResponseEntity<List<ExamConflictResponse>> checkConflicts(@Valid @RequestBody ExamConflictCheckRequest request) {
        return ResponseEntity.ok(examService.checkConflicts(request));
    }
}
