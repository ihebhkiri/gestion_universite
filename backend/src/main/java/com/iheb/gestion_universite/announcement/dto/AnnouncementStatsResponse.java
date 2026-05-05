package com.iheb.gestion_universite.announcement.dto;

import java.time.Instant;

public record AnnouncementStatsResponse(
        long published,
        long scheduled,
        long urgent,
        long archived,
        long totalViews,
        Instant nextScheduledAt,
        long expiringSoonCount
) {
}
