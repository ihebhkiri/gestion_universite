package com.iheb.gestion_universite.student_managment.student;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.EntityGraph;

import java.util.Optional;

public interface StudentRepository extends JpaRepository<StudentEntity, Long>, JpaSpecificationExecutor<StudentEntity> {
    Optional<StudentEntity> findById(Long id);

    @EntityGraph(attributePaths = {
            "user",
            "enrollments",
            "enrollments.group",
            "enrollments.group.academicClass",
            "enrollments.group.academicClass.program",
            "enrollments.group.academicClass.speciality"
    })
    Optional<StudentEntity> findByUser_EmailIgnoreCase(String email);


}
