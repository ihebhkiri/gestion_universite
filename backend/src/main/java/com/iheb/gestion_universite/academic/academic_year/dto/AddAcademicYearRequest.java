package com.iheb.gestion_universite.academic.academic_year.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record AddAcademicYearRequest(
        @NotBlank(message = "Label is required")
        String label,
        @NotNull(message = "Start date is required")
        LocalDate startDate,
        @NotNull(message = "End date is required")
        LocalDate endDate,
        boolean active
) {
}

