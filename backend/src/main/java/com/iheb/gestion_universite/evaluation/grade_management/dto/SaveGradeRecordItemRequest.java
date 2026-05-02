package com.iheb.gestion_universite.evaluation.grade_management.dto;

import com.iheb.gestion_universite.evaluation.grade.entities.GradeStatus;
import jakarta.validation.constraints.NotNull;

public record SaveGradeRecordItemRequest(
        @NotNull(message = "Record id is required")
        Long recordId,
        Double score,
        String comment,
        GradeStatus status
) {}
