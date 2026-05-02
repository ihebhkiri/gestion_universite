package com.iheb.gestion_universite.evaluation.grade.entities;


import com.iheb.gestion_universite.evaluation.exam.ExamEntity;
import com.iheb.gestion_universite.student_managment.student.StudentEntity;
import jakarta.persistence.*;
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

    private Double score;

    private Double maxScore = 20.0;

    @Column(length = 1000)
    private String comment;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private GradeStatus status = GradeStatus.NOT_GRADED;

    private Instant gradedAt;

    private Instant updatedAt;

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

    @PreUpdate
    public void preUpdate()
    {
        this.updatedAt = Instant.now();
    }

}
