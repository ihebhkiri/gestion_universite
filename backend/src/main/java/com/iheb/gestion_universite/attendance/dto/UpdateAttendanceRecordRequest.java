package com.iheb.gestion_universite.attendance.dto;

import com.iheb.gestion_universite.attendance.entity.AttendanceStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateAttendanceRecordRequest(
        @NotNull AttendanceStatus status,
        String note
) {}
