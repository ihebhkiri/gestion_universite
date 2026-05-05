package com.iheb.gestion_universite.evaluation.result_management.controller;

import com.iheb.gestion_universite.evaluation.result_management.dto.StudentResultOverviewResponse;
import com.iheb.gestion_universite.evaluation.result_management.service.ResultManagementService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping({"/api/students", "/api/v1/students"})
public class StudentResultsController {

    private final ResultManagementService resultManagementService;

    @GetMapping("/{studentId}/results")
    public ResponseEntity<StudentResultOverviewResponse> getStudentResults(@PathVariable Long studentId) {
        return ResponseEntity.ok(resultManagementService.getStudentResults(studentId));
    }
}
