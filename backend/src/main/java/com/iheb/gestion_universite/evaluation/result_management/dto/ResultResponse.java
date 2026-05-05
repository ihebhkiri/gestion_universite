package com.iheb.gestion_universite.evaluation.result_management.dto;

import com.iheb.gestion_universite.evaluation.result_management.entity.ResultStatus;

import java.time.Instant;

public record ResultResponse(
        Long id,
        Long sessionId,
        Long examId,
        Long studentId,
        String studentMatricule,
        String studentName,
        Double score,
        Double maxScore,
        Double weightedScore,
        String mention,
        ResultStatus status,
        Boolean published,
        String comment,
        Instant gradedAt,
        Instant updatedAt
) {}
