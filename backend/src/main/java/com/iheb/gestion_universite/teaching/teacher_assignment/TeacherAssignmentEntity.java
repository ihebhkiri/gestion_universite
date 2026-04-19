package com.iheb.gestion_universite.teaching.teacher_assignment;

import com.iheb.gestion_universite.academic.academic_class.AcademicClassEntity;
import com.iheb.gestion_universite.academic.semester.SemesterEntity;
import com.iheb.gestion_universite.teaching.course.CourseEntity;
import com.iheb.gestion_universite.teaching.teacher.TeacherEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table (name = "teachers_assignment",
        uniqueConstraints = @UniqueConstraint (columnNames = {"teacher_id", "course_id", "semester_id", "class_id"}))
public class TeacherAssignmentEntity {

    @Id
    @GeneratedValue (strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn (name = "course_id")
    private CourseEntity course;

    @ManyToOne
    @JoinColumn (name = "teacher_id")
    private TeacherEntity teacher;

    @ManyToOne
    @JoinColumn (name = "semester_id")

    private SemesterEntity semester;

    @ManyToOne
    @JoinColumn (name = "class_id")
    private AcademicClassEntity academicClassEntity;

}
