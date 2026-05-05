package com.iheb.gestion_universite.evaluation.result_management.dto;

import com.iheb.gestion_universite.evaluation.result_management.entity.ResultStatus;
import jakarta.validation.constraints.DecimalMin;

public record UpdateResultRequest(
        @DecimalMin(value = "0.0", message = "Score must be greater than or equal to 0")
        Double score,
        ResultStatus status,
        String comment,
        String mention
) {}
