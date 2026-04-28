package com.iheb.gestion_universite.teaching.course.dto;

public record CourseStatsResponse(
        long totalCourses,
        double averageCredits,
        long totalHours
) {
}

