package com.iheb.gestion_universite.student_managment.student;

import com.iheb.gestion_universite.academic.academic_class.AcademicClassEntity;
import com.iheb.gestion_universite.core.exceptions.StudentNotFoundException;
import com.iheb.gestion_universite.security.UserPrincipal;
import com.iheb.gestion_universite.security.user.UserEntity;
import com.iheb.gestion_universite.student_managment.student.dto.StudentProfileResponse;
import com.iheb.gestion_universite.student_managment.student_enrollment.StudentEnrollmentEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Comparator;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StudentProfileService {

    private final StudentRepository studentRepository;

    public StudentProfileResponse getConnectedStudentProfile(UserPrincipal principal) {
        if (principal == null || isBlank(principal.getUsername())) {
            throw new StudentNotFoundException("Student profile not found");
        }

        StudentEntity student = studentRepository.findByUser_EmailIgnoreCase(principal.getUsername())
                .orElseThrow(() -> new StudentNotFoundException("Student profile not found"));

        StudentEnrollmentEntity latestEnrollment = latestEnrollment(student);
        AcademicClassEntity academicClass = academicClass(latestEnrollment);
        UserEntity user = student.getUser();

        return new StudentProfileResponse(
                student.getMatricule(),
                fullName(student, user),
                user != null ? user.getEmail() : principal.getUsername(),
                blankToNull(student.getPhone()),
                blankToNull(student.getCin()),
                academicClass != null ? blankToNull(academicClass.getCode()) : null,
                resolveProgram(academicClass),
                latestEnrollment != null && latestEnrollment.getStatus() != null
                        ? latestEnrollment.getStatus().name()
                        : null,
                blankToNull(student.getProfileImage())
        );
    }

    private StudentEnrollmentEntity latestEnrollment(StudentEntity student) {
        if (student.getEnrollments() == null || student.getEnrollments().isEmpty()) {
            return null;
        }

        return student.getEnrollments()
                .stream()
                .max(Comparator
                        .comparing((StudentEnrollmentEntity enrollment) -> enrollment.getEnrollmentDate() != null
                                ? enrollment.getEnrollmentDate()
                                : LocalDate.MIN)
                        .thenComparing(enrollment -> enrollment.getId() != null ? enrollment.getId() : Long.MIN_VALUE))
                .orElse(null);
    }

    private AcademicClassEntity academicClass(StudentEnrollmentEntity enrollment) {
        if (enrollment == null || enrollment.getGroup() == null) {
            return null;
        }
        return enrollment.getGroup().getAcademicClass();
    }

    private String resolveProgram(AcademicClassEntity academicClass) {
        if (academicClass == null) {
            return null;
        }
        if (academicClass.getSpeciality() != null) {
            String specialityCode = blankToNull(academicClass.getSpeciality().getCode());
            if (specialityCode != null) {
                return specialityCode;
            }
            String specialityName = blankToNull(academicClass.getSpeciality().getName());
            if (specialityName != null) {
                return specialityName;
            }
        }
        if (academicClass.getProgram() != null) {
            String programCode = blankToNull(academicClass.getProgram().getCode());
            if (programCode != null) {
                return programCode;
            }
            return blankToNull(academicClass.getProgram().getName());
        }
        return null;
    }

    private String fullName(StudentEntity student, UserEntity user) {
        String fullName = (safe(student.getFirstName()) + " " + safe(student.getLastName())).trim();
        if (!fullName.isBlank()) {
            return fullName;
        }
        return user != null ? user.getEmail() : null;
    }

    private String safe(String value) {
        return value == null ? "" : value.trim();
    }

    private String blankToNull(String value) {
        return isBlank(value) ? null : value.trim();
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}
