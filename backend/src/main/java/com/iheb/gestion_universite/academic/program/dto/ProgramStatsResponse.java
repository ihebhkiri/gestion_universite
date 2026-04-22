package com.iheb.gestion_universite.academic.program.dto;

public record ProgramStatsResponse(
        long totalPrograms,
        long totalDepartments,
        long totalSpecialities
) {
}
