package com.iheb.gestion_universite.student_managment.student_group;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface GroupRepository extends JpaRepository<StudentGroupEntity, Long> {
    Optional<StudentGroupEntity> findByName(String name);
    boolean existsByNameAndAcademicClassId(String name, Long classEntityId);
    boolean existsByNameAndAcademicClassIdAndIdNot(String name, Long classEntityId, Long id);
}
