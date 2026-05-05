package com.iheb.gestion_universite.announcement.dto;

import java.time.Instant;

public record PublishAnnouncementRequest(
        Instant scheduledAt
) {
}
