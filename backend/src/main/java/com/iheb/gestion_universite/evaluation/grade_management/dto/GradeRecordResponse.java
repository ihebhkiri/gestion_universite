package com.iheb.gestion_universite.evaluation.grade_management.dto;

import com.iheb.gestion_universite.evaluation.grade.entities.GradeStatus;

import java.time.Instant;

public record GradeRecordResponse(
        Long id,
        Long studentId,
        String studentMatricule,
        String studentName,
        String groupName,
        Double score,
        Double maxScore,
        String comment,
        GradeStatus status,
        Instant gradedAt,
        Instant updatedAt
) {}
