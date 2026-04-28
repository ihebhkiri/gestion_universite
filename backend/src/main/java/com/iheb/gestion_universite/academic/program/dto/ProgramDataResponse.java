package com.iheb.gestion_universite.academic.program.dto;

public record ProgramDataResponse(
        Long id,
        String code,
        String name,
        String departmentName,
        String departmentCode,
        Long departmentId,
        long specialityCount
) {
}
