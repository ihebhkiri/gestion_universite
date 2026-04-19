package com.iheb.gestion_universite.evaluation.exam_assignment;

import com.iheb.gestion_universite.evaluation.exam.ExamEntity;
import com.iheb.gestion_universite.teaching.teacher.TeacherEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Table(name = "exams_assignemnt")
@Entity
@Getter
@Setter
public class ExamAssignmentEntity {

    @Id
    @GeneratedValue (strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private ExamEntity exam;

    @ManyToOne
    private TeacherEntity teacher;

    @Enumerated (EnumType.STRING)
    private ExamRole role;
}
