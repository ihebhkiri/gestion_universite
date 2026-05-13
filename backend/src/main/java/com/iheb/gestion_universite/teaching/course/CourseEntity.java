package com.iheb.gestion_universite.teaching.course;


import com.iheb.gestion_universite.teaching.subject.SubjectEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.Date;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table (name = "courses")
@Getter
@Setter
public class CourseEntity  {

    @Id
    @GeneratedValue (strategy = GenerationType.IDENTITY)
    private Long id;

    @Column (unique = true)
    private String code;

    private String title;

    private Integer credits;

    private Double coefficient;

    private Integer hours;

    @Temporal(TemporalType.DATE)
    private Date publishedAt;

    @ManyToOne
    @JoinColumn (name = "subject_id")
    private SubjectEntity subject;

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<CourseAttachmentEntity> attachments = new HashSet<>();

    @PrePersist
    void prePersist() {
        if (publishedAt == null) {
            publishedAt = new Date();
        }
    }
}
