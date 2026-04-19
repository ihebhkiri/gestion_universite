package com.iheb.gestion_universite.teaching.teacher;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TeacherRepository extends JpaRepository<TeacherEntity,Long> {
    Optional<TeacherEntity> findById(Long id);
    List<TeacherEntity> findAll();
}

