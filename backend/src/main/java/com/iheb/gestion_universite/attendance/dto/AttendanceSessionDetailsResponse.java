package com.iheb.gestion_universite.attendance.dto;

import java.util.List;

public record AttendanceSessionDetailsResponse(
        AttendanceSessionResponse session,
        List<AttendanceRecordResponse> records
) {}
