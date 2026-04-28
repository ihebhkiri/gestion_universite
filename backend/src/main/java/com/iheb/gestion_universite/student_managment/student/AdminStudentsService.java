package com.iheb.gestion_universite.student_managment.student;


import com.iheb.gestion_universite.student_managment.student_enrollment.EnrollmentRepo;
import com.iheb.gestion_universite.student_managment.student_enrollment.EnrollmentStatus;
import com.iheb.gestion_universite.student_managment.student_enrollment.StudentEnrollmentEntity;
import com.iheb.gestion_universite.core.exceptions.StudentNotFoundException;
import com.iheb.gestion_universite.core.exceptions.UserAlreadyExistsException;
import com.iheb.gestion_universite.security.role.RoleEntity;
import com.iheb.gestion_universite.security.role.RoleRepository;
import com.iheb.gestion_universite.student_managment.student.dto.AddStudentRequest;
import com.iheb.gestion_universite.student_managment.student.dto.StudentDataResponse;
import com.iheb.gestion_universite.student_managment.student.dto.StudentStatsResponse;
import com.iheb.gestion_universite.student_managment.student.dto.UpdateStudentRequest;
import com.iheb.gestion_universite.security.user.UserEntity;
import com.iheb.gestion_universite.security.user.UserRepository;
import com.iheb.gestion_universite.student_managment.student_group.GroupRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminStudentsService {

    private final RoleRepository roleRepository;

    private final StudentRepository studentRepository;

    private final GroupRepository groupRepository;

    private final PasswordEncoder passwordEncoder;

    private final UserRepository userRepository;

    private final EnrollmentRepo enrollmentRepo;

    public final static String matriculePrefix = "STUDENT-";

    public void addStudent(AddStudentRequest request, String imageFilename) {
        checkUserNotExists(request.email());
        UserEntity user = createUser(request);
        StudentEntity student = createStudent(user, request);
        student.setProfileImage(imageFilename);
        studentRepository.save(student);
    }

    public void updateProfileImage(Long id, String imageFilename) {
        StudentEntity student = checkStudentExists(id);
        student.setProfileImage(imageFilename);
        studentRepository.save(student);
    }

    public void updateStudent(Long id, UpdateStudentRequest request) {
        StudentEntity student = checkStudentExists(id);
        student.setCin(request.cin());
        student.setFirstName(request.firstName());
        student.setLastName(request.lastName());
        student.setGender(request.gender());
        student.setPhone(request.phone());
        studentRepository.saveAndFlush(student);
    }

    public void deleteStudent(Long id) {
        studentRepository.deleteById(id);
    }

    public void deleteStudentsBulk(List<Long> studentIds) {
        studentRepository.deleteAllByIdInBatch(studentIds);
    }

    public Page<StudentDataResponse> findAllStudents(String keyword, Long academicYearId, Long programId, String status, Pageable pageable) {
        return studentRepository.findAll(StudentSpecification.withFilters(keyword, academicYearId, programId, status), pageable)
                .map(this::mapToResponse);
    }

    public StudentDataResponse getStudentById(Long id) {
        StudentEntity student = checkStudentExists(id);
        return mapToResponse(student);
    }

    public StudentStatsResponse getStudentStats() {
        long totalStudents = studentRepository.count();
        long activeEnrollments = enrollmentRepo.countByStatus(EnrollmentStatus.CONFIRMED);
        long newThisMonth = enrollmentRepo.countByEnrollmentDateAfter(LocalDate.now().withDayOfMonth(1).minusDays(1));
        long totalGroups = groupRepository.count();
        return new StudentStatsResponse(totalStudents, activeEnrollments, newThisMonth, totalGroups);
    }

    public StudentEntity checkStudentExists(Long id) {
        return studentRepository.findById(id)
                .orElseThrow(() -> new StudentNotFoundException("Student not Found "));
    }

//    HELPERS

    private void checkUserNotExists(String email) {
        if (userRepository.existsByEmail(email)) {
            throw new UserAlreadyExistsException("User already exists ");
        }

    }

    private UserEntity createUser(AddStudentRequest request) {
        RoleEntity role = roleRepository.findByName("ROLE_" + request.role())
                .orElseThrow(() -> new RuntimeException("ROLE Not Found"));
        UserEntity user = new UserEntity();
        user.setEmail(request.email());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.getRoles()
                .add(role);
        return user;
    }

    private StudentEntity createStudent(UserEntity user, AddStudentRequest request) {
        StudentEntity student = new StudentEntity();
        student.setUser(user);
        student.setCin(request.cin());
        student.setPhone(request.phone());
        student.setFirstName(request.firstName());
        student.setLastName(request.lastName());
        student.setGender(request.gender());
        student.setMatricule(generateMatricule());
        student.setEnrollmentDate(LocalDate.now());
        return student;
    }

    private String generateMatricule() {
        return matriculePrefix + UUID.randomUUID()
                .toString()
                .substring(0, 8);
    }

    private StudentDataResponse mapToResponse(StudentEntity student) {
        // Find the latest active enrollment to get group name and status
        String groupName = null;
        String enrollmentStatus = null;
        String programName = null;
        String academicYear = null;
        String classCode = null;

        if (student.getEnrollments() != null && !student.getEnrollments().isEmpty()) {
            // Get the most recent enrollment
            StudentEnrollmentEntity latestEnrollment = student.getEnrollments()
                    .stream()
                    .reduce((first, second) -> second)
                    .orElse(null);

            if (latestEnrollment != null) {
                enrollmentStatus = latestEnrollment.getStatus().name();
                if (latestEnrollment.getGroup() != null) {
                    groupName = latestEnrollment.getGroup().getName();
                    if (latestEnrollment.getGroup().getAcademicClass() != null) {
                        classCode = latestEnrollment.getGroup().getAcademicClass().getCode();
                        if (latestEnrollment.getGroup().getAcademicClass().getProgram() != null) {
                            programName = latestEnrollment.getGroup().getAcademicClass().getProgram().getName();
                        }
                        if (latestEnrollment.getGroup().getAcademicClass().getAcademicYear() != null) {
                            academicYear = latestEnrollment.getGroup().getAcademicClass().getAcademicYear().getLabel();
                        }
                    }
                }
            }
        }

        String email = student.getUser() != null ? student.getUser().getEmail() : null;

        return new StudentDataResponse(
                student.getId(),
                student.getFirstName(),
                student.getLastName(),
                student.getGender(),
                student.getCin(),
                student.getPhone(),
                email,
                student.getProfileImage(),
                groupName,
                enrollmentStatus,
                student.getEnrollmentDate(),
                student.getCreatedAt(),
                student.getUpdatedAt(),
                programName,
                academicYear,
                classCode
        );
    }
}
