package com.iheb.gestion_universite.student_managment.student;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface StudentRepository  extends JpaRepository<StudentEntity,Long> {
    Optional<StudentEntity> findById(Long id);
    List<StudentEntity> findAll();
}
