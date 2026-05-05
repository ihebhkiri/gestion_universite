package com.iheb.gestion_universite.evaluation.result_management.controller;

import com.iheb.gestion_universite.evaluation.result_management.dto.CreateResultRequest;
import com.iheb.gestion_universite.evaluation.result_management.dto.PublishResultsRequest;
import com.iheb.gestion_universite.evaluation.result_management.dto.ResultDetailsResponse;
import com.iheb.gestion_universite.evaluation.result_management.dto.ResultResponse;
import com.iheb.gestion_universite.evaluation.result_management.dto.ResultSessionResponse;
import com.iheb.gestion_universite.evaluation.result_management.dto.ResultStatsResponse;
import com.iheb.gestion_universite.evaluation.result_management.dto.StudentResultOverviewResponse;
import com.iheb.gestion_universite.evaluation.result_management.dto.UpdateResultRequest;
import com.iheb.gestion_universite.evaluation.result_management.service.ResultManagementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping({"/api/results", "/api/v1/results"})
public class ResultManagementController {

    private final ResultManagementService resultManagementService;

    @PostMapping("/sessions")
    public ResponseEntity<ResultSessionResponse> createSession(@Valid @RequestBody CreateResultRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(resultManagementService.createSession(request));
    }

    @GetMapping("/sessions")
    public ResponseEntity<List<ResultSessionResponse>> getSessions() {
        return ResponseEntity.ok(resultManagementService.getSessions());
    }

    @GetMapping("/sessions/{sessionId}")
    public ResponseEntity<ResultDetailsResponse> getSession(@PathVariable Long sessionId) {
        return ResponseEntity.ok(resultManagementService.getSession(sessionId));
    }

    @GetMapping("/sessions/{sessionId}/records")
    public ResponseEntity<List<ResultResponse>> getRecords(@PathVariable Long sessionId) {
        return ResponseEntity.ok(resultManagementService.getRecords(sessionId));
    }

    @PutMapping("/records/{recordId}/score")
    public ResponseEntity<ResultResponse> updateScore(
            @PathVariable Long recordId,
            @Valid @RequestBody UpdateResultRequest request
    ) {
        return ResponseEntity.ok(resultManagementService.updateScore(recordId, request));
    }

    @PutMapping("/records/{recordId}/status")
    public ResponseEntity<ResultResponse> updateStatus(
            @PathVariable Long recordId,
            @Valid @RequestBody UpdateResultRequest request
    ) {
        return ResponseEntity.ok(resultManagementService.updateStatus(recordId, request));
    }

    @PostMapping("/sessions/{sessionId}/validate")
    public ResponseEntity<ResultDetailsResponse> validateSession(@PathVariable Long sessionId) {
        return ResponseEntity.ok(resultManagementService.validateSession(sessionId));
    }

    @PostMapping("/sessions/{sessionId}/publish")
    public ResponseEntity<ResultDetailsResponse> publishSession(
            @PathVariable Long sessionId,
            @RequestBody(required = false) PublishResultsRequest request
    ) {
        return ResponseEntity.ok(resultManagementService.publishSession(sessionId, request));
    }

    @GetMapping("/sessions/{sessionId}/stats")
    public ResponseEntity<ResultStatsResponse> getStats(@PathVariable Long sessionId) {
        return ResponseEntity.ok(resultManagementService.getStats(sessionId));
    }
}
