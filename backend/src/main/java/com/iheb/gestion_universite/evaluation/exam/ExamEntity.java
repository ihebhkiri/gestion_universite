package com.iheb.gestion_universite.evaluation.exam;

import com.iheb.gestion_universite.evaluation.grade.entities.GradeEntity;
import com.iheb.gestion_universite.teaching.course.CourseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.List;

@Entity
@Table (name = "exams")
@Getter
@Setter
public class ExamEntity {

    @Id
    @GeneratedValue (strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated (EnumType.STRING)
    private ExamType type;

    private Double duration;

    private Double weight; // 0.4 ds   0.6 exam  et 0.2 pour le tp

    private String title;

    @Enumerated (EnumType.STRING)
    @Column (name = "session_type")
    private SessionType sessionType;

    private Instant createdAt;


    @OneToMany (mappedBy = "exam")
    private List<GradeEntity> grades;

    @ManyToOne
    @JoinColumn (name = "course_id", nullable = false)
    private CourseEntity course;

}

