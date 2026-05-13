package com.iheb.gestion_universite.teaching.course.dto;

import java.util.Date;

public record StudentCourseResponse(
        Long id,
        String courseName,
        String courseCode,
        String teacherName,
        String teacherImageUrl,
        Date publishedAt,
        String period,
        Long subjectId,
        String subjectName,
        Long teacherId,
        boolean hasAttachments,
        int attachmentCount
) {
}
