package com.iheb.gestion_universite.teaching.teacher_assignment;

import org.springframework.data.jpa.repository.JpaRepository;

public interface TeacherAssignmentRepository extends JpaRepository<TeacherAssignmentEntity, Long> {
    boolean existsByTeacherIdAndCourseIdAndSemesterIdAndAcademicClassEntityId(
            Long teacherId,
            Long courseId,
            Long semesterId,
            Long academicClassId
    );
}
