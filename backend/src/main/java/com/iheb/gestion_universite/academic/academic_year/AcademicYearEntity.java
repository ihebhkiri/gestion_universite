package com.iheb.gestion_universite.academic.academic_year;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Getter
@Setter
@Table(name = "academic_years")
public class AcademicYearEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String label;           // 2025-2026

    private LocalDate startDate;

    private LocalDate endDate;

    private boolean active;
}
