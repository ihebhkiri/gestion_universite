package com.iheb.gestion_universite.teaching.course.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record AddCourseRequest(
        @NotBlank(message = "Course code is required")
        String code,
        @NotBlank(message = "Course title is required")
        String title,
        @NotNull(message = "Credits are required")
        @Min(value = 0, message = "Credits must be >= 0")
        Integer credits,
        @NotNull(message = "Hours are required")
        @Min(value = 0, message = "Hours must be >= 0")
        Integer hours,
        @NotNull(message = "Subject id is required")
        Long subjectId ,
        @NotNull(message = "coefficient is required")
        @Min(value = 0, message = "coefficient must be >= 0")
        Double coefficient
) {
}

