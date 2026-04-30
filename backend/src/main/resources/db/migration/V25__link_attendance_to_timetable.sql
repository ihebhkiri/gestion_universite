ALTER TABLE attendance_sessions
ADD COLUMN timetable_entry_id BIGINT;

ALTER TABLE attendance_sessions
ADD CONSTRAINT fk_attendance_session_timetable
FOREIGN KEY (timetable_entry_id) REFERENCES timetable_entries(id);

CREATE UNIQUE INDEX uq_attendance_timetable_day
ON attendance_sessions (timetable_entry_id, session_date);
