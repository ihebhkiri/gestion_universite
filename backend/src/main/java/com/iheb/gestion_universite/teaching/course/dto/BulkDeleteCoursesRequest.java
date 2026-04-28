package com.iheb.gestion_universite.teaching.course.dto;

import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record BulkDeleteCoursesRequest(
        @NotEmpty(message = "Course ids are required")
        List<Long> courseIds
) {
}

