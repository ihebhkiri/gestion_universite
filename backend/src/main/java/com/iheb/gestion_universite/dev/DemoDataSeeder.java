package com.iheb.gestion_universite.dev;

import com.iheb.gestion_universite.academic.academic_class.AcademicClassEntity;
import com.iheb.gestion_universite.academic.academic_class.ClassRepository;
import com.iheb.gestion_universite.academic.academic_class.Session;
import com.iheb.gestion_universite.academic.academic_year.AcademicYearEntity;
import com.iheb.gestion_universite.academic.academic_year.AcademicYearRepository;
import com.iheb.gestion_universite.academic.department.DepartmentEntity;
import com.iheb.gestion_universite.academic.department.DepartmentRepo;
import com.iheb.gestion_universite.academic.program.ProgramEntity;
import com.iheb.gestion_universite.academic.program.ProgramRepository;
import com.iheb.gestion_universite.academic.semester.SemesterEntity;
import com.iheb.gestion_universite.academic.semester.SemesterRepository;
import com.iheb.gestion_universite.academic.semester.SemesterStatus;
import com.iheb.gestion_universite.academic.speciality.SpecialityEntity;
import com.iheb.gestion_universite.academic.speciality.SpecialityRepository;
import com.iheb.gestion_universite.attendance.entity.AttendanceRecordEntity;
import com.iheb.gestion_universite.attendance.entity.AttendanceSessionEntity;
import com.iheb.gestion_universite.attendance.entity.AttendanceSessionStatus;
import com.iheb.gestion_universite.attendance.entity.AttendanceStatus;
import com.iheb.gestion_universite.attendance.repository.AttendanceSessionRepository;
import com.iheb.gestion_universite.evaluation.exam.ExamEntity;
import com.iheb.gestion_universite.evaluation.exam.ExamRepo;
import com.iheb.gestion_universite.evaluation.exam.ExamStatus;
import com.iheb.gestion_universite.evaluation.exam.ExamType;
import com.iheb.gestion_universite.evaluation.exam.SessionType;
import com.iheb.gestion_universite.evaluation.grade.entities.GradeEntity;
import com.iheb.gestion_universite.evaluation.grade.entities.GradeStatus;
import com.iheb.gestion_universite.evaluation.grade.repositories.GradesRepo;
import com.iheb.gestion_universite.security.role.RoleEntity;
import com.iheb.gestion_universite.security.role.RoleRepository;
import com.iheb.gestion_universite.security.user.UserEntity;
import com.iheb.gestion_universite.security.user.UserRepository;
import com.iheb.gestion_universite.student_managment.student.StudentEntity;
import com.iheb.gestion_universite.student_managment.student.StudentRepository;
import com.iheb.gestion_universite.student_managment.student_enrollment.EnrollmentRepo;
import com.iheb.gestion_universite.student_managment.student_enrollment.EnrollmentStatus;
import com.iheb.gestion_universite.student_managment.student_enrollment.StudentEnrollmentEntity;
import com.iheb.gestion_universite.student_managment.student_group.GroupRepository;
import com.iheb.gestion_universite.student_managment.student_group.StudentGroupEntity;
import com.iheb.gestion_universite.teaching.course.CourseEntity;
import com.iheb.gestion_universite.teaching.course.CourseRepository;
import com.iheb.gestion_universite.teaching.room.RoomEntity;
import com.iheb.gestion_universite.teaching.room.RoomRepository;
import com.iheb.gestion_universite.teaching.subject.SubjectEntity;
import com.iheb.gestion_universite.teaching.subject.SubjectRepository;
import com.iheb.gestion_universite.teaching.teacher.TeacherEntity;
import com.iheb.gestion_universite.teaching.teacher.TeacherRepository;
import com.iheb.gestion_universite.teaching.teacher.TeacherStatus;
import com.iheb.gestion_universite.teaching.teacher_assignment.TeacherAssignmentEntity;
import com.iheb.gestion_universite.teaching.teacher_assignment.TeacherAssignmentRepository;
import com.iheb.gestion_universite.teaching.timetable.CourseSessionType;
import com.iheb.gestion_universite.teaching.timetable.TimetableEntity;
import com.iheb.gestion_universite.teaching.timetable.TimetableRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.DayOfWeek;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

@Component
@Profile({"dev", "prod"})
@Order(20)
@RequiredArgsConstructor
public class DemoDataSeeder implements CommandLineRunner {

    private static final String DEFAULT_PASSWORD = "testtest";

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final DepartmentRepo departmentRepo;
    private final ProgramRepository programRepository;
    private final SpecialityRepository specialityRepository;
    private final AcademicYearRepository academicYearRepository;
    private final SemesterRepository semesterRepository;
    private final ClassRepository classRepository;
    private final GroupRepository groupRepository;
    private final SubjectRepository subjectRepository;
    private final CourseRepository courseRepository;
    private final RoomRepository roomRepository;
    private final TeacherRepository teacherRepository;
    private final TeacherAssignmentRepository assignmentRepository;
    private final StudentRepository studentRepository;
    private final EnrollmentRepo enrollmentRepo;
    private final TimetableRepository timetableRepository;
    private final ExamRepo examRepo;
    private final GradesRepo gradesRepo;
    private final AttendanceSessionRepository attendanceSessionRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        RoleEntity adminRole = role("ROLE_ADMIN");
        RoleEntity teacherRole = role("ROLE_TEACHER");
        RoleEntity studentRole = role("ROLE_STUDENT");

        user("admin@academix.test", adminRole);

        DepartmentEntity computerScience = department("INFO", "Computer Science");
        DepartmentEntity management = department("MGMT", "Management");

        ProgramEntity prep = program("PREP", "Preparatory Cycle", computerScience);
        ProgramEntity engineering = program("ING", "Software Engineering", computerScience);
        program("BUS", "Business Administration", management);

        SpecialityEntity glsi = speciality("GLSI", "Software Engineering and Information Systems", engineering);
        SpecialityEntity sdia = speciality("SDIA", "Data Science and Artificial Intelligence", engineering);
        SpecialityEntity commonCore = speciality("CC", "Common Core", prep);

        AcademicYearEntity year = academicYear("2025-2026", true);
        SemesterEntity s1 = semester("S1", year, SemesterStatus.IN_PROGRESS);
        SemesterEntity s2 = semester("S2", year, SemesterStatus.PLANNED);

        AcademicClassEntity prepClass = academicClass(1, Session.JOUR, prep, commonCore, year);
        AcademicClassEntity glsiClass = academicClass(3, Session.JOUR, engineering, glsi, year);
        AcademicClassEntity sdiaClass = academicClass(3, Session.JOUR, engineering, sdia, year);

        StudentGroupEntity prepG1 = group("PREP-1-J-CC-G1", 30, prepClass);
        StudentGroupEntity glsiG1 = group("ING-3-J-GLSI-G1", 28, glsiClass);
        group("ING-3-J-SDIA-G1", 26, sdiaClass);

        SubjectEntity javaSubject = subject("Java Spring Boot");
        SubjectEntity dbSubject = subject("Advanced Databases");
        SubjectEntity aiSubject = subject("Machine Learning");

        CourseEntity springCourse = course("CS101", "Spring Boot Architecture", 4, 3.0, 42, javaSubject);
        CourseEntity databaseCourse = course("DB201", "Database Design", 3, 2.0, 36, dbSubject);
        CourseEntity aiCourse = course("AI301", "Applied Machine Learning", 4, 3.0, 44, aiSubject);

        RoomEntity roomA101 = room("A101", "Amphi A101", 120, "AMPHI", "Main", "Ground floor");
        RoomEntity roomLab1 = room("LAB-1", "Software Lab 1", 24, "LAB", "Labs", "Block B");
        RoomEntity roomB204 = room("B204", "Room B204", 40, "CLASSROOM", "Teaching Block", "Second floor");

        TeacherEntity teacherIheb = teacher("TCH-001", "Iheb", "Kiri", "MALE", "10000001", "22000001", "Assistant Professor", computerScience, glsi, "teacher.iheb@academix.test", teacherRole);
        TeacherEntity teacherFatma = teacher("TCH-002", "Fatma", "Trabelsi", "FEMALE", "10000002", "22000002", "Professor", computerScience, sdia, "teacher.fatma@academix.test", teacherRole);

        StudentEntity studentAmina = student("STD-001", "Amina", "Mansouri", "FEMALE", "20000001", "55000001", "student.amina@academix.test", studentRole);
        StudentEntity studentYoussef = student("STD-002", "Youssef", "Ben Ali", "MALE", "20000002", "55000002", "student.youssef@academix.test", studentRole);
        StudentEntity studentNour = student("STD-003", "Nour", "Haddad", "FEMALE", "20000003", "55000003", "student.nour@academix.test", studentRole);
        StudentEntity studentAdam = student("STD-004", "Adam", "Mejri", "MALE", "20000004", "55000004", "student.adam@academix.test", studentRole);

        enrollment(studentAmina, glsiG1);
        enrollment(studentYoussef, glsiG1);
        enrollment(studentNour, glsiG1);
        enrollment(studentAdam, prepG1);

        assignment(teacherIheb, springCourse, s1, glsiClass);
        assignment(teacherIheb, databaseCourse, s1, prepClass);
        assignment(teacherFatma, aiCourse, s1, sdiaClass);

        TimetableEntity liveSlot = liveTimetableSlot(springCourse, teacherIheb, roomLab1, glsiClass, s1);
        timetableSlot(databaseCourse, teacherIheb, roomA101, prepClass, s1, DayOfWeek.MONDAY, LocalTime.of(9, 0), LocalTime.of(10, 30), CourseSessionType.CM);
        timetableSlot(aiCourse, teacherFatma, roomB204, sdiaClass, s1, DayOfWeek.WEDNESDAY, LocalTime.of(14, 0), LocalTime.of(15, 30), CourseSessionType.TD);

        ExamEntity dsSpring = exam(springCourse, "Spring Boot DS", ExamType.DS, SessionType.MAIN, 1.5, 0.4);
        scheduleExam(dsSpring, glsiClass, glsiG1, roomLab1, teacherIheb, s1, LocalDate.now().plusDays(5), LocalTime.of(9, 0), LocalTime.of(10, 30));
        ExamEntity databaseExam = exam(databaseCourse, "Database Main Exam", ExamType.EXAM, SessionType.MAIN, 2.0, 0.6);
        scheduleExam(databaseExam, prepClass, prepG1, roomA101, teacherIheb, s1, LocalDate.now().plusDays(7), LocalTime.of(11, 0), LocalTime.of(13, 0));
        grade(dsSpring, studentAmina, 16.0);
        grade(dsSpring, studentYoussef, 13.5);
        grade(dsSpring, studentNour, 15.0);

        attendanceHistory(liveSlot, List.of(studentAmina, studentYoussef, studentNour));
    }

    private RoleEntity role(String name) {
        return roleRepository.findByName(name)
                .orElseGet(() -> roleRepository.save(RoleEntity.builder().name(name).build()));
    }

    private UserEntity user(String email, RoleEntity role) {
        return userRepository.findByEmail(email).orElseGet(() -> {
            UserEntity user = new UserEntity();
            user.setEmail(email);
            user.setPassword(passwordEncoder.encode(DEFAULT_PASSWORD));
            user.setEnabled(true);
            user.getRoles().add(role);
            return userRepository.save(user);
        });
    }

    private DepartmentEntity department(String code, String name) {
        return departmentRepo.findAll().stream()
                .filter(item -> item.getCode().equalsIgnoreCase(code))
                .findFirst()
                .orElseGet(() -> {
                    DepartmentEntity entity = new DepartmentEntity();
                    entity.setCode(code);
                    entity.setName(name);
                    return departmentRepo.save(entity);
                });
    }

    private ProgramEntity program(String code, String name, DepartmentEntity department) {
        return programRepository.findAll().stream()
                .filter(item -> item.getCode().equalsIgnoreCase(code))
                .findFirst()
                .orElseGet(() -> {
                    ProgramEntity entity = new ProgramEntity();
                    entity.setCode(code);
                    entity.setName(name);
                    entity.setDepartment(department);
                    return programRepository.save(entity);
                });
    }

    private SpecialityEntity speciality(String code, String name, ProgramEntity program) {
        return specialityRepository.findAll().stream()
                .filter(item -> item.getCode().equalsIgnoreCase(code))
                .findFirst()
                .orElseGet(() -> {
                    SpecialityEntity entity = new SpecialityEntity();
                    entity.setCode(code);
                    entity.setName(name);
                    entity.setProgram(program);
                    return specialityRepository.save(entity);
                });
    }

    private AcademicYearEntity academicYear(String label, boolean active) {
        return academicYearRepository.findAll().stream()
                .filter(item -> item.getLabel().equalsIgnoreCase(label))
                .findFirst()
                .orElseGet(() -> {
                    AcademicYearEntity entity = new AcademicYearEntity();
                    entity.setLabel(label);
                    entity.setStartDate(LocalDate.of(2025, 9, 1));
                    entity.setEndDate(LocalDate.of(2026, 6, 30));
                    entity.setActive(active);
                    return academicYearRepository.save(entity);
                });
    }

    private SemesterEntity semester(String name, AcademicYearEntity year, SemesterStatus status) {
        return semesterRepository.findAll().stream()
                .filter(item -> item.getAcademicYear() != null
                        && item.getAcademicYear().getId().equals(year.getId())
                        && item.getName().equalsIgnoreCase(name))
                .findFirst()
                .orElseGet(() -> {
                    SemesterEntity entity = new SemesterEntity();
                    entity.setName(name);
                    entity.setAcademicYear(year);
                    entity.setStatus(status);
                    entity.setStartDate(name.equalsIgnoreCase("S1") ? LocalDate.of(2025, 9, 1) : LocalDate.of(2026, 2, 1));
                    entity.setEndDate(name.equalsIgnoreCase("S1") ? LocalDate.of(2026, 1, 31) : LocalDate.of(2026, 6, 30));
                    entity.setExamStartDate(entity.getEndDate().minusDays(14));
                    entity.setExamEndDate(entity.getEndDate().minusDays(1));
                    entity.setDescription("Demo " + name + " semester");
                    return semesterRepository.save(entity);
                });
    }

    private AcademicClassEntity academicClass(int level, Session session, ProgramEntity program, SpecialityEntity speciality, AcademicYearEntity year) {
        return classRepository.findAll().stream()
                .filter(item -> item.getProgram() != null
                        && item.getSpeciality() != null
                        && item.getAcademicYear() != null
                        && item.getLevel() == level
                        && item.getSession() == session
                        && item.getProgram().getId().equals(program.getId())
                        && item.getSpeciality().getId().equals(speciality.getId())
                        && item.getAcademicYear().getId().equals(year.getId()))
                .findFirst()
                .orElseGet(() -> {
                    AcademicClassEntity entity = new AcademicClassEntity();
                    entity.setLevel(level);
                    entity.setSession(session);
                    entity.setProgram(program);
                    entity.setSpeciality(speciality);
                    entity.setAcademicYear(year);
                    return classRepository.save(entity);
                });
    }

    private StudentGroupEntity group(String name, int capacity, AcademicClassEntity academicClass) {
        return groupRepository.findAll().stream()
                .filter(item -> item.getName().equalsIgnoreCase(name))
                .findFirst()
                .orElseGet(() -> groupRepository.save(StudentGroupEntity.builder()
                        .name(name)
                        .capacity(capacity)
                        .academicClass(academicClass)
                        .build()));
    }

    private SubjectEntity subject(String name) {
        return subjectRepository.findAll().stream()
                .filter(item -> item.getSubjectName().equalsIgnoreCase(name))
                .findFirst()
                .orElseGet(() -> {
                    SubjectEntity entity = new SubjectEntity();
                    entity.setSubjectName(name);
                    return subjectRepository.save(entity);
                });
    }

    private CourseEntity course(String code, String title, int credits, double coefficient, int hours, SubjectEntity subject) {
        return courseRepository.findAll().stream()
                .filter(item -> item.getCode().equalsIgnoreCase(code))
                .findFirst()
                .orElseGet(() -> {
                    CourseEntity entity = new CourseEntity();
                    entity.setCode(code);
                    entity.setTitle(title);
                    entity.setCredits(credits);
                    entity.setCoefficient(coefficient);
                    entity.setHours(hours);
                    entity.setSubject(subject);
                    return courseRepository.save(entity);
                });
    }

    private RoomEntity room(String code, String name, int capacity, String type, String building, String location) {
        return roomRepository.findAll().stream()
                .filter(item -> item.getCode().equalsIgnoreCase(code))
                .findFirst()
                .orElseGet(() -> {
                    RoomEntity entity = new RoomEntity();
                    entity.setCode(code);
                    entity.setName(name);
                    entity.setCapacity(capacity);
                    entity.setType(type);
                    entity.setBuilding(building);
                    entity.setLocation(location);
                    return roomRepository.save(entity);
                });
    }

    private TeacherEntity teacher(String matricule, String firstName, String lastName, String gender, String cin, String phone, String grade, DepartmentEntity department, SpecialityEntity speciality, String email, RoleEntity role) {
        return teacherRepository.findAll().stream()
                .filter(item -> item.getMatricule().equalsIgnoreCase(matricule))
                .findFirst()
                .orElseGet(() -> {
                    TeacherEntity entity = new TeacherEntity();
                    entity.setMatricule(matricule);
                    entity.setFirstName(firstName);
                    entity.setLastName(lastName);
                    entity.setGender(gender);
                    entity.setCin(cin);
                    entity.setPhone(phone);
                    entity.setGrade(grade);
                    entity.setStatus(TeacherStatus.ACTIVE);
                    entity.setHireDate(LocalDate.of(2020, 9, 1));
                    entity.setDepartment(department);
                    entity.setSpeciality(speciality);
                    entity.setUser(user(email, role));
                    return teacherRepository.save(entity);
                });
    }

    private StudentEntity student(String matricule, String firstName, String lastName, String gender, String cin, String phone, String email, RoleEntity role) {
        return studentRepository.findAll().stream()
                .filter(item -> item.getMatricule().equalsIgnoreCase(matricule))
                .findFirst()
                .orElseGet(() -> {
                    StudentEntity entity = new StudentEntity();
                    entity.setMatricule(matricule);
                    entity.setFirstName(firstName);
                    entity.setLastName(lastName);
                    entity.setGender(gender);
                    entity.setCin(cin);
                    entity.setPhone(phone);
                    entity.setEnrollmentDate(LocalDate.of(2025, 9, 1));
                    entity.setUser(user(email, role));
                    return studentRepository.save(entity);
                });
    }

    private void enrollment(StudentEntity student, StudentGroupEntity group) {
        boolean exists = enrollmentRepo.findAll().stream()
                .anyMatch(item -> item.getStudent() != null
                        && item.getGroup() != null
                        && item.getStudent().getId().equals(student.getId())
                        && item.getGroup().getId().equals(group.getId()));
        if (exists) return;

        StudentEnrollmentEntity entity = new StudentEnrollmentEntity();
        entity.setStudent(student);
        entity.setGroup(group);
        entity.setStatus(EnrollmentStatus.CONFIRMED);
        entity.setEnrollmentDate(LocalDate.of(2025, 9, 1));
        enrollmentRepo.save(entity);
    }

    private void assignment(TeacherEntity teacher, CourseEntity course, SemesterEntity semester, AcademicClassEntity academicClass) {
        if (assignmentRepository.existsByTeacherIdAndCourseIdAndSemesterIdAndAcademicClassEntityId(
                teacher.getId(), course.getId(), semester.getId(), academicClass.getId())) return;

        TeacherAssignmentEntity entity = new TeacherAssignmentEntity();
        entity.setTeacher(teacher);
        entity.setCourse(course);
        entity.setSemester(semester);
        entity.setAcademicClassEntity(academicClass);
        assignmentRepository.save(entity);
    }

    private TimetableEntity liveTimetableSlot(CourseEntity course, TeacherEntity teacher, RoomEntity room, AcademicClassEntity academicClass, SemesterEntity semester) {
        TimetableEntity entry = timetableRepository.findAll().stream()
                .filter(item -> item.getCourse() != null
                        && item.getAcademicClass() != null
                        && item.getTeacher() != null
                        && item.getCourse().getId().equals(course.getId())
                        && item.getAcademicClass().getId().equals(academicClass.getId())
                        && item.getTeacher().getId().equals(teacher.getId())
                        && item.getSessionType() == CourseSessionType.TP)
                .findFirst()
                .orElseGet(TimetableEntity::new);

        LocalTime now = LocalTime.now().withSecond(0).withNano(0);
        entry.setDayOfWeek(LocalDate.now().getDayOfWeek());
        entry.setStartTime(now.minusMinutes(15));
        entry.setEndTime(now.plusMinutes(45));
        entry.setSessionType(CourseSessionType.TP);
        entry.setCourse(course);
        entry.setTeacher(teacher);
        entry.setRoom(room);
        entry.setAcademicClass(academicClass);
        entry.setSemester(semester);
        return timetableRepository.save(entry);
    }

    private TimetableEntity timetableSlot(CourseEntity course, TeacherEntity teacher, RoomEntity room, AcademicClassEntity academicClass, SemesterEntity semester, DayOfWeek day, LocalTime start, LocalTime end, CourseSessionType type) {
        return timetableRepository.findAll().stream()
                .filter(item -> item.getCourse() != null
                        && item.getAcademicClass() != null
                        && item.getCourse().getId().equals(course.getId())
                        && item.getAcademicClass().getId().equals(academicClass.getId())
                        && item.getDayOfWeek() == day
                        && item.getStartTime().equals(start))
                .findFirst()
                .orElseGet(() -> {
                    TimetableEntity entity = new TimetableEntity();
                    entity.setDayOfWeek(day);
                    entity.setStartTime(start);
                    entity.setEndTime(end);
                    entity.setSessionType(type);
                    entity.setCourse(course);
                    entity.setTeacher(teacher);
                    entity.setRoom(room);
                    entity.setAcademicClass(academicClass);
                    entity.setSemester(semester);
                    return timetableRepository.save(entity);
                });
    }

    private ExamEntity exam(CourseEntity course, String title, ExamType type, SessionType sessionType, double duration, double weight) {
        return examRepo.findAll().stream()
                .filter(item -> item.getCourse() != null
                        && item.getCourse().getId().equals(course.getId())
                        && item.getTitle().equalsIgnoreCase(title)
                        && item.getType() == type
                        && item.getSessionType() == sessionType)
                .findFirst()
                .orElseGet(() -> {
                    ExamEntity entity = new ExamEntity();
                    entity.setCourse(course);
                    entity.setTitle(title);
                    entity.setType(type);
                    entity.setSessionType(sessionType);
                    entity.setStatus(ExamStatus.PLANNED);
                    entity.setDuration(duration);
                    entity.setWeight(weight);
                    entity.setCreatedAt(Instant.now());
                    return examRepo.save(entity);
                });
    }

    private void scheduleExam(
            ExamEntity exam,
            AcademicClassEntity academicClass,
            StudentGroupEntity group,
            RoomEntity room,
            TeacherEntity supervisor,
            SemesterEntity semester,
            LocalDate date,
            LocalTime start,
            LocalTime end
    ) {
        if (exam.getExamDate() != null) return;
        exam.setAcademicClass(academicClass);
        exam.setStudentGroup(group);
        exam.setRoom(room);
        exam.setSupervisor(supervisor);
        exam.setSemester(semester);
        exam.setExamDate(date);
        exam.setStartTime(start);
        exam.setEndTime(end);
        exam.setInstructions("Demo exam generated for exam management testing.");
        examRepo.save(exam);
    }

    private void grade(ExamEntity exam, StudentEntity student, double score) {
        if (gradesRepo.existsByExamIdAndStudentId(exam.getId(), student.getId())) return;
        GradeEntity entity = new GradeEntity();
        entity.setExam(exam);
        entity.setStudent(student);
        entity.setScore(score);
        entity.setMaxScore(exam.getMaxScore() != null ? exam.getMaxScore() : 20.0);
        entity.setStatus(GradeStatus.VALIDATED);
        entity.setGradedAt(Instant.now());
        gradesRepo.save(entity);
    }

    private void attendanceHistory(TimetableEntity slot, List<StudentEntity> students) {
        LocalDate sessionDate = LocalDate.now().minusDays(1);
        if (attendanceSessionRepository.existsByTimetableEntryIdAndSessionDate(slot.getId(), sessionDate)) return;

        AttendanceSessionEntity session = new AttendanceSessionEntity();
        session.setTitle("Demo attendance history");
        session.setSessionCode("DEMO" + UUID.randomUUID().toString().substring(0, 4).toUpperCase());
        session.setSessionDate(sessionDate);
        session.setStartTime(LocalTime.of(10, 0));
        session.setEndTime(LocalTime.of(10, 45));
        session.setStatus(AttendanceSessionStatus.CLOSED);
        session.setCourse(slot.getCourse());
        session.setAcademicClass(slot.getAcademicClass());
        session.setTeacher(slot.getTeacher());
        session.setTimetableEntry(slot);

        AttendanceStatus[] statuses = {AttendanceStatus.PRESENT, AttendanceStatus.LATE, AttendanceStatus.ABSENT};
        for (int i = 0; i < students.size(); i++) {
            AttendanceRecordEntity record = new AttendanceRecordEntity();
            record.setSession(session);
            record.setStudent(students.get(i));
            record.setStatus(statuses[i % statuses.length]);
            record.setMarkedAt(Instant.now().minusSeconds(3600L - i * 60L));
            session.getRecords().add(record);
        }

        attendanceSessionRepository.save(session);
    }
}
