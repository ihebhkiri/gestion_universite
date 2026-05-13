package com.iheb.gestion_universite.teaching.timetable;

import com.iheb.gestion_universite.academic.academic_class.AcademicClassEntity;
import com.iheb.gestion_universite.core.exceptions.StudentNotFoundException;
import com.iheb.gestion_universite.security.UserPrincipal;
import com.iheb.gestion_universite.student_managment.student.StudentEntity;
import com.iheb.gestion_universite.student_managment.student.StudentRepository;
import com.iheb.gestion_universite.student_managment.student_enrollment.EnrollmentStatus;
import com.iheb.gestion_universite.student_managment.student_enrollment.StudentEnrollmentEntity;
import com.iheb.gestion_universite.teaching.timetable.dto.TimetableResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StudentTimetableService {

    private final StudentRepository studentRepository;
    private final TimetableFacade timetableFacade;

    public List<TimetableResponse> getTimetable(UserPrincipal principal) {
        Long academicClassId = resolveAcademicClassId(principal);
        return academicClassId == null
                ? List.of()
                : sortByDayAndStartTime(timetableFacade.findAll(academicClassId, null));
    }

    public List<TimetableResponse> getTodayAgenda(UserPrincipal principal) {
        DayOfWeek today = LocalDate.now().getDayOfWeek();
        return getTimetable(principal)
                .stream()
                .filter(entry -> entry.dayOfWeek() == today)
                .sorted(Comparator.comparing(TimetableResponse::startTime, Comparator.nullsLast(Comparator.naturalOrder())))
                .toList();
    }

    private Long resolveAcademicClassId(UserPrincipal principal) {
        if (principal == null || isBlank(principal.getUsername())) {
            throw new StudentNotFoundException("Student profile not found");
        }

        StudentEntity student = studentRepository.findByUser_EmailIgnoreCase(principal.getUsername())
                .orElseThrow(() -> new StudentNotFoundException("Student profile not found"));
        StudentEnrollmentEntity enrollment = latestCurrentEnrollment(student);
        AcademicClassEntity academicClass = resolveAcademicClass(enrollment);
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

    private AcademicClassEntity resolveAcademicClass(StudentEnrollmentEntity enrollment) {
        if (enrollment == null || enrollment.getGroup() == null) {
            return null;
        }
        return enrollment.getGroup().getAcademicClass();
    }

    private List<TimetableResponse> sortByDayAndStartTime(List<TimetableResponse> entries) {
        return entries.stream()
                .sorted(Comparator
                        .comparing((TimetableResponse entry) -> entry.dayOfWeek() != null ? entry.dayOfWeek().getValue() : Integer.MAX_VALUE)
                        .thenComparing(TimetableResponse::startTime, Comparator.nullsLast(Comparator.naturalOrder())))
                .toList();
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}
