package com.iheb.gestion_universite.academic.semester.dto;

public record SemesterStatsResponse(
        long totalSemesters,
        long planned,
        long registrationOpen,
        long inProgress,
        long exams,
        long closed
) {
}

