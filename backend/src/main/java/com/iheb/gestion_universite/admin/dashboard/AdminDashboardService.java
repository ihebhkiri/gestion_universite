package com.iheb.gestion_universite.admin.dashboard;

import com.iheb.gestion_universite.academic.academic_year.AcademicYearEntity;
import com.iheb.gestion_universite.academic.academic_year.AcademicYearRepository;
import com.iheb.gestion_universite.academic.department.DepartmentEntity;
import com.iheb.gestion_universite.academic.department.DepartmentRepo;
import com.iheb.gestion_universite.academic.semester.SemesterEntity;
import com.iheb.gestion_universite.academic.semester.SemesterRepository;
import com.iheb.gestion_universite.evaluation.exam.ExamEntity;
import com.iheb.gestion_universite.evaluation.exam.ExamRepo;
import com.iheb.gestion_universite.student_managment.student.StudentRepository;
import com.iheb.gestion_universite.student_managment.student_enrollment.StudentEnrollmentEntity;
import com.iheb.gestion_universite.student_managment.student_enrollment.EnrollmentRepo;
import com.iheb.gestion_universite.teaching.course.CourseRepository;
import com.iheb.gestion_universite.teaching.teacher.TeacherEntity;
import com.iheb.gestion_universite.teaching.teacher.TeacherRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminDashboardService {

    private static final Locale DASHBOARD_LOCALE = Locale.ENGLISH;

    private final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;
    private final CourseRepository courseRepository;
    private final EnrollmentRepo enrollmentRepo;
    private final DepartmentRepo departmentRepo;
    private final SemesterRepository semesterRepository;
    private final AcademicYearRepository academicYearRepository;
    private final ExamRepo examRepo;

    public AdminDashboardResponse getDashboard() {
        LocalDate today = LocalDate.now();
        List<StudentEnrollmentEntity> enrollments = enrollmentRepo.findAll();
        List<TeacherEntity> teachers = teacherRepository.findAll();
        List<DepartmentEntity> departments = departmentRepo.findAll();
        List<SemesterEntity> semesters = semesterRepository.findAll();
        List<AcademicYearEntity> academicYears = academicYearRepository.findAll();
        List<ExamEntity> exams = examRepo.findAll();

        return new AdminDashboardResponse(
                buildSummary(),
                buildEnrollmentChart(enrollments, today),
                buildRecentEnrollments(enrollments),
                buildUpcomingExams(semesters, today),
                buildDepartmentStats(departments, teachers),
                buildActivityFeed(enrollments, teachers, exams),
                buildUpcomingEvents(semesters, academicYears, today),
                buildAlerts(academicYears, semesters)
        );
    }

    private AdminDashboardResponse.Summary buildSummary() {
        return new AdminDashboardResponse.Summary(
                studentRepository.count(),
                teacherRepository.count(),
                courseRepository.count(),
                null,
                false
        );
    }

    private List<AdminDashboardResponse.EnrollmentChartPoint> buildEnrollmentChart(
            List<StudentEnrollmentEntity> enrollments,
            LocalDate today
    ) {
        LocalDate chartStart = today.withDayOfMonth(1).minusMonths(5);
        Map<LocalDate, Long> totalsByMonth = new LinkedHashMap<>();

        for (int index = 0; index < 6; index++) {
            LocalDate month = chartStart.plusMonths(index);
            totalsByMonth.put(month, 0L);
        }

        enrollments.stream()
                .map(StudentEnrollmentEntity::getEnrollmentDate)
                .filter(date -> date != null && !date.isBefore(chartStart))
                .forEach(date -> {
                    LocalDate monthKey = date.withDayOfMonth(1);
                    totalsByMonth.computeIfPresent(monthKey, (key, value) -> value + 1);
                });

        return totalsByMonth.entrySet()
                .stream()
                .map(entry -> new AdminDashboardResponse.EnrollmentChartPoint(
                        entry.getKey()
                                .getMonth()
                                .getDisplayName(TextStyle.SHORT, DASHBOARD_LOCALE),
                        entry.getValue()
                ))
                .toList();
    }

    private List<AdminDashboardResponse.RecentEnrollment> buildRecentEnrollments(List<StudentEnrollmentEntity> enrollments) {
        return enrollments.stream()
                .filter(enrollment -> enrollment.getStudent() != null)
                .sorted(Comparator.comparing(StudentEnrollmentEntity::getEnrollmentDate,
                                Comparator.nullsLast(Comparator.reverseOrder()))
                        .thenComparing(StudentEnrollmentEntity::getId, Comparator.reverseOrder()))
                .limit(6)
                .map(enrollment -> new AdminDashboardResponse.RecentEnrollment(
                        enrollment.getId(),
                        enrollment.getStudent().getFirstName() + " " + enrollment.getStudent().getLastName(),
                        enrollment.getStudent().getMatricule(),
                        enrollment.getGroup() != null ? enrollment.getGroup().getName() : "Unassigned group",
                        enrollment.getStatus().name(),
                        enrollment.getEnrollmentDate()
                ))
                .toList();
    }

    private List<AdminDashboardResponse.UpcomingExam> buildUpcomingExams(List<SemesterEntity> semesters, LocalDate today) {
        return semesters.stream()
                .filter(semester -> semester.getExamStartDate() != null && !semester.getExamStartDate().isBefore(today))
                .sorted(Comparator.comparing(SemesterEntity::getExamStartDate))
                .limit(5)
                .map(semester -> new AdminDashboardResponse.UpcomingExam(
                        semester.getName() + " exam session",
                        semester.getAcademicYear() != null ? semester.getAcademicYear().getLabel() : "Academic calendar",
                        semester.getExamStartDate(),
                        semester.getExamEndDate(),
                        ChronoUnit.DAYS.between(today, semester.getExamStartDate())
                ))
                .toList();
    }

    private List<AdminDashboardResponse.DepartmentStat> buildDepartmentStats(
            List<DepartmentEntity> departments,
            List<TeacherEntity> teachers
    ) {
        Map<Long, Long> teachersByDepartment = new LinkedHashMap<>();
        teachers.stream()
                .filter(teacher -> teacher.getDepartment() != null)
                .forEach(teacher -> teachersByDepartment.merge(teacher.getDepartment().getId(), 1L, Long::sum));

        return departments.stream()
                .sorted(Comparator.comparing(DepartmentEntity::getName))
                .map(department -> new AdminDashboardResponse.DepartmentStat(
                        department.getId(),
                        department.getCode(),
                        department.getName(),
                        teachersByDepartment.getOrDefault(department.getId(), 0L),
                        department.getPrograms() != null ? department.getPrograms().size() : 0
                ))
                .toList();
    }

    private List<AdminDashboardResponse.ActivityItem> buildActivityFeed(
            List<StudentEnrollmentEntity> enrollments,
            List<TeacherEntity> teachers,
            List<ExamEntity> exams
    ) {
        List<AdminDashboardResponse.ActivityItem> items = new ArrayList<>();

        enrollments.stream()
                .filter(enrollment -> enrollment.getStudent() != null && enrollment.getCreatedAt() != null)
                .sorted(Comparator.comparing(StudentEnrollmentEntity::getCreatedAt).reversed())
                .limit(6)
                .forEach(enrollment -> items.add(new AdminDashboardResponse.ActivityItem(
                        "enrollment",
                        enrollment.getStudent().getFirstName() + " " + enrollment.getStudent().getLastName() + " enrolled",
                        enrollment.getGroup() != null
                                ? "Assigned to " + enrollment.getGroup().getName()
                                : "Enrollment created without a group assignment",
                        enrollment.getCreatedAt()
                )));

        teachers.stream()
                .filter(teacher -> teacher.getCreatedAt() != null)
                .sorted(Comparator.comparing(TeacherEntity::getCreatedAt).reversed())
                .limit(4)
                .forEach(teacher -> items.add(new AdminDashboardResponse.ActivityItem(
                        "teacher",
                        teacher.getFirstName() + " " + teacher.getLastName() + " joined staff",
                        teacher.getDepartment() != null
                                ? "Department: " + teacher.getDepartment().getName()
                                : "Department not assigned yet",
                        teacher.getCreatedAt()
                )));

        exams.stream()
                .filter(exam -> exam.getCreatedAt() != null)
                .sorted(Comparator.comparing(ExamEntity::getCreatedAt).reversed())
                .limit(4)
                .forEach(exam -> items.add(new AdminDashboardResponse.ActivityItem(
                        "exam",
                        exam.getTitle() + " exam published",
                        exam.getCourse() != null ? exam.getCourse().getTitle() : "Course information unavailable",
                        exam.getCreatedAt()
                )));

        return items.stream()
                .sorted(Comparator.comparing(AdminDashboardResponse.ActivityItem::occurredAt).reversed())
                .limit(8)
                .toList();
    }

    private List<AdminDashboardResponse.UpcomingEvent> buildUpcomingEvents(
            List<SemesterEntity> semesters,
            List<AcademicYearEntity> academicYears,
            LocalDate today
    ) {
        List<AdminDashboardResponse.UpcomingEvent> items = new ArrayList<>();

        academicYears.stream()
                .filter(academicYear -> academicYear.getStartDate() != null && !academicYear.getStartDate().isBefore(today))
                .forEach(academicYear -> items.add(new AdminDashboardResponse.UpcomingEvent(
                        academicYear.getLabel() + " starts",
                        "Academic year launch",
                        academicYear.getStartDate(),
                        "academic-year"
                )));

        semesters.stream()
                .filter(semester -> semester.getStartDate() != null && !semester.getStartDate().isBefore(today))
                .forEach(semester -> items.add(new AdminDashboardResponse.UpcomingEvent(
                        semester.getName() + " starts",
                        semester.getAcademicYear() != null ? semester.getAcademicYear().getLabel() : "Semester timeline",
                        semester.getStartDate(),
                        "semester"
                )));

        semesters.stream()
                .filter(semester -> semester.getExamStartDate() != null && !semester.getExamStartDate().isBefore(today))
                .forEach(semester -> items.add(new AdminDashboardResponse.UpcomingEvent(
                        semester.getName() + " exams open",
                        semester.getAcademicYear() != null ? semester.getAcademicYear().getLabel() : "Exam window",
                        semester.getExamStartDate(),
                        "exam-window"
                )));

        return items.stream()
                .sorted(Comparator.comparing(AdminDashboardResponse.UpcomingEvent::date))
                .limit(6)
                .toList();
    }

    private List<AdminDashboardResponse.AlertItem> buildAlerts(
            List<AcademicYearEntity> academicYears,
            List<SemesterEntity> semesters
    ) {
        List<AdminDashboardResponse.AlertItem> alerts = new ArrayList<>();

        if (academicYears.stream().noneMatch(AcademicYearEntity::isActive)) {
            alerts.add(new AdminDashboardResponse.AlertItem(
                    "warning",
                    "No active academic year",
                    "Activate one academic year so scheduling and dashboard planning stay aligned."
            ));
        }

        if (semesters.stream().noneMatch(semester -> semester.getExamStartDate() != null)) {
            alerts.add(new AdminDashboardResponse.AlertItem(
                    "info",
                    "Exam windows missing",
                    "Upcoming exam cards depend on semester exam dates. Add exam start and end dates to surface them here."
            ));
        }

        alerts.add(new AdminDashboardResponse.AlertItem(
                "neutral",
                "Attendance tracking unavailable",
                "The project does not expose an attendance domain yet, so the attendance KPI is shown as unavailable instead of guessed data."
        ));

        return alerts;
    }
}
