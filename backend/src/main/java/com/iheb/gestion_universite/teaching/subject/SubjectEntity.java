package com.iheb.gestion_universite.teaching.subject;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@Table (name = "subjects")
public class SubjectEntity {

    @Id
    @GeneratedValue (strategy = GenerationType.IDENTITY)
    private Long id;

    private String subjectName;




}

