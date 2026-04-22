package com.iheb.gestion_universite.academic.semester.dto;

import com.iheb.gestion_universite.academic.semester.SemesterStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record AddSemesterRequest(
        @NotBlank(message = "Name is required")
        String name,
        @NotNull(message = "Academic year id is required")
        Long academicYearId,
        @NotNull(message = "Start date is required")
        LocalDate startDate,
        @NotNull(message = "End date is required")
        LocalDate endDate,
        @NotNull(message = "Status is required")
        SemesterStatus status,
        LocalDate examStartDate,
        LocalDate examEndDate,
        String description
) {
}

