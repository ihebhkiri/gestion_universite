package com.iheb.gestion_universite.academic.department.dto;

public record DepartmentStatsResponse(
        long totalDepartments,
        long totalPrograms,
        long totalSpecialities
) {
}
