package com.iheb.gestion_universite.teaching.teacher;


import com.iheb.gestion_universite.academic.department.DepartmentEntity;
import com.iheb.gestion_universite.academic.department.DepartmentRepo;
import com.iheb.gestion_universite.security.role.RoleEntity;
import com.iheb.gestion_universite.security.role.RoleRepository;
import com.iheb.gestion_universite.teaching.teacher.dto.AddTeacherRequest;
import com.iheb.gestion_universite.teaching.teacher.dto.UpdateTeacherRequest;
import com.iheb.gestion_universite.security.user.UserEntity;
import com.iheb.gestion_universite.security.user.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
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

    private final static String matriculePrefix = "TEACHER-";

    public void addTeacher(AddTeacherRequest request) {
        checkUserNotExists(request.email());
        UserEntity user = createUser(request);
        TeacherEntity teacher = createTeacher(user, request);
        teacherRepository.save(teacher);
    }

    public TeacherEntity updateTeacher(Long id, UpdateTeacherRequest request) {
        TeacherEntity teacher = checkTeacherExists(id);
        DepartmentEntity department = departmentRepo.findById(request.departmentId())
                .orElseThrow(() -> new RuntimeException("Department Not Found"));
        teacher.setFirstName(request.firstName());
        teacher.setLastName(request.lastName());
        teacher.setCin(request.cin());
        teacher.setGrade(request.grade());
        teacher.setPhone(request.phone());
        teacher.setGender(request.gender());
        teacher.setDepartment(department);
        teacherRepository.save(teacher);
        return teacher;
    }

    public List<TeacherEntity> findAllTeachers() {
        return teacherRepository.findAll();
    }

    public TeacherEntity checkTeacherExists(Long id) {
        return teacherRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Teacher not Found "));
    }


    private UserEntity createUser(AddTeacherRequest request) {
        RoleEntity role = roleRepository.findByName("ROLE_" + request.role())
                .orElseThrow(() -> new RuntimeException("ROLE Not Found"));
        UserEntity user = new UserEntity();
        user.setEmail(request.email());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.getRoles()
                .add(role);


        return user;
    }

    private TeacherEntity createTeacher(UserEntity user, AddTeacherRequest request) {

        TeacherEntity teacher = new TeacherEntity();
        DepartmentEntity department = departmentRepo.findById(request.departmentId())
                .orElseThrow(() -> new RuntimeException("Department Not Found"));
        teacher.setDepartment(department);
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
        return teacher;


    }

//    HELPERS

    private void checkUserNotExists(String email) {
        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("User already exists ");
        }

    }

//

    private String generateMatricule() {
        return matriculePrefix + UUID.randomUUID()
                .toString()
                .substring(0, 8);
    }

}
