package com.iheb.gestion_universite.academic.academic_year.dto;

import java.time.LocalDate;

public record AcademicYearDataResponse(
        Long id,
        String label,
        LocalDate startDate,
        LocalDate endDate,
        boolean active
) {
}

