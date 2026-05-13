package com.iheb.gestion_universite.evaluation.result_management.dto;

import java.time.Instant;

public record StudentRecentGrade(
        Long id,
        String courseName,
        String examType,
        Object grade,
        Double scoreOn20,
        Instant gradedAt
) {
}
