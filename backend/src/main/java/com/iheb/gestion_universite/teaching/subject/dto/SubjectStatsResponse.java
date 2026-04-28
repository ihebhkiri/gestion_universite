package com.iheb.gestion_universite.teaching.subject.dto;

public record SubjectStatsResponse(
        long totalSubjects,
        double averageCoefficient
) {
}
