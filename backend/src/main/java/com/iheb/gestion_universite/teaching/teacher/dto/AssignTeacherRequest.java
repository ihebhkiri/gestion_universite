package com.iheb.gestion_universite.teaching.teacher.dto;

import jakarta.validation.constraints.NotNull;

public record AssignTeacherRequest(
        @NotNull Long courseId,
        @NotNull Long semesterId,
        @NotNull Long classId
) {
}
