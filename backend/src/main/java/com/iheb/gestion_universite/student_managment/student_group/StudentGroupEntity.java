package com.iheb.gestion_universite.student_managment.student_group;

import com.iheb.gestion_universite.academic.academic_class.AcademicClassEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table (name = "students_groups")
public class StudentGroupEntity { // A B C

    @Id
    @GeneratedValue (strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private int capacity;

    @ManyToOne
    @JoinColumn (name = "academic_class_id")
    private AcademicClassEntity academicClass;

}
