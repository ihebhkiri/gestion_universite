package com.iheb.gestion_universite.attendance.analytics.service;

import com.iheb.gestion_universite.attendance.analytics.dto.AbsenceRiskStatus;
import com.iheb.gestion_universite.attendance.analytics.dto.AttendanceAnalyticsSummaryResponse;
import com.iheb.gestion_universite.attendance.analytics.dto.CourseAbsenceStatResponse;
import com.iheb.gestion_universite.attendance.analytics.dto.GroupAttendanceSummaryResponse;
import com.iheb.gestion_universite.attendance.analytics.dto.GroupStudentAttendanceResponse;
import com.iheb.gestion_universite.attendance.analytics.dto.LatenessStatus;
import com.iheb.gestion_universite.attendance.analytics.dto.RiskLevel;
import com.iheb.gestion_universite.attendance.analytics.dto.StudentCourseAttendanceRiskResponse;
import com.iheb.gestion_universite.attendance.analytics.dto.StudentAttendanceHistoryResponse;
import com.iheb.gestion_universite.attendance.analytics.dto.StudentAttendanceProfileResponse;
import com.iheb.gestion_universite.attendance.analytics.dto.StudentCourseAttendanceResponse;
import com.iheb.gestion_universite.attendance.analytics.dto.TeacherAbsenceStatResponse;
import com.iheb.gestion_universite.attendance.entity.AttendanceRecordEntity;
import com.iheb.gestion_universite.attendance.entity.AttendanceSessionEntity;
import com.iheb.gestion_universite.attendance.entity.AttendanceStatus;
import com.iheb.gestion_universite.attendance.repository.AttendanceRecordRepository;
import com.iheb.gestion_universite.core.exceptions.StudentNotFoundException;
import com.iheb.gestion_universite.student_managment.student.StudentEntity;
import com.iheb.gestion_universite.student_managment.student.StudentRepository;
import com.iheb.gestion_universite.student_managment.student_enrollment.EnrollmentRepo;
import com.iheb.gestion_universite.student_managment.student_enrollment.EnrollmentStatus;
import com.iheb.gestion_universite.student_managment.student_enrollment.StudentEnrollmentEntity;
import com.iheb.gestion_universite.teaching.course.CourseEntity;
import com.iheb.gestion_universite.teaching.teacher.TeacherEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AttendanceAnalyticsService {

    private static final double SESSION_DURATION_HOURS = 1.5;
    private static final double ABSENCE_LIMIT_PERCENTAGE = 0.25;
    private static final int AT_RISK_REMAINING_ABSENCES = 2;
    private static final int BLAME_RECOMMENDED_MIN_LATE_COUNT = 2;
    private static final int FREQUENT_LATENESS_MIN_LATE_COUNT = 4;

    private final AttendanceRecordRepository recordRepository;
    private final EnrollmentRepo enrollmentRepo;
    private final StudentRepository studentRepository;

    public GroupAttendanceSummaryResponse getGroupSummary(Long academicYearId, Long semesterId, Long classId, Long groupId) {
        List<AttendanceRecordEntity> records = filteredRecords(academicYearId, semesterId, classId, groupId);
        Set<Long> sessionIds = records.stream().map(record -> record.getSession().getId()).collect(Collectors.toSet());
        long totalStudents = filteredStudentIds(academicYearId, classId, groupId).size();
        Counts counts = count(records);
        return new GroupAttendanceSummaryResponse(
                totalStudents,
                sessionIds.size(),
                records.size(),
                counts.present(),
                counts.absent(),
                counts.late(),
                counts.excused(),
                rate(counts.present() + counts.late(), records.size()),
                rate(counts.absent(), records.size()),
                rate(counts.late(), records.size()),
                rate(counts.excused(), records.size())
        );
    }

    public List<GroupStudentAttendanceResponse> getGroupStudents(Long academicYearId, Long semesterId, Long classId, Long groupId) {
        List<AttendanceRecordEntity> records = filteredRecords(academicYearId, semesterId, classId, groupId);
        Map<Long, StudentEnrollmentEntity> enrollmentByStudentId = enrollmentByStudentId();
        Map<Long, List<AttendanceRecordEntity>> recordsByStudentId = records.stream()
                .collect(Collectors.groupingBy(record -> record.getStudent().getId()));

        return studentRepository.findAllById(filteredStudentIds(academicYearId, classId, groupId))
                .stream()
                .map(student -> toStudentRow(student, recordsByStudentId.getOrDefault(student.getId(), List.of()), enrollmentByStudentId))
                .sorted(Comparator.comparing(GroupStudentAttendanceResponse::absenceRate).reversed())
                .toList();
    }

    public List<CourseAbsenceStatResponse> getCourseAbsenceRanking(Long academicYearId, Long semesterId, Long classId, Long groupId) {
        return filteredRecords(academicYearId, semesterId, classId, groupId).stream()
                .filter(record -> record.getSession().getCourse() != null)
                .collect(Collectors.groupingBy(record -> record.getSession().getCourse().getId()))
                .values()
                .stream()
                .map(this::toCourseRanking)
                .sorted(Comparator.comparing(CourseAbsenceStatResponse::absenceRate).reversed())
                .toList();
    }

    public List<TeacherAbsenceStatResponse> getTeacherAbsenceRanking(Long academicYearId, Long semesterId, Long classId, Long groupId) {
        return filteredRecords(academicYearId, semesterId, classId, groupId).stream()
                .filter(record -> record.getSession().getTeacher() != null)
                .collect(Collectors.groupingBy(record -> record.getSession().getTeacher().getId()))
                .values()
                .stream()
                .map(this::toTeacherRanking)
                .sorted(Comparator.comparing(TeacherAbsenceStatResponse::absenceRate).reversed())
                .toList();
    }

    public List<StudentCourseAttendanceRiskResponse> getStudentCourseAttendanceRisks(
            Long academicYearId,
            Long semesterId,
            Long classId,
            Long groupId
    ) {
        Map<Long, StudentEnrollmentEntity> enrollmentByStudentId = enrollmentByStudentId();

        return filteredRecords(academicYearId, semesterId, classId, groupId)
                .stream()
                .filter(record -> record.getSession().getCourse() != null)
                .collect(Collectors.groupingBy(record -> record.getStudent().getId() + ":" + record.getSession().getCourse().getId()))
                .values()
                .stream()
                .map(records -> toStudentCourseRisk(records, enrollmentByStudentId))
                .filter(this::isReportableRisk)
                .sorted(Comparator
                        .comparing(StudentCourseAttendanceRiskResponse::absenceStatus, this::compareAbsenceStatus)
                        .thenComparing(StudentCourseAttendanceRiskResponse::lateCount, Comparator.reverseOrder())
                        .thenComparing(StudentCourseAttendanceRiskResponse::studentName))
                .toList();
    }

    public StudentAttendanceProfileResponse getStudentProfile(Long studentId, Long academicYearId, Long semesterId, Long classId, Long groupId) {
        StudentEntity student = studentRepository.findById(studentId)
                .orElseThrow(() -> new StudentNotFoundException("Student not found"));
        List<AttendanceRecordEntity> records = filteredRecords(academicYearId, semesterId, classId, groupId)
                .stream()
                .filter(record -> record.getStudent().getId().equals(studentId))
                .toList();
        Map<Long, StudentEnrollmentEntity> enrollmentByStudentId = enrollmentByStudentId();
        StudentEnrollmentEntity enrollment = enrollmentByStudentId.get(studentId);

        return new StudentAttendanceProfileResponse(
                student.getId(),
                student.getMatricule(),
                studentName(student),
                enrollment != null && enrollment.getGroup() != null ? enrollment.getGroup().getName() : null,
                enrollment != null && enrollment.getGroup() != null && enrollment.getGroup().getAcademicClass() != null
                        ? enrollment.getGroup().getAcademicClass().getCode()
                        : null,
                toSummary(records),
                courseSummaries(records),
                history(records)
        );
    }

    private GroupStudentAttendanceResponse toStudentRow(
            StudentEntity student,
            List<AttendanceRecordEntity> records,
            Map<Long, StudentEnrollmentEntity> enrollmentByStudentId
    ) {
        Counts counts = count(records);
        double absenceRate = rate(counts.absent(), records.size());
        StudentEnrollmentEntity enrollment = enrollmentByStudentId.get(student.getId());

        return new GroupStudentAttendanceResponse(
                student.getId(),
                student.getMatricule(),
                studentName(student),
                enrollment != null && enrollment.getGroup() != null ? enrollment.getGroup().getName() : null,
                records.stream().map(record -> record.getSession().getId()).collect(Collectors.toSet()).size(),
                counts.present(),
                counts.absent(),
                counts.late(),
                counts.excused(),
                rate(counts.present() + counts.late(), records.size()),
                absenceRate,
                riskLevel(absenceRate)
        );
    }

    private CourseAbsenceStatResponse toCourseRanking(List<AttendanceRecordEntity> records) {
        AttendanceSessionEntity session = records.get(0).getSession();
        CourseEntity course = session.getCourse();
        Counts counts = count(records);
        Set<Long> sessionIds = records.stream().map(record -> record.getSession().getId()).collect(Collectors.toSet());

        return new CourseAbsenceStatResponse(
                course.getId(),
                course.getCode(),
                course.getTitle(),
                teacherName(session.getTeacher()),
                sessionIds.size(),
                records.size(),
                counts.absent(),
                rate(counts.absent(), records.size())
        );
    }

    private TeacherAbsenceStatResponse toTeacherRanking(List<AttendanceRecordEntity> records) {
        TeacherEntity teacher = records.get(0).getSession().getTeacher();
        Counts counts = count(records);
        Set<Long> courseIds = records.stream()
                .map(record -> record.getSession().getCourse())
                .filter(Objects::nonNull)
                .map(CourseEntity::getId)
                .collect(Collectors.toSet());
        Set<Long> sessionIds = records.stream().map(record -> record.getSession().getId()).collect(Collectors.toSet());

        return new TeacherAbsenceStatResponse(
                teacher.getId(),
                teacherName(teacher),
                courseIds.size(),
                sessionIds.size(),
                records.size(),
                counts.absent(),
                rate(counts.absent(), records.size())
        );
    }

    private StudentCourseAttendanceRiskResponse toStudentCourseRisk(
            List<AttendanceRecordEntity> records,
            Map<Long, StudentEnrollmentEntity> enrollmentByStudentId
    ) {
        AttendanceRecordEntity firstRecord = records.get(0);
        StudentEntity student = firstRecord.getStudent();
        CourseEntity course = firstRecord.getSession().getCourse();
        StudentEnrollmentEntity enrollment = enrollmentByStudentId.get(student.getId());

        long absenceCount = records.stream().filter(record -> record.getStatus() == AttendanceStatus.ABSENT).count();
        long lateCount = records.stream().filter(record -> record.getStatus() == AttendanceStatus.LATE).count();

        Integer courseHourlyVolume = course.getHours();
        double totalSessions = 0;
        int absenceLimitSessions = 0;
        int remainingBeforeElimination = 0;
        AbsenceRiskStatus absenceStatus = AbsenceRiskStatus.NOT_CALCULABLE;

        if (courseHourlyVolume != null && courseHourlyVolume > 0) {
            totalSessions = courseHourlyVolume / SESSION_DURATION_HOURS;
            absenceLimitSessions = (int) Math.floor(totalSessions * ABSENCE_LIMIT_PERCENTAGE);
            remainingBeforeElimination = Math.max(absenceLimitSessions - (int) absenceCount, 0);
            absenceStatus = absenceStatus(absenceCount, absenceLimitSessions, remainingBeforeElimination);
        }

        return new StudentCourseAttendanceRiskResponse(
                student.getId(),
                studentName(student),
                student.getMatricule(),
                enrollment != null && enrollment.getGroup() != null ? enrollment.getGroup().getName() : null,
                course.getId(),
                course.getCode(),
                course.getTitle(),
                courseHourlyVolume,
                Math.round(totalSessions * 100.0) / 100.0,
                absenceCount,
                lateCount,
                absenceLimitSessions,
                remainingBeforeElimination,
                absenceStatus,
                latenessStatus(lateCount)
        );
    }

    private boolean isReportableRisk(StudentCourseAttendanceRiskResponse risk) {
        return risk.absenceStatus() != AbsenceRiskStatus.NORMAL || risk.latenessStatus() != LatenessStatus.NO_DELAY;
    }

    private AbsenceRiskStatus absenceStatus(long absenceCount, int absenceLimitSessions, int remainingBeforeElimination) {
        if (absenceCount > absenceLimitSessions) return AbsenceRiskStatus.ELIMINATED;
        if (absenceCount == absenceLimitSessions) return AbsenceRiskStatus.LIMIT_REACHED;
        if (remainingBeforeElimination <= AT_RISK_REMAINING_ABSENCES) return AbsenceRiskStatus.AT_RISK;
        return AbsenceRiskStatus.NORMAL;
    }

    private LatenessStatus latenessStatus(long lateCount) {
        if (lateCount == 0) return LatenessStatus.NO_DELAY;
        if (lateCount == 1) return LatenessStatus.MINOR_DELAY;
        if (lateCount < FREQUENT_LATENESS_MIN_LATE_COUNT && lateCount >= BLAME_RECOMMENDED_MIN_LATE_COUNT) {
            return LatenessStatus.BLAME_RECOMMENDED;
        }
        return LatenessStatus.FREQUENT_LATENESS;
    }

    private int compareAbsenceStatus(AbsenceRiskStatus left, AbsenceRiskStatus right) {
        return Integer.compare(absenceSeverity(right), absenceSeverity(left));
    }

    private int absenceSeverity(AbsenceRiskStatus status) {
        return switch (status) {
            case ELIMINATED -> 4;
            case LIMIT_REACHED -> 3;
            case AT_RISK -> 2;
            case NOT_CALCULABLE -> 1;
            case NORMAL -> 0;
        };
    }

    private AttendanceAnalyticsSummaryResponse toSummary(List<AttendanceRecordEntity> records) {
        Counts counts = count(records);
        Set<Long> sessionIds = records.stream().map(record -> record.getSession().getId()).collect(Collectors.toSet());
        return new AttendanceAnalyticsSummaryResponse(
                sessionIds.size(),
                counts.present(),
                counts.absent(),
                counts.late(),
                counts.excused(),
                rate(counts.present() + counts.late(), records.size()),
                rate(counts.absent(), records.size()),
                rate(counts.late(), records.size()),
                rate(counts.excused(), records.size())
        );
    }

    private List<StudentCourseAttendanceResponse> courseSummaries(List<AttendanceRecordEntity> records) {
        return records.stream()
                .filter(record -> record.getSession().getCourse() != null)
                .collect(Collectors.groupingBy(record -> record.getSession().getCourse().getId()))
                .values()
                .stream()
                .map(courseRecords -> {
                    AttendanceSessionEntity session = courseRecords.get(0).getSession();
                    CourseEntity course = session.getCourse();
                    Counts counts = count(courseRecords);
                    return new StudentCourseAttendanceResponse(
                            course.getId(),
                            course.getCode(),
                            course.getTitle(),
                            teacherName(session.getTeacher()),
                            courseRecords.stream().map(record -> record.getSession().getId()).collect(Collectors.toSet()).size(),
                            counts.present(),
                            counts.absent(),
                            counts.late(),
                            counts.excused(),
                            rate(counts.present() + counts.late(), courseRecords.size()),
                            rate(counts.absent(), courseRecords.size())
                    );
                })
                .sorted(Comparator.comparing(StudentCourseAttendanceResponse::absenceRate).reversed())
                .toList();
    }

    private List<StudentAttendanceHistoryResponse> history(List<AttendanceRecordEntity> records) {
        return records.stream()
                .sorted(Comparator.comparing((AttendanceRecordEntity record) -> record.getSession().getSessionDate()).reversed())
                .map(record -> {
                    AttendanceSessionEntity session = record.getSession();
                    CourseEntity course = session.getCourse();
                    return new StudentAttendanceHistoryResponse(
                            session.getId(),
                            session.getSessionDate(),
                            course != null ? course.getCode() : null,
                            course != null ? course.getTitle() : null,
                            teacherName(session.getTeacher()),
                            record.getStatus(),
                            record.getMarkedAt()
                    );
                })
                .toList();
    }

    private List<AttendanceRecordEntity> filteredRecords(Long academicYearId, Long semesterId, Long classId, Long groupId) {
        Set<Long> studentIds = filteredStudentIds(academicYearId, classId, groupId);
        return recordRepository.findAllForAnalytics()
                .stream()
                .filter(record -> academicYearId == null
                        || record.getSession().getAcademicClass() != null
                        && record.getSession().getAcademicClass().getAcademicYear() != null
                        && academicYearId.equals(record.getSession().getAcademicClass().getAcademicYear().getId()))
                .filter(record -> semesterId == null
                        || record.getSession().getTimetableEntry() != null
                        && record.getSession().getTimetableEntry().getSemester() != null
                        && semesterId.equals(record.getSession().getTimetableEntry().getSemester().getId()))
                .filter(record -> classId == null
                        || record.getSession().getAcademicClass() != null
                        && classId.equals(record.getSession().getAcademicClass().getId()))
                .filter(record -> groupId == null || studentIds.contains(record.getStudent().getId()))
                .toList();
    }

    private Set<Long> filteredStudentIds(Long academicYearId, Long classId, Long groupId) {
        return enrollmentRepo.findAll()
                .stream()
                .filter(enrollment -> enrollment.getStatus() == EnrollmentStatus.CONFIRMED)
                .filter(enrollment -> enrollment.getStudent() != null && enrollment.getGroup() != null)
                .filter(enrollment -> groupId == null || groupId.equals(enrollment.getGroup().getId()))
                .filter(enrollment -> classId == null
                        || enrollment.getGroup().getAcademicClass() != null
                        && classId.equals(enrollment.getGroup().getAcademicClass().getId()))
                .filter(enrollment -> academicYearId == null
                        || enrollment.getGroup().getAcademicClass() != null
                        && enrollment.getGroup().getAcademicClass().getAcademicYear() != null
                        && academicYearId.equals(enrollment.getGroup().getAcademicClass().getAcademicYear().getId()))
                .map(enrollment -> enrollment.getStudent().getId())
                .collect(Collectors.toCollection(HashSet::new));
    }

    private Map<Long, StudentEnrollmentEntity> enrollmentByStudentId() {
        return enrollmentRepo.findAll()
                .stream()
                .filter(enrollment -> enrollment.getStatus() == EnrollmentStatus.CONFIRMED)
                .filter(enrollment -> enrollment.getStudent() != null)
                .collect(Collectors.toMap(
                        enrollment -> enrollment.getStudent().getId(),
                        Function.identity(),
                        (first, second) -> second
                ));
    }

    private Counts count(List<AttendanceRecordEntity> records) {
        long present = records.stream().filter(record -> record.getStatus() == AttendanceStatus.PRESENT).count();
        long absent = records.stream().filter(record -> record.getStatus() == AttendanceStatus.ABSENT).count();
        long late = records.stream().filter(record -> record.getStatus() == AttendanceStatus.LATE).count();
        long excused = records.stream().filter(record -> record.getStatus() == AttendanceStatus.EXCUSED).count();
        return new Counts(present, absent, late, excused);
    }

    private double rate(long value, long total) {
        if (total == 0) return 0;
        return Math.round((value * 10000.0) / total) / 100.0;
    }

    private RiskLevel riskLevel(double absenceRate) {
        if (absenceRate > 25) return RiskLevel.HIGH;
        if (absenceRate >= 10) return RiskLevel.MEDIUM;
        return RiskLevel.LOW;
    }

    private String studentName(StudentEntity student) {
        return (Objects.toString(student.getFirstName(), "") + " " + Objects.toString(student.getLastName(), "")).trim();
    }

    private String teacherName(TeacherEntity teacher) {
        if (teacher == null) return null;
        return (Objects.toString(teacher.getFirstName(), "") + " " + Objects.toString(teacher.getLastName(), "")).trim();
    }

    private record Counts(long present, long absent, long late, long excused) {}
}
