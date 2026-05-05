package com.iheb.gestion_universite.announcement;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(
        name = "announcement_read_receipts",
        uniqueConstraints = @UniqueConstraint(name = "uq_announcement_read_student", columnNames = {"announcement_id", "student_id"})
)
@Getter
@Setter
public class AnnouncementReadReceiptEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "announcement_id", nullable = false)
    private AnnouncementEntity announcement;

    @jakarta.persistence.Column(name = "student_id", nullable = false)
    private Long studentId;

    private Instant readAt;
}
