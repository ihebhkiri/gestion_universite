package com.iheb.gestion_universite.student_managment.student.dto;

import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record BulkDeleteStudentsRequest(
        @NotEmpty(message = "Student ids are required")
        List<Long> studentIds
) {
}

