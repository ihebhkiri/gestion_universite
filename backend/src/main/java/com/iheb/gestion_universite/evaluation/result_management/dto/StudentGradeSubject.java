package com.iheb.gestion_universite.evaluation.result_management.dto;

public record StudentGradeSubject(
        String subjectName,
        Double coefficient,
        Object project,
        Object exam,
        Object homework,
        Object practicalWork,
        Double average,
        Integer capturedCredits,
        Object retake
) {
}
