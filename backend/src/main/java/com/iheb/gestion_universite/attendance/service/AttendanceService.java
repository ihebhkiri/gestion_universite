package com.iheb.gestion_universite.attendance.service;

import com.iheb.gestion_universite.academic.academic_class.AcademicClassEntity;
import com.iheb.gestion_universite.academic.academic_class.ClassService;
import com.iheb.gestion_universite.attendance.dto.AttendanceSessionDetailsResponse;
import com.iheb.gestion_universite.attendance.dto.AttendanceSessionResponse;
import com.iheb.gestion_universite.attendance.dto.AttendanceSlotResponse;
import com.iheb.gestion_universite.attendance.dto.AttendanceSummaryResponse;
import com.iheb.gestion_universite.attendance.dto.StartAttendanceSessionRequest;
import com.iheb.gestion_universite.attendance.dto.UpdateAttendanceRecordRequest;
import com.iheb.gestion_universite.attendance.entity.AttendanceRecordEntity;
import com.iheb.gestion_universite.attendance.entity.AttendanceSessionEntity;
import com.iheb.gestion_universite.attendance.entity.AttendanceSessionStatus;
import com.iheb.gestion_universite.attendance.exception.AttendanceAlreadyStartedException;
import com.iheb.gestion_universite.attendance.repository.AttendanceRecordRepository;
import com.iheb.gestion_universite.attendance.repository.AttendanceSessionRepository;
import com.iheb.gestion_universite.student_managment.student.StudentEntity;
import com.iheb.gestion_universite.student_managment.student_enrollment.EnrollmentRepo;
import com.iheb.gestion_universite.student_managment.student_enrollment.EnrollmentStatus;
import com.iheb.gestion_universite.teaching.course.CourseEntity;
import com.iheb.gestion_universite.teaching.course.CourseService;
import com.iheb.gestion_universite.teaching.teacher.AdminTeachersService;
import com.iheb.gestion_universite.teaching.teacher.TeacherEntity;
import com.iheb.gestion_universite.teaching.timetable.TimetableEntity;
import com.iheb.gestion_universite.teaching.timetable.TimetableRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Locale;
import java.util.Objects;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class AttendanceService {

    private final AttendanceSessionRepository sessionRepository;
    private final AttendanceRecordRepository recordRepository;
    private final EnrollmentRepo enrollmentRepo;
    private final CourseService courseService;
    private final ClassService classService;
    private final AdminTeachersService teacherService;
    private final TimetableRepository timetableRepository;
    private final AttendanceMapper mapper;

    public AttendanceSessionDetailsResponse startSession(StartAttendanceSessionRequest request) {
        TimetableEntity timetableEntry = timetableRepository.findById(request.timetableEntryId())
                .orElseThrow(() -> new IllegalArgumentException("Timetable entry not found with id: " + request.timetableEntryId()));
        LocalDate today = LocalDate.now();
        LocalTime now = LocalTime.now().withNano(0);
        validateSlotCanStart(timetableEntry, today, now);

        if (sessionRepository.existsByTimetableEntryIdAndSessionDate(timetableEntry.getId(), today)) {
            throw new AttendanceAlreadyStartedException("Attendance was already started for this course slot today");
        }

        CourseEntity course = timetableEntry.getCourse();
        AcademicClassEntity academicClass = timetableEntry.getAcademicClass();
        TeacherEntity teacher = timetableEntry.getTeacher();
        List<StudentEntity> students = findClassStudents(academicClass.getId());

        AttendanceSessionEntity session = new AttendanceSessionEntity();
        session.setTitle(resolveTitle(request.title(), course, academicClass));
        session.setSessionCode(generateSessionCode());
        session.setSessionDate(today);
        session.setStartTime(now);
        session.setCourse(course);
        session.setAcademicClass(academicClass);
        session.setTeacher(teacher);
        session.setTimetableEntry(timetableEntry);

        students.forEach(student -> {
            AttendanceRecordEntity record = new AttendanceRecordEntity();
            record.setSession(session);
            record.setStudent(student);
            session.getRecords().add(record);
        });

        return toDetails(sessionRepository.save(session));
    }

    public List<AttendanceSessionResponse> getSessions(Long classId, Long courseId) {
        List<AttendanceSessionEntity> sessions;
        if (classId != null && courseId != null) {
            sessions = sessionRepository.findByAcademicClassIdAndCourseIdOrderBySessionDateDescStartTimeDesc(classId, courseId);
        } else if (classId != null) {
            sessions = sessionRepository.findByAcademicClassIdOrderBySessionDateDescStartTimeDesc(classId);
        } else if (courseId != null) {
            sessions = sessionRepository.findByCourseIdOrderBySessionDateDescStartTimeDesc(courseId);
        } else {
            sessions = sessionRepository.findAllByOrderBySessionDateDescStartTimeDesc();
        }
        return sessions.stream().map(mapper::toSessionResponse).toList();
    }

    public AttendanceSessionDetailsResponse getDetails(Long sessionId) {
        return toDetails(getSessionEntity(sessionId));
    }

    public AttendanceSessionDetailsResponse updateRecord(Long recordId, UpdateAttendanceRecordRequest request) {
        AttendanceRecordEntity record = recordRepository.findById(recordId)
                .orElseThrow(() -> new IllegalArgumentException("Attendance record not found with id: " + recordId));
        if (record.getSession().getStatus() == AttendanceSessionStatus.CLOSED) {
            throw new IllegalArgumentException("Closed attendance sessions cannot be edited");
        }
        validateSessionIsInsideSlot(record.getSession());
        record.setStatus(request.status());
        record.setNote(request.note());
        record.setMarkedAt(Instant.now());
        return toDetails(recordRepository.save(record).getSession());
    }

    public AttendanceSessionDetailsResponse closeSession(Long sessionId) {
        AttendanceSessionEntity session = getSessionEntity(sessionId);
        session.setStatus(AttendanceSessionStatus.CLOSED);
        session.setEndTime(LocalTime.now().withNano(0));
        return toDetails(sessionRepository.save(session));
    }

    public AttendanceSummaryResponse getSummary(Long sessionId) {
        return mapper.toSummary(getSessionEntity(sessionId).getRecords());
    }

    public List<AttendanceSlotResponse> getAvailableSlots() {
        LocalDate today = LocalDate.now();
        LocalTime now = LocalTime.now().withNano(0);
        return timetableRepository.findByDayOfWeek(today.getDayOfWeek())
                .stream()
                .filter(entry -> !now.isBefore(entry.getStartTime()) && now.isBefore(entry.getEndTime()))
                .filter(entry -> !sessionRepository.existsByTimetableEntryIdAndSessionDate(entry.getId(), today))
                .map(this::toSlotResponse)
                .toList();
    }

    private AttendanceSessionDetailsResponse toDetails(AttendanceSessionEntity session) {
        List<AttendanceRecordEntity> records = recordRepository.findBySessionIdOrderByStudentName(session.getId());
        return new AttendanceSessionDetailsResponse(
                mapper.toSessionResponse(session, records),
                records.stream().map(mapper::toRecordResponse).toList()
        );
    }

    private AttendanceSessionEntity getSessionEntity(Long sessionId) {
        return sessionRepository.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Attendance session not found with id: " + sessionId));
    }

    private List<StudentEntity> findClassStudents(Long classId) {
        return enrollmentRepo.findByGroupAcademicClassIdAndStatus(classId, EnrollmentStatus.CONFIRMED)
                .stream()
                .map(enrollment -> enrollment.getStudent())
                .toList();
    }

    private void validateSlotCanStart(TimetableEntity timetableEntry, LocalDate today, LocalTime now) {
        if (timetableEntry.getCourse() == null || timetableEntry.getAcademicClass() == null) {
            throw new IllegalArgumentException("This timetable slot is missing course or class data");
        }
        if (timetableEntry.getDayOfWeek() != today.getDayOfWeek()) {
            throw new IllegalArgumentException("Attendance can only start on the scheduled course day");
        }
        if (now.isBefore(timetableEntry.getStartTime()) || !now.isBefore(timetableEntry.getEndTime())) {
            throw new IllegalArgumentException("Attendance can only start during the scheduled course time");
        }
    }

    private void validateSessionIsInsideSlot(AttendanceSessionEntity session) {
        TimetableEntity timetableEntry = session.getTimetableEntry();
        if (timetableEntry == null) return;
        LocalDate today = LocalDate.now();
        LocalTime now = LocalTime.now().withNano(0);
        if (!session.getSessionDate().equals(today)
                || timetableEntry.getDayOfWeek() != today.getDayOfWeek()
                || now.isBefore(timetableEntry.getStartTime())
                || !now.isBefore(timetableEntry.getEndTime())) {
            throw new IllegalArgumentException("Attendance can only be updated during the scheduled course time");
        }
    }

    private String resolveTitle(String title, CourseEntity course, AcademicClassEntity academicClass) {
        if (title != null && !title.isBlank()) return title.trim();
        return "%s - %s".formatted(course.getCode(), academicClass.getCode());
    }

    private AttendanceSlotResponse toSlotResponse(TimetableEntity entry) {
        CourseEntity course = entry.getCourse();
        AcademicClassEntity academicClass = entry.getAcademicClass();
        TeacherEntity teacher = entry.getTeacher();
        return new AttendanceSlotResponse(
                entry.getId(),
                entry.getDayOfWeek(),
                entry.getStartTime(),
                entry.getEndTime(),
                entry.getSessionType(),
                course != null ? course.getId() : null,
                course != null ? course.getCode() : null,
                course != null ? course.getTitle() : null,
                academicClass != null ? academicClass.getId() : null,
                academicClass != null ? academicClass.getCode() : null,
                teacher != null ? teacher.getId() : null,
                teacherName(teacher),
                entry.getRoom() != null ? entry.getRoom().getId() : null,
                entry.getRoom() != null ? entry.getRoom().getCode() : null,
                entry.getRoom() != null ? entry.getRoom().getName() : null
        );
    }

    private String teacherName(TeacherEntity teacher) {
        if (teacher == null) return null;
        return (Objects.toString(teacher.getFirstName(), "") + " " + Objects.toString(teacher.getLastName(), "")).trim();
    }

    private String generateSessionCode() {
        String code;
        do {
            code = UUID.randomUUID().toString().replace("-", "").substring(0, 6).toUpperCase(Locale.ROOT);
        } while (sessionRepository.findBySessionCode(code).isPresent());
        return code;
    }
}
