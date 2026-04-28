package com.iheb.gestion_universite.academic.academic_class.dto;

public record AcademicClassStatsResponse(
        long totalClasses,
        long totalPrograms,
        long totalSpecialities,
        long totalAcademicYears
) {
}
