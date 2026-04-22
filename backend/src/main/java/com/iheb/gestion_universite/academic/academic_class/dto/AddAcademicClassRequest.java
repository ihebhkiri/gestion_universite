package com.iheb.gestion_universite.academic.academic_class.dto;

import com.iheb.gestion_universite.academic.academic_class.Session;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record AddAcademicClassRequest(
        @Min(value = 1, message = "Level must be at least 1")
        @Max(value = 9, message = "Level must be at most 9")
        int level,
        @NotNull(message = "Session is required")
        Session session,
        @NotNull(message = "Program id is required")
        Long programId,
        @NotNull(message = "Speciality id is required")
        Long specialityId,
        @NotNull(message = "Academic year id is required")
        Long academicYearId
) {
}
