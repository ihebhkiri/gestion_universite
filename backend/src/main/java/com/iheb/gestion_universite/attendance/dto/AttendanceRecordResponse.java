package com.iheb.gestion_universite.attendance.dto;

import com.iheb.gestion_universite.attendance.entity.AttendanceStatus;

import java.time.Instant;

public record AttendanceRecordResponse(
        Long id,
        Long studentId,
        String matricule,
        String studentName,
        String groupName,
        AttendanceStatus status,
        String note,
        Instant markedAt
) {}
