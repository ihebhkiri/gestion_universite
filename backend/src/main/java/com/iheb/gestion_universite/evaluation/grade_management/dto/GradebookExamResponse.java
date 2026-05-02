package com.iheb.gestion_universite.evaluation.grade_management.dto;

import com.iheb.gestion_universite.evaluation.exam.ExamStatus;
import com.iheb.gestion_universite.evaluation.exam.ExamType;
import com.iheb.gestion_universite.evaluation.exam.SessionType;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;

public record GradebookExamResponse(
        Long id,
        String title,
        ExamType type,
        SessionType sessionType,
        ExamStatus status,
        Double duration,
        Double weight,
        Double maxScore,
        LocalDate examDate,
        LocalTime startTime,
        LocalTime endTime,
        String instructions,
        Long courseId,
        String courseCode,
        String courseTitle,
        Long classId,
        String classCode,
        Long groupId,
        String groupName,
        Long supervisorId,
        String supervisorName,
        Long semesterId,
        String semesterName,
        Instant createdAt
) {}
