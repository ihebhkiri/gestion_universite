package com.iheb.gestion_universite.academic.department;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.iheb.gestion_universite.academic.program.ProgramEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.Set;

@Entity
@Getter
@Setter
@Table(name = "departments")
public class DepartmentEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String code;            // INFO, ELEC

    @Column(unique = true, nullable = false)
    private String name;

    @JsonIgnore
    @OneToMany(mappedBy = "department")
    private Set<ProgramEntity> programs;
}
