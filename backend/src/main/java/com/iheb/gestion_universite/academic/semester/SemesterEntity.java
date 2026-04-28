package com.iheb.gestion_universite.academic.semester;

import com.iheb.gestion_universite.academic.academic_year.AcademicYearEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Getter
@Setter
@Table(name = "semesters")
public class SemesterEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;                 // S1, S2

    @ManyToOne
    @JoinColumn(name = "academic_year_id")
    private AcademicYearEntity academicYear;

    private LocalDate startDate;

    private LocalDate endDate;


    @Enumerated(EnumType.STRING)
    private SemesterStatus status = SemesterStatus.PLANNED;

    private LocalDate examStartDate;

    private LocalDate examEndDate;

    private String description;
}