package com.iheb.gestion_universite.student_managment.student;


import com.fasterxml.jackson.annotation.JsonIgnore;
import com.iheb.gestion_universite.core.base_entity.BaseEntity;
import com.iheb.gestion_universite.student_managment.student_enrollment.StudentEnrollmentEntity;
import com.iheb.gestion_universite.security.user.UserEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Entity
@Table(name = "students")
public class StudentEntity extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String matricule;

    private String firstName;

    private String lastName;

    private String gender;

    @Column(unique = true)
    private String cin;

    private String phone;

    private String profileImage;

    @OneToOne(cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinColumn(name = "user_id")
    private UserEntity user;

    @JsonIgnore
    @OneToMany(mappedBy = "student", cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @OrderBy("enrollmentDate ASC")
    private List<StudentEnrollmentEntity> enrollments = new ArrayList<>();

    private LocalDate enrollmentDate; // date elli 3mal feha etudiant inscrit fel fac
}
