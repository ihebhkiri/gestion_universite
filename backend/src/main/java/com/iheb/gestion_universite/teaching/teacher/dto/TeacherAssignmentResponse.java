package com.iheb.gestion_universite.teaching.teacher.dto;

public record TeacherAssignmentResponse(
        Long id,
        Long teacherId,
        String teacherName,
        Long courseId,
        String courseTitle,
        Long semesterId,
        String semesterName,
        Long classId,
        String classCode
) {
}
