package com.iheb.gestion_universite.academic.speciality;

import com.iheb.gestion_universite.academic.program.ProgramEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "specialities")
public class SpecialityEntity { // GLSI SSIR SDIA

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String code;            // GLSI

    private String name;

    @ManyToOne
    @JoinColumn(name = "program_id")
    private ProgramEntity program;
}
