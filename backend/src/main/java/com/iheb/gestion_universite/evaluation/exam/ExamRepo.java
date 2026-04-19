package com.iheb.gestion_universite.evaluation.exam;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ExamRepo extends JpaRepository<ExamEntity, Long> {

    boolean existsByCourseIdAndTitleAndTypeAndSessionType (Long courseId, String title, ExamType type, SessionType session);

}
