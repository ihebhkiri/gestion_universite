package com.iheb.gestion_universite.evaluation.grade_management.dto;

import java.util.List;

public record GradeStatsResponse(
        long totalStudents,
        long gradedCount,
        long notGradedCount,
        long draftCount,
        long validatedCount,
        long publishedCount,
        long passCount,
        long failCount,
        double completionRate,
        double passRate,
        Double classAverage,
        Double highestScore,
        Double lowestScore,
        Double maxScore,
        Double passThreshold,
        List<GradeDistributionBucketResponse> distribution
) {}
