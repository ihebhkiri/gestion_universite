package com.iheb.gestion_universite.teaching.course;

import com.iheb.gestion_universite.academic.academic_class.AcademicClassEntity;
import com.iheb.gestion_universite.core.exceptions.StudentNotFoundException;
import com.iheb.gestion_universite.security.UserPrincipal;
import com.iheb.gestion_universite.student_managment.student.StudentEntity;
import com.iheb.gestion_universite.student_managment.student.StudentRepository;
import com.iheb.gestion_universite.student_managment.student_enrollment.EnrollmentStatus;
import com.iheb.gestion_universite.student_managment.student_enrollment.StudentEnrollmentEntity;
import com.iheb.gestion_universite.teaching.course.dto.StudentCourseResponse;
import com.iheb.gestion_universite.teaching.subject.SubjectEntity;
import com.iheb.gestion_universite.teaching.teacher.TeacherEntity;
import com.iheb.gestion_universite.teaching.timetable.TimetableEntity;
import com.iheb.gestion_universite.teaching.timetable.TimetableRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.Date;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StudentCourseService {

    private final StudentRepository studentRepository;
    private final TimetableRepository timetableRepository;

    public Page<StudentCourseResponse> getMyCourses(
            UserPrincipal principal,
            String period,
            Long teacherId,
            Long subjectId,
            Pageable pageable
    ) {
        Long academicClassId = resolveAcademicClassId(principal);
        if (academicClassId == null) {
            return Page.empty(pageable);
        }

        List<StudentCourseResponse> courses = distinctCourseResponses(
                timetableRepository.findByAcademicClassId(academicClassId),
                normalize(period),
                teacherId,
                subjectId
        );

        List<StudentCourseResponse> sorted = sortCourses(courses, pageable);
        return page(sorted, pageable);
    }

    private List<StudentCourseResponse> distinctCourseResponses(
            List<TimetableEntity> entries,
            String period,
            Long teacherId,
            Long subjectId
    ) {
        Map<Long, TimetableEntity> byCourse = new LinkedHashMap<>();

        entries.stream()
                .filter(entry -> entry.getCourse() != null && entry.getCourse().getId() != null)
                .filter(entry -> period == null || entry.getSemester() != null
                        && period.equalsIgnoreCase(normalize(entry.getSemester().getName())))
                .filter(entry -> teacherId == null || entry.getTeacher() != null
                        && teacherId.equals(entry.getTeacher().getId()))
                .filter(entry -> subjectId == null || entry.getCourse().getSubject() != null
                        && subjectId.equals(entry.getCourse().getSubject().getId()))
                .sorted(Comparator.comparing((TimetableEntity entry) -> entry.getCourse().getId(), Comparator.reverseOrder()))
                .forEach(entry -> byCourse.putIfAbsent(entry.getCourse().getId(), entry));

        return byCourse.values()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private StudentCourseResponse toResponse(TimetableEntity entry) {
        CourseEntity course = entry.getCourse();
        TeacherEntity teacher = entry.getTeacher();
        SubjectEntity subject = course.getSubject();

        return new StudentCourseResponse(
                course.getId(),
                course.getTitle(),
                course.getCode(),
                teacherName(teacher),
                null,
                course.getPublishedAt(),
                entry.getSemester() != null ? entry.getSemester().getName() : null,
                subject != null ? subject.getId() : null,
                subject != null ? subject.getSubjectName() : null,
                teacher != null ? teacher.getId() : null,
                attachmentCount(course) > 0,
                attachmentCount(course)
        );
    }

    private List<StudentCourseResponse> sortCourses(List<StudentCourseResponse> courses, Pageable pageable) {
        Comparator<StudentCourseResponse> comparator = Comparator
                .comparing(StudentCourseResponse::id, Comparator.nullsLast(Comparator.reverseOrder()));

        if (pageable != null && pageable.getSort().isSorted()) {
            comparator = null;

            for (Sort.Order order : pageable.getSort()) {
                Comparator<StudentCourseResponse> next = comparatorFor(order.getProperty());
                if (order.isDescending()) {
                    next = next.reversed();
                }
                comparator = comparator == null ? next : comparator.thenComparing(next);
            }
        }

        return courses.stream()
                .sorted(comparator)
                .toList();
    }

    private Comparator<StudentCourseResponse> comparatorFor(String property) {
        return switch (property) {
            case "courseName" -> Comparator.comparing(course -> safe(course.courseName()), String.CASE_INSENSITIVE_ORDER);
            case "teacherName" -> Comparator.comparing(course -> safe(course.teacherName()), String.CASE_INSENSITIVE_ORDER);
            case "subjectName" -> Comparator.comparing(course -> safe(course.subjectName()), String.CASE_INSENSITIVE_ORDER);
            case "period" -> Comparator.comparing(course -> safe(course.period()), String.CASE_INSENSITIVE_ORDER);
            case "publishedAt" -> Comparator.comparing(StudentCourseResponse::publishedAt, Comparator.nullsFirst(Date::compareTo));
            case "courseId", "id" -> Comparator.comparing(StudentCourseResponse::id, Comparator.nullsLast(Comparator.naturalOrder()));
            default -> Comparator.comparing(StudentCourseResponse::id, Comparator.nullsLast(Comparator.naturalOrder()));
        };
    }

    private int attachmentCount(CourseEntity course) {
        return course.getAttachments() == null ? 0 : course.getAttachments().size();
    }

    private Page<StudentCourseResponse> page(List<StudentCourseResponse> courses, Pageable pageable) {
        if (pageable == null || pageable.isUnpaged()) {
            return new PageImpl<>(courses);
        }

        int start = Math.toIntExact(Math.min(pageable.getOffset(), courses.size()));
        int end = Math.min(start + pageable.getPageSize(), courses.size());
        return new PageImpl<>(courses.subList(start, end), pageable, courses.size());
    }

    private Long resolveAcademicClassId(UserPrincipal principal) {
        if (principal == null || isBlank(principal.getUsername())) {
            throw new StudentNotFoundException("Student profile not found");
        }

        StudentEntity student = studentRepository.findByUser_EmailIgnoreCase(principal.getUsername())
                .orElseThrow(() -> new StudentNotFoundException("Student profile not found"));
        StudentEnrollmentEntity enrollment = latestCurrentEnrollment(student);
        AcademicClassEntity academicClass = enrollment != null && enrollment.getGroup() != null
                ? enrollment.getGroup().getAcademicClass()
                : null;
        return academicClass != null ? academicClass.getId() : null;
    }

    private StudentEnrollmentEntity latestCurrentEnrollment(StudentEntity student) {
        if (student.getEnrollments() == null || student.getEnrollments().isEmpty()) {
            return null;
        }

        return student.getEnrollments()
                .stream()
                .filter(enrollment -> enrollment.getStatus() == EnrollmentStatus.CONFIRMED)
                .max(this::compareEnrollment)
                .or(() -> student.getEnrollments().stream().max(this::compareEnrollment))
                .orElse(null);
    }

    private int compareEnrollment(StudentEnrollmentEntity first, StudentEnrollmentEntity second) {
        Comparator<StudentEnrollmentEntity> comparator = Comparator
                .comparing((StudentEnrollmentEntity enrollment) -> enrollment.getEnrollmentDate() != null
                        ? enrollment.getEnrollmentDate()
                        : LocalDate.MIN)
                .thenComparing(enrollment -> enrollment.getId() != null ? enrollment.getId() : Long.MIN_VALUE);
        return comparator.compare(first, second);
    }

    private String teacherName(TeacherEntity teacher) {
        if (teacher == null) {
            return null;
        }
        return (Objects.toString(teacher.getFirstName(), "") + " " + Objects.toString(teacher.getLastName(), "")).trim();
    }

    private String normalize(String value) {
        return isBlank(value) ? null : value.trim();
    }

    private String safe(String value) {
        return value == null ? "" : value;
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}
