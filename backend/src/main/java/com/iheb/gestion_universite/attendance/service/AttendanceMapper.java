package com.iheb.gestion_universite.attendance.service;

import com.iheb.gestion_universite.academic.academic_class.AcademicClassEntity;
import com.iheb.gestion_universite.attendance.dto.AttendanceRecordResponse;
import com.iheb.gestion_universite.attendance.dto.AttendanceSessionResponse;
import com.iheb.gestion_universite.attendance.dto.AttendanceSummaryResponse;
import com.iheb.gestion_universite.attendance.entity.AttendanceRecordEntity;
import com.iheb.gestion_universite.attendance.entity.AttendanceSessionEntity;
import com.iheb.gestion_universite.attendance.entity.AttendanceStatus;
import com.iheb.gestion_universite.student_managment.student.StudentEntity;
import com.iheb.gestion_universite.student_managment.student_enrollment.EnrollmentStatus;
import com.iheb.gestion_universite.student_managment.student_enrollment.StudentEnrollmentEntity;
import com.iheb.gestion_universite.teaching.course.CourseEntity;
import com.iheb.gestion_universite.teaching.teacher.TeacherEntity;
import com.iheb.gestion_universite.teaching.timetable.TimetableEntity;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Objects;

@Component
public class AttendanceMapper {

    public AttendanceSessionResponse toSessionResponse(AttendanceSessionEntity session) {
        return toSessionResponse(session, session.getRecords());
    }

    public AttendanceSessionResponse toSessionResponse(AttendanceSessionEntity session, List<AttendanceRecordEntity> records) {
        CourseEntity course = session.getCourse();
        AcademicClassEntity academicClass = session.getAcademicClass();
        TeacherEntity teacher = session.getTeacher();
        TimetableEntity timetableEntry = session.getTimetableEntry();

        return new AttendanceSessionResponse(
                session.getId(),
                session.getTitle(),
                session.getSessionCode(),
                session.getSessionDate(),
                session.getStartTime(),
                session.getEndTime(),
                session.getStatus(),
                course != null ? course.getId() : null,
                course != null ? course.getCode() : null,
                course != null ? course.getTitle() : null,
                academicClass != null ? academicClass.getId() : null,
                academicClass != null ? academicClass.getCode() : null,
                teacher != null ? teacher.getId() : null,
                teacherName(teacher),
                timetableEntry != null ? timetableEntry.getId() : null,
                timetableEntry != null ? timetableEntry.getStartTime() : null,
                timetableEntry != null ? timetableEntry.getEndTime() : null,
                toSummary(records)
        );
    }

    public AttendanceRecordResponse toRecordResponse(AttendanceRecordEntity record) {
        StudentEntity student = record.getStudent();
        return new AttendanceRecordResponse(
                record.getId(),
                student != null ? student.getId() : null,
                student != null ? student.getMatricule() : null,
                studentName(student),
                groupName(student),
                record.getStatus(),
                record.getNote(),
                record.getMarkedAt()
        );
    }

    public AttendanceSummaryResponse toSummary(List<AttendanceRecordEntity> records) {
        long total = records.size();
        long present = count(records, AttendanceStatus.PRESENT);
        long late = count(records, AttendanceStatus.LATE);
        long absent = count(records, AttendanceStatus.ABSENT);
        long excused = count(records, AttendanceStatus.EXCUSED);
        double attendanceRate = total == 0 ? 0 : Math.round(((present + late) * 10000.0) / total) / 100.0;
        return new AttendanceSummaryResponse(total, present, absent, late, excused, attendanceRate);
    }

    private long count(List<AttendanceRecordEntity> records, AttendanceStatus status) {
        return records.stream()
                .filter(record -> record.getStatus() == status)
                .count();
    }

    private String teacherName(TeacherEntity teacher) {
        if (teacher == null) return null;
        return (Objects.toString(teacher.getFirstName(), "") + " " + Objects.toString(teacher.getLastName(), "")).trim();
    }

    private String studentName(StudentEntity student) {
        if (student == null) return null;
        return (Objects.toString(student.getFirstName(), "") + " " + Objects.toString(student.getLastName(), "")).trim();
    }

    private String groupName(StudentEntity student) {
        if (student == null || student.getEnrollments() == null) return null;
        return student.getEnrollments().stream()
                .filter(enrollment -> enrollment.getStatus() == EnrollmentStatus.CONFIRMED)
                .map(StudentEnrollmentEntity::getGroup)
                .filter(Objects::nonNull)
                .map(group -> group.getName())
                .findFirst()
                .orElse(null);
    }
}
