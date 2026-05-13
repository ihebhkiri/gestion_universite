package com.iheb.gestion_universite.evaluation.result_management.controller;

import com.iheb.gestion_universite.evaluation.result_management.dto.StudentResultsResponse;
import com.iheb.gestion_universite.evaluation.result_management.service.StudentResultService;
import com.iheb.gestion_universite.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/students/me/results")
public class StudentResultController {

    private final StudentResultService studentResultService;

    @GetMapping
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<StudentResultsResponse> getMyResults(
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        return ResponseEntity.ok(studentResultService.getMyResults(principal));
    }
}
