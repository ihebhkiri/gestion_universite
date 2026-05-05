package com.iheb.gestion_universite.announcement.repository;

import com.iheb.gestion_universite.announcement.AnnouncementReadReceiptEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.Set;

public interface AnnouncementReadReceiptRepository extends JpaRepository<AnnouncementReadReceiptEntity, Long> {

    Optional<AnnouncementReadReceiptEntity> findByAnnouncementIdAndStudentId(Long announcementId, Long studentId);

    Set<AnnouncementReadReceiptEntity> findByStudentId(Long studentId);
}
