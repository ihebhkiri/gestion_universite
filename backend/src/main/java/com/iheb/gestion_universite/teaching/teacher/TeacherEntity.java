package com.iheb.gestion_universite.teaching.teacher;

import com.iheb.gestion_universite.academic.department.DepartmentEntity;
import com.iheb.gestion_universite.academic.speciality.SpecialityEntity;
import com.iheb.gestion_universite.core.base_entity.BaseEntity;
import com.iheb.gestion_universite.security.user.UserEntity;
import com.iheb.gestion_universite.teaching.teacher_assignment.TeacherAssignmentEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@Entity
@Getter
@Setter
@Table(name = "teachers")
public class TeacherEntity extends BaseEntity {

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

    @Enumerated(EnumType.STRING)
    private TeacherStatus status = TeacherStatus.ACTIVE;

    private LocalDate hireDate;

    @ManyToOne
    @JoinColumn(name = "id_department")
    private DepartmentEntity department;

    @ManyToOne
    @JoinColumn(name = "speciality_id")
    private SpecialityEntity speciality;

    @OneToOne(cascade = {CascadeType.PERSIST,
            CascadeType.MERGE})
    private UserEntity user;

    @OneToMany(mappedBy = "teacher", cascade = CascadeType.REMOVE, orphanRemoval = true)
    private Set<TeacherAssignmentEntity> assignments = new HashSet<>();


}
