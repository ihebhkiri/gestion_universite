package com.iheb.gestion_universite.evaluation.grade_management.dto;

public record GradeDistributionBucketResponse(
        String label,
        double min,
        double max,
        long count
) {}
