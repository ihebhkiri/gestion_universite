package com.iheb.gestion_universite.evaluation.exam.dto;

public record ExamSummaryResponse(
        long totalExams,
        long upcomingExams,
        long todayExams,
        long usedRooms,
        long plannedExams,
        long inProgressExams,
        long completedExams,
        long cancelledExams,
        long conflicts
) {}
