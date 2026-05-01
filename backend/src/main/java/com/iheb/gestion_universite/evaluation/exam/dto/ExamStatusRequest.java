package com.iheb.gestion_universite.evaluation.exam.dto;

import com.iheb.gestion_universite.evaluation.exam.ExamStatus;
import jakarta.validation.constraints.NotNull;

public record ExamStatusRequest(
        @NotNull(message = "Status is required")
        ExamStatus status
) {}
