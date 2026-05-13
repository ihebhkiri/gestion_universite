package com.iheb.gestion_universite.evaluation.exam;

import com.iheb.gestion_universite.academic.academic_class.AcademicClassEntity;
import com.iheb.gestion_universite.core.exceptions.StudentNotFoundException;
import com.iheb.gestion_universite.evaluation.exam.dto.ExamResponse;
import com.iheb.gestion_universite.security.UserPrincipal;
import com.iheb.gestion_universite.student_managment.student.StudentEntity;
import com.iheb.gestion_universite.student_managment.student.StudentRepository;
import com.iheb.gestion_universite.student_managment.student_enrollment.EnrollmentStatus;
import com.iheb.gestion_universite.student_managment.student_enrollment.StudentEnrollmentEntity;
import com.iheb.gestion_universite.student_managment.student_group.StudentGroupEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StudentExamService {

    private final StudentRepository studentRepository;
    private final ExamService examService;

    public List<ExamResponse> getMyExams(UserPrincipal principal) {
        StudentEnrollmentEntity enrollment = resolveCurrentEnrollment(principal);
        StudentGroupEntity group = enrollment != null ? enrollment.getGroup() : null;
        AcademicClassEntity academicClass = group != null ? group.getAcademicClass() : null;

        return examService.findStudentVisibleExams(
                academicClass != null ? academicClass.getId() : null,
                group != null ? group.getId() : null
        );
    }

    private StudentEnrollmentEntity resolveCurrentEnrollment(UserPrincipal principal) {
        if (principal == null || isBlank(principal.getUsername())) {
            throw new StudentNotFoundException("Student profile not found");
        }

        StudentEntity student = studentRepository.findByUser_EmailIgnoreCase(principal.getUsername())
                .orElseThrow(() -> new StudentNotFoundException("Student profile not found"));

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

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}
