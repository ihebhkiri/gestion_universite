package com.iheb.gestion_universite.teaching.course.dto;

public record CourseDataResponse(
        Long id,
        String code,
        String title,
        Integer credits,
        Integer hours,
        Long subjectId,
        String subjectName,
        double coefficient
) {
}

