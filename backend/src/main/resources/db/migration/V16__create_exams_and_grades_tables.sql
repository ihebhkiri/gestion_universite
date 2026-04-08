CREATE TABLE exams (
                       id BIGINT AUTO_INCREMENT PRIMARY KEY,
                       coefficient DOUBLE,
                       type VARCHAR(50),
                       duration DOUBLE,
                       title VARCHAR(255),
                       created_at TIMESTAMP,
                       subject_id BIGINT NOT NULL,

                       CONSTRAINT fk_exam_subject
                           FOREIGN KEY (subject_id)
                               REFERENCES subjects(id)
);
CREATE TABLE exam_teachers (
                               exam_id BIGINT NOT NULL,
                               teacher_id BIGINT NOT NULL,

                               PRIMARY KEY (exam_id, teacher_id),

                               CONSTRAINT fk_exam_teacher_exam
                                   FOREIGN KEY (exam_id)
                                       REFERENCES exams(id),

                               CONSTRAINT fk_exam_teacher_teacher
                                   FOREIGN KEY (teacher_id)
                                       REFERENCES teachers(id)
);
CREATE TABLE grades (
                        id BIGINT AUTO_INCREMENT PRIMARY KEY,
                        score DOUBLE,

                        student_id BIGINT NOT NULL,
                        exam_id BIGINT NOT NULL,

                        CONSTRAINT fk_grade_student
                            FOREIGN KEY (student_id)
                                REFERENCES students(id),

                        CONSTRAINT fk_grade_exam
                            FOREIGN KEY (exam_id)
                                REFERENCES exams(id)
);