CREATE TABLE IF NOT EXISTS result_sessions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    exam_id BIGINT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL,
    validated_at TIMESTAMP NULL,
    published_at TIMESTAMP NULL,

    CONSTRAINT uq_result_sessions_exam UNIQUE (exam_id),
    CONSTRAINT fk_result_sessions_exam
        FOREIGN KEY (exam_id)
            REFERENCES exams(id)
);

ALTER TABLE grades ADD COLUMN IF NOT EXISTS result_status VARCHAR(30) NOT NULL DEFAULT 'PENDING';
ALTER TABLE grades ADD COLUMN IF NOT EXISTS weighted_score DOUBLE;
ALTER TABLE grades ADD COLUMN IF NOT EXISTS mention VARCHAR(100);
ALTER TABLE grades ADD COLUMN IF NOT EXISTS published BOOLEAN NOT NULL DEFAULT FALSE;

UPDATE grades
SET result_status = CASE
    WHEN score IS NULL THEN 'PENDING'
    WHEN score >= 10 THEN 'PASSED'
    ELSE 'FAILED'
END
WHERE result_status = 'PENDING';
