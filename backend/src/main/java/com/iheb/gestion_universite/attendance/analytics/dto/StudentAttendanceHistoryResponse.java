package com.iheb.gestion_universite.attendance.analytics.dto;

import com.iheb.gestion_universite.attendance.entity.AttendanceStatus;

import java.time.Instant;
import java.time.LocalDate;

public record StudentAttendanceHistoryResponse(
        Long sessionId,
        LocalDate sessionDate,
        String courseCode,
        String courseTitle,
        String teacherName,
        AttendanceStatus status,
        Instant markedAt
) {}
