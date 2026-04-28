package com.iheb.gestion_universite.teaching.course;


import com.iheb.gestion_universite.teaching.subject.SubjectEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table (name = "courses")
@Getter
@Setter
public class CourseEntity {

    @Id
    @GeneratedValue (strategy = GenerationType.IDENTITY)
    private Long id;

    @Column (unique = true)
    private String code;

    private String title;

    private Integer credits;

    private Double coefficient;

    private Integer hours;

    @ManyToOne
    @JoinColumn (name = "subject_id")
    private SubjectEntity subject;


}
