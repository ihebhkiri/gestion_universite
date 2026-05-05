package com.iheb.gestion_universite.evaluation.result_management.entity;

import com.iheb.gestion_universite.core.base_entity.BaseEntity;
import com.iheb.gestion_universite.evaluation.exam.ExamEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table (name = "result_sessions")
@Getter
@Setter
public class ResultSessionEntity extends BaseEntity {

    @Id
    @GeneratedValue (strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne (fetch = FetchType.LAZY)
    @JoinColumn (name = "exam_id", nullable = false, unique = true)
    private ExamEntity exam;

    @Enumerated (EnumType.STRING)
    @Column (nullable = false)
    private ResultSessionStatus status = ResultSessionStatus.DRAFT;


    @Column (name = "validated_at")
    private Instant validatedAt;

    @Column (name = "published_at")
    private Instant publishedAt;

}
