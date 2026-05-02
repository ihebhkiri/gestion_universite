package com.iheb.gestion_universite.evaluation.exam;

import com.iheb.gestion_universite.academic.academic_class.AcademicClassEntity;
import com.iheb.gestion_universite.academic.semester.SemesterEntity;
import com.iheb.gestion_universite.evaluation.grade.entities.GradeEntity;
import com.iheb.gestion_universite.student_managment.student_group.StudentGroupEntity;
import com.iheb.gestion_universite.teaching.course.CourseEntity;
import com.iheb.gestion_universite.teaching.room.RoomEntity;
import com.iheb.gestion_universite.teaching.teacher.TeacherEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
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

    private Double maxScore = 20.0;

    private String title;

    @Enumerated (EnumType.STRING)
    @Column (name = "session_type")
    private SessionType sessionType;

    @Enumerated(EnumType.STRING)
    private ExamStatus status = ExamStatus.PLANNED;

    private LocalDate examDate;

    private LocalTime startTime;

    private LocalTime endTime;

    @Column(length = 1000)
    private String instructions;

    private Instant createdAt;


    @OneToMany (mappedBy = "exam")
    private List<GradeEntity> grades;

    @ManyToOne
    @JoinColumn (name = "course_id", nullable = false)
    private CourseEntity course;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "class_id")
    private AcademicClassEntity academicClass;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id")
    private StudentGroupEntity studentGroup;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id")
    private RoomEntity room;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supervisor_id")
    private TeacherEntity supervisor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "semester_id")
    private SemesterEntity semester;

}

