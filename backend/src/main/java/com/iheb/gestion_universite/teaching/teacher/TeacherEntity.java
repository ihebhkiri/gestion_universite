package com.iheb.gestion_universite.teaching.teacher;

import com.iheb.gestion_universite.academic.department.DepartmentEntity;
import com.iheb.gestion_universite.security.user.UserEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.time.LocalDate;

@Entity
@Getter
@Setter
@Table(name = "teachers")
public class TeacherEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String matricule;

    private String firstName;

    private String lastName;

    private String gender;

    @Column(unique = true)
    private String cin;

    private String phone;

    private String grade;

    private LocalDate hireDate;

    @ManyToOne
    @JoinColumn(name = "id_department")
    private DepartmentEntity department;

    @OneToOne(cascade = {CascadeType.PERSIST,
            CascadeType.MERGE})
    private UserEntity user;

    private Instant createdAt = Instant.now();

}
