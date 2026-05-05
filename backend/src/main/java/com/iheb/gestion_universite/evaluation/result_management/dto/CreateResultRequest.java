package com.iheb.gestion_universite.evaluation.result_management.dto;

import jakarta.validation.constraints.NotNull;

public record CreateResultRequest(
        @NotNull(message = "Exam id is required")
        Long examId
) {}
