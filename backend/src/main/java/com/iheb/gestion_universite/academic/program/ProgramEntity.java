package com.iheb.gestion_universite.academic.program;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.iheb.gestion_universite.academic.department.DepartmentEntity;
import com.iheb.gestion_universite.academic.speciality.SpecialityEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.Set;

@Entity
@Getter
@Setter
@Table(name = "programs")
public class ProgramEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String code;            // ING wela prepa

    @Column(nullable = false)
    private String name;

    @ManyToOne
    @JoinColumn(name = "department_id")
    private DepartmentEntity department;

    @JsonIgnore
    @OneToMany(mappedBy = "program")
    private Set<SpecialityEntity> specialities;
}
