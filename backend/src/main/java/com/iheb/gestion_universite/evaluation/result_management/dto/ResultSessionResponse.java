package com.iheb.gestion_universite.evaluation.result_management.dto;

import com.iheb.gestion_universite.evaluation.exam.ExamType;
import com.iheb.gestion_universite.evaluation.exam.SessionType;
import com.iheb.gestion_universite.evaluation.result_management.entity.ResultSessionStatus;

import java.time.Instant;
import java.time.LocalDate;

public record ResultSessionResponse(
        Long id,
        Long examId,
        String examTitle,
        ExamType examType,
        SessionType sessionType,
        LocalDate examDate,
        Long courseId,
        String courseCode,
        String courseTitle,
        Long classId,
        String classCode,
        Long groupId,
        String groupName,
        Long semesterId,
        String semesterName,
        Long academicYearId,
        String academicYearLabel,
        ResultSessionStatus status,
        Long totalRecords,
        Instant createdAt,
        Instant updatedAt,
        Instant validatedAt,
        Instant publishedAt
) {}
