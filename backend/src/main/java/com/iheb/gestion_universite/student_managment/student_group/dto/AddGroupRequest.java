package com.iheb.gestion_universite.student_managment.student_group.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record AddGroupRequest(
        @NotBlank(message = "Group name is required")
        String name,
        @Min(value = 1, message = "Capacity must be at least 1")
        int capacity,
        @NotNull(message = "Class id is required")
        Long classId
) {
}
