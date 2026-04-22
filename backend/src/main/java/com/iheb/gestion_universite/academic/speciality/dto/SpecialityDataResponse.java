package com.iheb.gestion_universite.academic.speciality.dto;

public record SpecialityDataResponse(
        Long id,
        String code,
        String name,
        String programName,
        String programCode,
        Long programId
) {
}
