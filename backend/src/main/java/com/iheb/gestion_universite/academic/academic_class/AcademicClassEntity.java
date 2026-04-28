package com.iheb.gestion_universite.academic.academic_class;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.iheb.gestion_universite.academic.academic_year.AcademicYearEntity;
import com.iheb.gestion_universite.academic.program.ProgramEntity;
import com.iheb.gestion_universite.academic.speciality.SpecialityEntity;
import com.iheb.gestion_universite.student_managment.student_group.StudentGroupEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.Set;

@Entity
@Getter
@Setter
@Table(name = "classes")
public class AcademicClassEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private int level;              // 4

    @Enumerated(EnumType.STRING)
    private Session session;        // JOUR / SOIR

    @Column(unique = true)
    private String code;            // généré: ING-4-J-GLSI

    @ManyToOne
    @JoinColumn(name = "program_id")
    private ProgramEntity program;

    @ManyToOne
    @JoinColumn(name = "speciality_id")
    private SpecialityEntity speciality;

    @ManyToOne
    @JoinColumn(name = "academic_year_id")
    private AcademicYearEntity academicYear;

    @JsonIgnore
    @OneToMany(mappedBy = "academicClass")
    private Set<StudentGroupEntity> groups;

    @PrePersist
    @PreUpdate
    public void generateCode() {
        String sessionInitial = (session == Session.JOUR) ? "J" : "S";
        String programCode = (program != null) ? program.getCode() : "?";
        String specCode = (speciality != null) ? speciality.getCode() : "?";
        this.code = programCode + "-" + level + "-" + sessionInitial + "-" + specCode;
    }
}
