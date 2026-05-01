package com.iheb.gestion_universite.evaluation.exam.dto;

public record ExamConflictResponse(
        String conflictType,
        String message,
        Long examId,
        String examTitle
) {}
