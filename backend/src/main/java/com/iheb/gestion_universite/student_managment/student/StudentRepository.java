package com.iheb.gestion_universite.student_managment.student;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface StudentRepository extends JpaRepository<StudentEntity, Long> {
    Optional<StudentEntity> findById(Long id);

    @Query("SELECT s FROM StudentEntity s WHERE " +
            "(:keyword IS NULL OR :keyword = '' OR " +
            "LOWER(s.firstName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(s.lastName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(s.cin) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<StudentEntity> searchStudents(@Param("keyword") String keyword, Pageable pageable);
}
