package com.iheb.gestion_universite.evaluation.result_management.dto;

import java.util.List;

public record StudentResultOverviewResponse(
        Long studentId,
        String studentMatricule,
        String studentName,
        long totalPublished,
        long passedCount,
        long failedCount,
        Double averageScore,
        List<ResultResponse> results
) {}
