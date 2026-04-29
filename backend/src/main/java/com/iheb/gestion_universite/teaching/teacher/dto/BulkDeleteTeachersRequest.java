package com.iheb.gestion_universite.teaching.teacher.dto;

import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record BulkDeleteTeachersRequest(
        @NotEmpty List<Long> teacherIds
) {
}
