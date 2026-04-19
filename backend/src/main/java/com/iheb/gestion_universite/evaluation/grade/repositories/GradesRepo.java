package com.iheb.gestion_universite.evaluation.grade.repositories;

import com.iheb.gestion_universite.evaluation.grade.entities.GradeEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GradesRepo extends JpaRepository<GradeEntity,Integer> {
    boolean existsByExamIdAndStudentId(Long examId, Long studentId);

}
