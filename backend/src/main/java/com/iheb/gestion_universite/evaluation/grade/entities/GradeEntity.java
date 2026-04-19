package com.iheb.gestion_universite.evaluation.grade.entities;


import com.iheb.gestion_universite.evaluation.exam.ExamEntity;
import com.iheb.gestion_universite.student_managment.student.StudentEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.*;

import java.time.Instant;

@Entity
@Table (name = "grades")
@Getter
@Setter
public class GradeEntity {

    @Id
    @GeneratedValue (strategy = GenerationType.IDENTITY)
    private Long id;

    @Min (0)
    @Max (20)
    private Double score;


    @ManyToOne
    @JoinColumn (name = "student_id", nullable = false)
    private StudentEntity student;

    @ManyToOne
    @JoinColumn (name = "exam_id", nullable = false)
    private ExamEntity exam;
    @Column (name = "created_at", nullable = false)
    private Instant createdAt;
    @PrePersist
    public void prePersist()
    {
        this.createdAt = Instant.now();
    }


}
