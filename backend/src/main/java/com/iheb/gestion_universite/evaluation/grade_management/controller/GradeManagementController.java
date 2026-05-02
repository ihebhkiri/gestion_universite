package com.iheb.gestion_universite.evaluation.grade_management.controller;

import com.iheb.gestion_universite.evaluation.grade_management.dto.CreateGradeExamRequest;
import com.iheb.gestion_universite.evaluation.grade_management.dto.GradeStatsResponse;
import com.iheb.gestion_universite.evaluation.grade_management.dto.GradebookDetailsResponse;
import com.iheb.gestion_universite.evaluation.grade_management.dto.GradebookExamResponse;
import com.iheb.gestion_universite.evaluation.grade_management.dto.SaveGradeRecordsRequest;
import com.iheb.gestion_universite.evaluation.grade_management.dto.UpdateGradeRecordRequest;
import com.iheb.gestion_universite.evaluation.grade_management.service.GradeManagementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/admin/grade-management")
public class GradeManagementController {

    private final GradeManagementService gradeManagementService;

    @PostMapping("/exams")
    public ResponseEntity<GradebookDetailsResponse> createExam(@Valid @RequestBody CreateGradeExamRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(gradeManagementService.createExam(request));
    }

    @GetMapping("/exams")
    public ResponseEntity<List<GradebookExamResponse>> getExams(
            @RequestParam(required = false) Long classId,
            @RequestParam(required = false) Long courseId
    ) {
        return ResponseEntity.ok(gradeManagementService.getExams(classId, courseId));
    }

    @GetMapping("/exams/{id}")
    public ResponseEntity<GradebookDetailsResponse> getDetails(@PathVariable Long id) {
        return ResponseEntity.ok(gradeManagementService.getDetails(id));
    }

    @GetMapping("/exams/{id}/stats")
    public ResponseEntity<GradeStatsResponse> getStats(@PathVariable Long id) {
        return ResponseEntity.ok(gradeManagementService.getStats(id));
    }

    @PutMapping("/records/{id}")
    public ResponseEntity<GradebookDetailsResponse> updateGrade(
            @PathVariable Long id,
            @Valid @RequestBody UpdateGradeRecordRequest request
    ) {
        return ResponseEntity.ok(gradeManagementService.updateGrade(id, request));
    }

    @PutMapping("/exams/{id}/records")
    public ResponseEntity<GradebookDetailsResponse> saveDraftGrades(
            @PathVariable Long id,
            @Valid @RequestBody SaveGradeRecordsRequest request
    ) {
        return ResponseEntity.ok(gradeManagementService.saveDraftGrades(id, request));
    }

    @PatchMapping("/records/{id}/validate")
    public ResponseEntity<GradebookDetailsResponse> validateGrade(@PathVariable Long id) {
        return ResponseEntity.ok(gradeManagementService.validateGrade(id));
    }

    @PatchMapping("/exams/{id}/publish")
    public ResponseEntity<GradebookDetailsResponse> publishExam(@PathVariable Long id) {
        return ResponseEntity.ok(gradeManagementService.publishExam(id));
    }

    @PatchMapping("/exams/{id}/close")
    public ResponseEntity<GradebookDetailsResponse> closeExam(@PathVariable Long id) {
        return ResponseEntity.ok(gradeManagementService.closeExam(id));
    }
}
