package com.iheb.gestion_universite.evaluation.grade_management.dto;

import com.iheb.gestion_universite.evaluation.grade.entities.GradeStatus;
import jakarta.validation.constraints.DecimalMin;

public record UpdateGradeRecordRequest(
        @DecimalMin(value = "0.0", message = "Score must be greater than or equal to 0")
        Double score,
        String comment,
        GradeStatus status
) {}
