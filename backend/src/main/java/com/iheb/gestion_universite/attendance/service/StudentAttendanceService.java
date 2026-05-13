package com.iheb.gestion_universite.attendance.service;

import com.iheb.gestion_universite.attendance.analytics.dto.AttendanceAnalyticsSummaryResponse;
import com.iheb.gestion_universite.attendance.analytics.dto.StudentAttendanceProfileResponse;
import com.iheb.gestion_universite.attendance.analytics.service.AttendanceAnalyticsService;
import com.iheb.gestion_universite.attendance.dto.StudentAttendanceResponse;
import com.iheb.gestion_universite.attendance.dto.StudentAttendanceSummaryDto;
import com.iheb.gestion_universite.attendance.dto.StudentTopAbsenceDto;
import com.iheb.gestion_universite.attendance.entity.AttendanceRecordEntity;
import com.iheb.gestion_universite.attendance.entity.AttendanceStatus;
import com.iheb.gestion_universite.attendance.repository.AttendanceRecordRepository;
import com.iheb.gestion_universite.core.exceptions.StudentNotFoundException;
import com.iheb.gestion_universite.security.UserPrincipal;
import com.iheb.gestion_universite.student_managment.student.StudentEntity;
import com.iheb.gestion_universite.student_managment.student.StudentRepository;
import com.iheb.gestion_universite.teaching.course.CourseEntity;
import com.iheb.gestion_universite.teaching.room.RoomEntity;
import com.iheb.gestion_universite.teaching.teacher.TeacherEntity;
import com.iheb.gestion_universite.teaching.timetable.TimetableEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StudentAttendanceService {

    private final StudentRepository studentRepository;
    private final AttendanceRecordRepository recordRepository;
    private final AttendanceAnalyticsService analyticsService;

    public Page<StudentAttendanceResponse> getMyAttendance(
            UserPrincipal principal,
            String status,
            String excludeStatus,
            String period,
            Long subjectId,
            Long teacherId,
            LocalDate fromDate,
            LocalDate toDate,
            Pageable pageable
    ) {
        StudentEntity student = resolveStudent(principal);
        List<StudentAttendanceResponse> records = recordRepository.findByStudentIdForStudentAttendance(student.getId())
                .stream()
                .filter(record -> matchesStatus(record, status))
                .filter(record -> doesNotMatchStatus(record, excludeStatus))
                .filter(record -> matchesPeriod(record, period))
                .filter(record -> matchesSubject(record, subjectId))
                .filter(record -> matchesTeacher(record, teacherId))
                .filter(record -> matchesDateRange(record, fromDate, toDate))
                .map(this::toResponse)
                .toList();

        return page(sort(records, pageable), pageable);
    }

    public StudentAttendanceSummaryDto getMySummary(UserPrincipal principal) {
        AttendanceAnalyticsSummaryResponse summary = profile(principal).globalSummary();
        return new StudentAttendanceSummaryDto(
                summary.presentCount(),
                summary.absentCount(),
                summary.lateCount(),
                summary.excusedCount(),
                summary.presenceRate()
        );
    }

    public List<StudentTopAbsenceDto> getTopAbsences(UserPrincipal principal, int limit) {
        int safeLimit = Math.max(1, Math.min(limit, 20));
        return profile(principal).courseSummaries()
                .stream()
                .filter(course -> course.absentCount() > 0)
                .sorted(Comparator
                        .comparingLong((com.iheb.gestion_universite.attendance.analytics.dto.StudentCourseAttendanceResponse course) -> course.absentCount())
                        .reversed()
                        .thenComparing(course -> safe(course.courseTitle()), String.CASE_INSENSITIVE_ORDER))
                .limit(safeLimit)
                .map(course -> new StudentTopAbsenceDto(
                        course.courseId(),
                        displayCourseName(course.courseCode(), course.courseTitle()),
                        course.absentCount()
                ))
                .toList();
    }

    private StudentAttendanceProfileResponse profile(UserPrincipal principal) {
        StudentEntity student = resolveStudent(principal);
        return analyticsService.getStudentProfile(student.getId(), null, null, null, null);
    }

    private StudentEntity resolveStudent(UserPrincipal principal) {
        if (principal == null || isBlank(principal.getUsername())) {
            throw new StudentNotFoundException("Student profile not found");
        }

        return studentRepository.findByUser_EmailIgnoreCase(principal.getUsername())
                .orElseThrow(() -> new StudentNotFoundException("Student profile not found"));
    }

    private StudentAttendanceResponse toResponse(AttendanceRecordEntity record) {
        CourseEntity course = record.getSession().getCourse();
        TeacherEntity teacher = record.getSession().getTeacher();
        TimetableEntity timetableEntry = record.getSession().getTimetableEntry();
        RoomEntity room = timetableEntry != null ? timetableEntry.getRoom() : null;

        return new StudentAttendanceResponse(
                record.getId(),
                course != null ? course.getId() : null,
                course != null ? course.getCode() : null,
                course != null ? course.getTitle() : null,
                course != null && course.getSubject() != null ? course.getSubject().getId() : null,
                course != null && course.getSubject() != null ? course.getSubject().getSubjectName() : null,
                teacher != null ? teacher.getId() : null,
                teacherName(teacher),
                record.getSession().getSessionDate(),
                record.getSession().getStartTime(),
                record.getSession().getEndTime(),
                roomName(room),
                record.getStatus(),
                timetableEntry != null && timetableEntry.getSemester() != null ? timetableEntry.getSemester().getName() : null,
                record.getStatus() == AttendanceStatus.EXCUSED,
                justificationStatus(record.getStatus()),
                record.getMarkedAt()
        );
    }

    private boolean matchesStatus(AttendanceRecordEntity record, String status) {
        if (isBlank(status)) return true;
        String normalized = status.trim().toUpperCase();
        if ("JUSTIFIED".equals(normalized)) normalized = AttendanceStatus.EXCUSED.name();
        return record.getStatus() != null && record.getStatus().name().equals(normalized);
    }

    private boolean doesNotMatchStatus(AttendanceRecordEntity record, String status) {
        if (isBlank(status)) return true;
        String normalized = status.trim().toUpperCase();
        if ("JUSTIFIED".equals(normalized)) normalized = AttendanceStatus.EXCUSED.name();
        return record.getStatus() == null || !record.getStatus().name().equals(normalized);
    }

    private boolean matchesPeriod(AttendanceRecordEntity record, String period) {
        if (isBlank(period)) return true;
        TimetableEntity timetableEntry = record.getSession().getTimetableEntry();
        return timetableEntry != null
                && timetableEntry.getSemester() != null
                && period.equalsIgnoreCase(timetableEntry.getSemester().getName());
    }

    private boolean matchesSubject(AttendanceRecordEntity record, Long subjectId) {
        if (subjectId == null) return true;
        CourseEntity course = record.getSession().getCourse();
        return course != null && course.getSubject() != null && subjectId.equals(course.getSubject().getId());
    }

    private boolean matchesTeacher(AttendanceRecordEntity record, Long teacherId) {
        if (teacherId == null) return true;
        TeacherEntity teacher = record.getSession().getTeacher();
        return teacher != null && teacherId.equals(teacher.getId());
    }

    private boolean matchesDateRange(AttendanceRecordEntity record, LocalDate fromDate, LocalDate toDate) {
        LocalDate sessionDate = record.getSession().getSessionDate();
        if (sessionDate == null) return false;
        if (fromDate != null && sessionDate.isBefore(fromDate)) return false;
        return toDate == null || !sessionDate.isAfter(toDate);
    }

    private List<StudentAttendanceResponse> sort(List<StudentAttendanceResponse> records, Pageable pageable) {
        Comparator<StudentAttendanceResponse> comparator = Comparator
                .comparing(StudentAttendanceResponse::sessionDate, Comparator.nullsLast(Comparator.reverseOrder()))
                .thenComparing(StudentAttendanceResponse::startTime, Comparator.nullsLast(Comparator.reverseOrder()));

        if (pageable != null && pageable.getSort().isSorted()) {
            comparator = null;

            for (Sort.Order order : pageable.getSort()) {
                Comparator<StudentAttendanceResponse> next = comparatorFor(order.getProperty());
                if (order.isDescending()) {
                    next = next.reversed();
                }
                comparator = comparator == null ? next : comparator.thenComparing(next);
            }
        }

        return records.stream().sorted(comparator).toList();
    }

    private Comparator<StudentAttendanceResponse> comparatorFor(String property) {
        return switch (property) {
            case "courseName" -> Comparator.comparing(record -> safe(record.courseName()), String.CASE_INSENSITIVE_ORDER);
            case "teacherName" -> Comparator.comparing(record -> safe(record.teacherName()), String.CASE_INSENSITIVE_ORDER);
            case "status" -> Comparator.comparing(record -> record.status() != null ? record.status().name() : "");
            case "period" -> Comparator.comparing(record -> safe(record.period()), String.CASE_INSENSITIVE_ORDER);
            case "startTime" -> Comparator.comparing(StudentAttendanceResponse::startTime, Comparator.nullsLast(Comparator.naturalOrder()));
            case "sessionDate" -> Comparator.comparing(StudentAttendanceResponse::sessionDate, Comparator.nullsLast(Comparator.naturalOrder()));
            default -> Comparator.comparing(StudentAttendanceResponse::sessionDate, Comparator.nullsLast(Comparator.naturalOrder()));
        };
    }

    private Page<StudentAttendanceResponse> page(List<StudentAttendanceResponse> records, Pageable pageable) {
        if (pageable == null || pageable.isUnpaged()) {
            return new PageImpl<>(records);
        }

        int start = Math.toIntExact(Math.min(pageable.getOffset(), records.size()));
        int end = Math.min(start + pageable.getPageSize(), records.size());
        return new PageImpl<>(records.subList(start, end), pageable, records.size());
    }

    private String justificationStatus(AttendanceStatus status) {
        if (status == AttendanceStatus.EXCUSED) return "APPROVED";
        if (status == AttendanceStatus.ABSENT) return "NOT_SUBMITTED";
        return null;
    }

    private String displayCourseName(String code, String title) {
        if (!isBlank(title)) return title;
        if (!isBlank(code)) return code;
        return "Course not specified";
    }

    private String teacherName(TeacherEntity teacher) {
        if (teacher == null) return null;
        return (Objects.toString(teacher.getFirstName(), "") + " " + Objects.toString(teacher.getLastName(), "")).trim();
    }

    private String roomName(RoomEntity room) {
        if (room == null) return null;
        if (!isBlank(room.getName())) return room.getName();
        return room.getCode();
    }

    private String safe(String value) {
        return value == null ? "" : value;
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}
