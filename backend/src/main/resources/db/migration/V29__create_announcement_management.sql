CREATE TABLE IF NOT EXISTS announcements (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(160) NOT NULL,
    content VARCHAR(4000) NOT NULL,
    type VARCHAR(30) NOT NULL DEFAULT 'INFO',
    priority VARCHAR(30) NOT NULL DEFAULT 'NORMAL',
    status VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
    audience_type VARCHAR(30) NOT NULL DEFAULT 'ALL',
    audience_id BIGINT NULL,
    pinned BOOLEAN NOT NULL DEFAULT FALSE,
    view_count BIGINT NOT NULL DEFAULT 0,
    scheduled_at TIMESTAMP NULL,
    published_at TIMESTAMP NULL,
    expires_at TIMESTAMP NULL,
    archived_at TIMESTAMP NULL,
    archive_reason VARCHAR(500) NULL,
    attachment_url VARCHAR(4000) NULL,
    external_link VARCHAR(700) NULL,
    created_by VARCHAR(255) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL
);

CREATE TABLE IF NOT EXISTS announcement_read_receipts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    announcement_id BIGINT NOT NULL,
    student_id BIGINT NOT NULL,
    read_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_announcement_read_student UNIQUE (announcement_id, student_id),
    CONSTRAINT fk_announcement_read_announcement
        FOREIGN KEY (announcement_id)
            REFERENCES announcements(id)
);

CREATE INDEX idx_announcements_status ON announcements(status);
CREATE INDEX idx_announcements_scheduled_at ON announcements(scheduled_at);
CREATE INDEX idx_announcements_audience ON announcements(audience_type, audience_id);
