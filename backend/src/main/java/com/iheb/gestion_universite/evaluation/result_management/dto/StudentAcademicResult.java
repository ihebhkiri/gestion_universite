package com.iheb.gestion_universite.evaluation.result_management.dto;

public record StudentAcademicResult(
        String type,
        String period,
        Double average,
        Integer capturedCredits,
        String result,
        String mention,
        Integer classRank,
        Integer levelRank
) {
}
