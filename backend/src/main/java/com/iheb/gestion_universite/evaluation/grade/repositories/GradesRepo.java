package com.iheb.gestion_universite.evaluation.grade.repositories;

import com.iheb.gestion_universite.evaluation.grade.entities.GradeEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface GradesRepo extends JpaRepository<GradeEntity, Long> {
    boolean existsByExamIdAndStudentId(Long examId, Long studentId);

    Optional<GradeEntity> findByExamIdAndStudentId(Long examId, Long studentId);

    @Query("""
            select grade
            from GradeEntity grade
            join fetch grade.student student
            join fetch grade.exam exam
            where exam.id = :examId
            order by student.lastName asc, student.firstName asc
            """)
    List<GradeEntity> findByExamIdWithStudent(@Param("examId") Long examId);

}
