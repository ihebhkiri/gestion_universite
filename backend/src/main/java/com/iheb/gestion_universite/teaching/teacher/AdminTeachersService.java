package com.iheb.gestion_universite.teaching.teacher;


import com.iheb.gestion_universite.academic.department.DepartmentEntity;
import com.iheb.gestion_universite.academic.department.DepartmentRepo;
import com.iheb.gestion_universite.academic.academic_class.AcademicClassEntity;
import com.iheb.gestion_universite.academic.academic_class.ClassRepository;
import com.iheb.gestion_universite.academic.semester.SemesterEntity;
import com.iheb.gestion_universite.academic.semester.SemesterRepository;
import com.iheb.gestion_universite.academic.speciality.SpecialityEntity;
import com.iheb.gestion_universite.academic.speciality.SpecialityRepository;
import com.iheb.gestion_universite.core.exceptions.TeacherNotFoundException;
import com.iheb.gestion_universite.security.role.RoleEntity;
import com.iheb.gestion_universite.security.role.RoleRepository;
import com.iheb.gestion_universite.teaching.course.CourseEntity;
import com.iheb.gestion_universite.teaching.course.CourseRepository;
import com.iheb.gestion_universite.teaching.subject.SubjectEntity;
import com.iheb.gestion_universite.teaching.teacher.dto.*;
import com.iheb.gestion_universite.teaching.teacher_assignment.TeacherAssignmentEntity;
import com.iheb.gestion_universite.teaching.teacher_assignment.TeacherAssignmentRepository;
import com.iheb.gestion_universite.security.user.UserEntity;
import com.iheb.gestion_universite.security.user.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminTeachersService {

    private final RoleRepository roleRepository;

    private final TeacherRepository teacherRepository;

    private final PasswordEncoder passwordEncoder;

    private final UserRepository userRepository;

    private final DepartmentRepo departmentRepo;

    private final SpecialityRepository specialityRepository;

    private final TeacherAssignmentRepository teacherAssignmentRepository;

    private final CourseRepository courseRepository;

    private final SemesterRepository semesterRepository;

    private final ClassRepository classRepository;

    private final static String matriculePrefix = "TEACHER-";

    public void addTeacher (AddTeacherRequest request) {

        checkUserNotExists(request.email());
        UserEntity user = createUser(request);
        TeacherEntity teacher = createTeacher(user, request);
        teacherRepository.save(teacher);
    }

    public TeacherEntity updateTeacher (Long id, UpdateTeacherRequest request) {

        TeacherEntity teacher = checkTeacherExists(id);
        DepartmentEntity department = departmentRepo.findById(request.departmentId())
                .orElseThrow(() -> new RuntimeException("Department Not Found"));
        SpecialityEntity speciality = getSpeciality(request.specialityId());
        teacher.setFirstName(request.firstName());
        teacher.setLastName(request.lastName());
        teacher.setCin(request.cin());
        teacher.setGrade(request.grade());
        teacher.setPhone(request.phone());
        teacher.setGender(request.gender());
        teacher.setDepartment(department);
        teacher.setSpeciality(speciality);
        teacher.setStatus(resolveStatus(request.status()));
        teacherRepository.save(teacher);
        return teacher;
    }

    public Page<TeacherResponse> findAllTeachers (
            String search,
            Long departmentId,
            String status,
            Long specialityId,
            Long subjectId,
            LocalDate hiredFrom,
            LocalDate hiredTo,
            Pageable pageable) {

        return teacherRepository.findAll(
                        TeacherSpecification.builder()
                                .search(search)
                                .departmentId(departmentId)
                                .status(status)
                                .specialityId(specialityId)
                                .subjectId(subjectId)
                                .hiredFrom(hiredFrom)
                                .hiredTo(hiredTo)
                                .build(),
                        pageable)
                .map(this::mapToResponse);
    }

    public List<TeacherResponse> findAllTeacherOptions () {

        return teacherRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public TeacherResponse getTeacherById (Long id) {

        return mapToResponse(checkTeacherExists(id));
    }

    public void deleteTeacher (Long id) {

        teacherRepository.delete(checkTeacherExists(id));
    }

    public void deleteTeachersBulk (List<Long> teacherIds) {

        teacherRepository.deleteAllByIdInBatch(teacherIds);
    }

    public TeacherAssignmentResponse assignTeacher (Long teacherId, AssignTeacherRequest request) {

        if (teacherAssignmentRepository.existsByTeacherIdAndCourseIdAndSemesterIdAndAcademicClassEntityId(
                teacherId,
                request.courseId(),
                request.semesterId(),
                request.classId())) {
            throw new RuntimeException("Teacher assignment already exists");
        }

        TeacherEntity teacher = checkTeacherExists(teacherId);
        CourseEntity course = courseRepository.findById(request.courseId())
                .orElseThrow(() -> new RuntimeException("Course Not Found"));
        SemesterEntity semester = semesterRepository.findById(request.semesterId())
                .orElseThrow(() -> new RuntimeException("Semester Not Found"));
        AcademicClassEntity academicClass = classRepository.findById(request.classId())
                .orElseThrow(() -> new RuntimeException("Class Not Found"));

        TeacherAssignmentEntity assignment = new TeacherAssignmentEntity();
        assignment.setTeacher(teacher);
        assignment.setCourse(course);
        assignment.setSemester(semester);
        assignment.setAcademicClassEntity(academicClass);

        return mapAssignmentToResponse(teacherAssignmentRepository.save(assignment));
    }

    public TeacherEntity checkTeacherExists (Long id) {

        return teacherRepository.findById(id)
                .orElseThrow(() -> new TeacherNotFoundException("Teacher not Found "));
    }


    private UserEntity createUser (AddTeacherRequest request) {

        RoleEntity role = roleRepository.findByName("ROLE_" + request.role())
                .orElseThrow(() -> new RuntimeException("ROLE Not Found"));
        UserEntity user = new UserEntity();
        user.setEmail(request.email());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.getRoles()
                .add(role);


        return user;
    }

    private TeacherEntity createTeacher (UserEntity user, AddTeacherRequest request) {

        TeacherEntity teacher = new TeacherEntity();
        DepartmentEntity department = departmentRepo.findById(request.departmentId())
                .orElseThrow(() -> new RuntimeException("Department Not Found"));
        teacher.setDepartment(department);
        teacher.setSpeciality(getSpeciality(request.specialityId()));
        teacher.setUser(user);
        teacher.setPhone(request.phone());
        teacher.setFirstName(request.firstName());
        teacher.setLastName(request.lastName());
        teacher.setGender(request.gender());
        teacher.setPhone(request.phone());
        teacher.setMatricule(generateMatricule());
        teacher.setHireDate(LocalDate.now());
        teacher.setGrade(request.grade());
        teacher.setCin(request.cin());
        teacher.setStatus(resolveStatus(request.status()));
        return teacher;


    }

//    HELPERS

    private void checkUserNotExists (String email) {

        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("User already exists ");
        }

    }

//

    private String generateMatricule () {

        return matriculePrefix + UUID.randomUUID()
                .toString()
                .substring(0, 8);
    }

    private SpecialityEntity getSpeciality (Long specialityId) {

        if (specialityId == null) {
            return null;
        }
        return specialityRepository.findById(specialityId)
                .orElseThrow(() -> new RuntimeException("Speciality Not Found"));
    }

    private TeacherStatus resolveStatus (String status) {

        if (!StringUtils.hasText(status)) {
            return TeacherStatus.ACTIVE;
        }
        try {
            return TeacherStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException exception) {
            throw new IllegalArgumentException("Invalid teacher status: " + status);
        }
    }

    private TeacherResponse mapToResponse (TeacherEntity teacher) {

        String firstName = Objects.toString(teacher.getFirstName(), "");
        String lastName = Objects.toString(teacher.getLastName(), "");
        String fullName = (firstName + " " + lastName).trim();
        String email = teacher.getUser() != null ? teacher.getUser()
                .getEmail() : null;
        Long departmentId = teacher.getDepartment() != null ? teacher.getDepartment()
                .getId() : null;
        String departmentName = teacher.getDepartment() != null ? teacher.getDepartment()
                .getName() : null;
        Long specialityId = teacher.getSpeciality() != null ? teacher.getSpeciality()
                .getId() : null;
        String specialityName = teacher.getSpeciality() != null ? teacher.getSpeciality()
                .getName() : null;
        List<TeacherAssignmentEntity> assignments = teacher.getAssignments() == null
                ? new ArrayList<>()
                : teacher.getAssignments()
                .stream()
                .sorted(Comparator.comparing(TeacherAssignmentEntity::getId))
                .toList();

        List<String> subjects = assignments.stream()
                .map(TeacherAssignmentEntity::getCourse)
                .filter(Objects::nonNull)
                .map(CourseEntity::getSubject)
                .filter(Objects::nonNull)
                .map(SubjectEntity::getSubjectName)
                .filter(Objects::nonNull)
                .distinct()
                .toList();

        long assignedClassesCount = assignments.stream()
                .map(TeacherAssignmentEntity::getAcademicClassEntity)
                .filter(Objects::nonNull)
                .map(AcademicClassEntity::getId)
                .distinct()
                .count();

        return new TeacherResponse(
                teacher.getId(),
                teacher.getMatricule(),
                teacher.getFirstName(),
                teacher.getLastName(),
                fullName,
                email,
                teacher.getCin(),
                teacher.getPhone(),
                teacher.getGender(),
                teacher.getGrade(),
                teacher.getStatus() != null ? teacher.getStatus()
                        .name() : TeacherStatus.ACTIVE.name(),
                teacher.getHireDate(),
                teacher.getCreatedAt(),
                departmentId,
                departmentName,
                specialityId,
                specialityName,
                subjects,
                assignedClassesCount
        );
    }

    private TeacherAssignmentResponse mapAssignmentToResponse (TeacherAssignmentEntity assignment) {

        TeacherEntity teacher = assignment.getTeacher();
        CourseEntity course = assignment.getCourse();
        SemesterEntity semester = assignment.getSemester();
        AcademicClassEntity academicClass = assignment.getAcademicClassEntity();
        String teacherName = teacher != null
                ? (Objects.toString(teacher.getFirstName(), "") + " " + Objects.toString(teacher.getLastName(), "")).trim()
                : null;

        return new TeacherAssignmentResponse(
                assignment.getId(),
                teacher != null ? teacher.getId() : null,
                teacherName,
                course != null ? course.getId() : null,
                course != null ? course.getTitle() : null,
                semester != null ? semester.getId() : null,
                semester != null ? semester.getName() : null,
                academicClass != null ? academicClass.getId() : null,
                academicClass != null ? academicClass.getCode() : null
        );
    }

}
