package com.iheb.gestion_universite.academic.semester.dto;

import com.iheb.gestion_universite.academic.semester.SemesterStatus;

import java.time.LocalDate;

public record SemesterDataResponse(
        Long id,
        String name,
        Long academicYearId,
        String academicYearLabel,
        LocalDate startDate,
        LocalDate endDate,
        SemesterStatus status,
        LocalDate examStartDate,
        LocalDate examEndDate,
        String description
) {
}

