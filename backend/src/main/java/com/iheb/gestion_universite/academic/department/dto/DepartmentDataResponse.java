package com.iheb.gestion_universite.academic.department.dto;

public record DepartmentDataResponse(
        Long id,
        String code,
        String name,
        long programCount
) {
}
