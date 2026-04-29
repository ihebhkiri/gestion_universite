package com.iheb.gestion_universite.teaching.teacher;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;
import java.util.Optional;

public interface TeacherRepository extends JpaRepository<TeacherEntity,Long>, JpaSpecificationExecutor<TeacherEntity> {
    Optional<TeacherEntity> findById(Long id);
    List<TeacherEntity> findAll();
}

