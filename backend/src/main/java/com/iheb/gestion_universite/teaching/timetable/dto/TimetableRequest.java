package com.iheb.gestion_universite.teaching.timetable.dto;

import com.iheb.gestion_universite.teaching.timetable.CourseSessionType;
import jakarta.validation.constraints.NotNull;

import java.time.DayOfWeek;
import java.time.LocalTime;

public record TimetableRequest(
        @NotNull DayOfWeek dayOfWeek,
        @NotNull LocalTime startTime,
        @NotNull LocalTime endTime,
        @NotNull Long courseId,
        @NotNull Long teacherId,
        @NotNull Long roomId,
        @NotNull Long academicClassId,
        @NotNull Long semesterId,
        @NotNull CourseSessionType sessionType
) {
}
