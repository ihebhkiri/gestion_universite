package com.iheb.gestion_universite.evaluation.result_management.dto;

public record StudentResultProfile(
        Long id,
        String fullName,
        String className,
        String academicYear
) {
}
