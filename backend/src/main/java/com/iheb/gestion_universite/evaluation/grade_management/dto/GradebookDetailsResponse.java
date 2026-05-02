package com.iheb.gestion_universite.evaluation.grade_management.dto;

import java.util.List;

public record GradebookDetailsResponse(
        GradebookExamResponse exam,
        List<GradeRecordResponse> records,
        GradeStatsResponse stats
) {}
