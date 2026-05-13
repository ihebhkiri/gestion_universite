package com.iheb.gestion_universite.attendance.dto;

public record StudentTopAbsenceDto(
        Long subjectId,
        String subjectName,
        long absenceCount
) {}
