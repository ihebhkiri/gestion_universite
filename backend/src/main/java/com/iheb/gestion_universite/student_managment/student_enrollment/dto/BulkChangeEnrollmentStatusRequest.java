package com.iheb.gestion_universite.student_managment.student_enrollment.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotBlank;

import java.util.List;

public record BulkChangeEnrollmentStatusRequest(
        @NotEmpty(message = "Student ids are required")
        List<Long> studentIds,
        @NotBlank(message = "New status is required")
        String newStatus
) {
}

