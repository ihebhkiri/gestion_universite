package com.iheb.gestion_universite.student_managment.student_enrollment;

import com.iheb.gestion_universite.student_managment.student_enrollment.dto.EnrollStudentRequest;
import com.iheb.gestion_universite.student_managment.student_group.GroupRepository;
import com.iheb.gestion_universite.student_managment.student.StudentEntity;
import com.iheb.gestion_universite.student_managment.student.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EnrollmentAdminService {

    private final GroupRepository groupRepository;

    private final StudentRepository studentRepository;

    private final EnrollmentRepo enrollmentRepo;

    public StudentEnrollmentEntity enrollStudentToGroup (Long groupId, EnrollStudentRequest request) {
       ensureNoActiveEnrollment(request.studentId());

        StudentEnrollmentEntity enrollment = createEnrollment(request.studentId(), groupId);
        return enrollmentRepo.save(enrollment);

    }

    public void changeEnrollmentStatus (Long id, String request) {
        StudentEnrollmentEntity enrollment = enrollmentRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Enrollment not found"));
        enrollment.setStatus(EnrollmentStatus.valueOf(request.toUpperCase()));
        enrollmentRepo.save(enrollment);
    }

    public void changeEnrollmentStatusBulk(List<Long> studentIds, String newStatus) {
        EnrollmentStatus status = EnrollmentStatus.valueOf(newStatus.toUpperCase());
        List<StudentEnrollmentEntity> activeEnrollments = enrollmentRepo.findByStudent_IdInAndStatus(studentIds, EnrollmentStatus.ACTIVE);
        activeEnrollments.forEach(e -> e.setStatus(status));
        enrollmentRepo.saveAll(activeEnrollments);
    }

    private StudentEnrollmentEntity createEnrollment (Long studentId, Long groupId) {

        StudentEntity student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        var group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));
        StudentEnrollmentEntity enrollment = new StudentEnrollmentEntity();
        enrollment.setStudent(student);
        enrollment.setGroup(group);
        student.getEnrollments()
                .add(enrollment);
        enrollment.setEnrollmentDate(LocalDate.now());
        return enrollment;

    }
    private void ensureNoActiveEnrollment(Long studentId) {
        if (enrollmentRepo.existsByStudent_IdAndStatus(studentId, EnrollmentStatus.ACTIVE)) {
            throw new IllegalStateException("Student already has an ACTIVE enrollment");
        }
    }
}
