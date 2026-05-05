package com.iheb.gestion_universite.announcement.repository;

import com.iheb.gestion_universite.announcement.AnnouncementEntity;
import com.iheb.gestion_universite.announcement.AnnouncementPriority;
import com.iheb.gestion_universite.announcement.AnnouncementStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface AnnouncementRepository extends JpaRepository<AnnouncementEntity, Long> {

    List<AnnouncementEntity> findByStatusNotOrderByPinnedDescPublishedAtDescScheduledAtDescCreatedAtDesc(AnnouncementStatus status);

    @Query("""
            select a from AnnouncementEntity a
            where a.status <> com.iheb.gestion_universite.announcement.AnnouncementStatus.ARCHIVED
            and (
                a.status = com.iheb.gestion_universite.announcement.AnnouncementStatus.PUBLISHED
                or (a.status = com.iheb.gestion_universite.announcement.AnnouncementStatus.SCHEDULED and a.scheduledAt <= :now)
            )
            order by a.pinned desc, a.publishedAt desc, a.scheduledAt desc, a.createdAt desc
            """)
    List<AnnouncementEntity> findVisibleAnnouncements(Instant now);

    @Query("""
            select a from AnnouncementEntity a
            where a.status <> com.iheb.gestion_universite.announcement.AnnouncementStatus.ARCHIVED
            and (
                a.status = com.iheb.gestion_universite.announcement.AnnouncementStatus.PUBLISHED
                or (a.status = com.iheb.gestion_universite.announcement.AnnouncementStatus.SCHEDULED and a.scheduledAt <= :now)
            )
            and (
                a.audienceType = com.iheb.gestion_universite.announcement.AnnouncementAudienceType.ALL
                or (a.audienceType = com.iheb.gestion_universite.announcement.AnnouncementAudienceType.STUDENT and a.audienceId = :studentId)
            )
            order by a.pinned desc, a.publishedAt desc, a.scheduledAt desc, a.createdAt desc
            """)
    List<AnnouncementEntity> findVisibleForStudent(Long studentId, Instant now);

    long countByStatus(AnnouncementStatus status);

    long countByPriority(AnnouncementPriority priority);

    @Query("select coalesce(sum(a.viewCount), 0) from AnnouncementEntity a")
    long sumViewCount();

    Optional<AnnouncementEntity> findFirstByStatusAndScheduledAtAfterOrderByScheduledAtAsc(AnnouncementStatus status, Instant now);

    long countByStatusNotAndExpiresAtBetween(AnnouncementStatus status, Instant from, Instant to);
}
