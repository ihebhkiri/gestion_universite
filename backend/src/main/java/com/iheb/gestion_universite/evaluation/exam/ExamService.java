package com.iheb.gestion_universite.evaluation.exam;

import com.iheb.gestion_universite.academic.academic_class.AcademicClassEntity;
import com.iheb.gestion_universite.academic.academic_class.ClassRepository;
import com.iheb.gestion_universite.academic.semester.SemesterEntity;
import com.iheb.gestion_universite.academic.semester.SemesterRepository;
import com.iheb.gestion_universite.core.exceptions.ExamAlreadyExistsException;
import com.iheb.gestion_universite.core.exceptions.ExamNotFoundException;
import com.iheb.gestion_universite.core.exceptions.TeacherNotFoundException;
import com.iheb.gestion_universite.evaluation.exam.dto.AddExamRequest;
import com.iheb.gestion_universite.evaluation.exam.dto.AddExamResponse;
import com.iheb.gestion_universite.evaluation.exam.dto.ExamConflictCheckRequest;
import com.iheb.gestion_universite.evaluation.exam.dto.ExamConflictResponse;
import com.iheb.gestion_universite.evaluation.exam.dto.ExamRequest;
import com.iheb.gestion_universite.evaluation.exam.dto.ExamResponse;
import com.iheb.gestion_universite.evaluation.exam.dto.ExamSummaryResponse;
import com.iheb.gestion_universite.student_managment.student_group.GroupRepository;
import com.iheb.gestion_universite.student_managment.student_group.StudentGroupEntity;
import com.iheb.gestion_universite.teaching.course.CourseEntity;
import com.iheb.gestion_universite.teaching.course.CourseRepository;
import com.iheb.gestion_universite.teaching.room.RoomEntity;
import com.iheb.gestion_universite.teaching.room.RoomRepository;
import com.iheb.gestion_universite.teaching.teacher.TeacherEntity;
import com.iheb.gestion_universite.teaching.teacher.TeacherRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
@Transactional
public class ExamService {

    private final CourseRepository courseRepository;
    private final TeacherRepository teacherRepository;
    private final ExamRepo examRepo;
    private final ClassRepository classRepository;
    private final GroupRepository groupRepository;
    private final RoomRepository roomRepository;
    private final SemesterRepository semesterRepository;
    private final ExamMapper examMapper;

    public AddExamResponse createExam(AddExamRequest request, Long courseId) {
        checkExamNotExists(request, courseId);
        CourseEntity course = getCourseOrThrow(courseId);
        getTeachersOrThrow(request.teacherIds());

        ExamEntity exam = new ExamEntity();
        exam.setDuration(request.duration());
        exam.setWeight(request.weight());
        exam.setType(ExamType.valueOf(request.type()));
        exam.setSessionType(SessionType.valueOf(request.session()));
        exam.setStatus(ExamStatus.PLANNED);
        exam.setTitle(request.title());
        exam.setCourse(course);
        exam.setCreatedAt(Instant.now());
        examRepo.save(exam);

        return new AddExamResponse(
                exam.getTitle(),
                exam.getWeight(),
                exam.getDuration(),
                exam.getType().name(),
                courseId
        );
    }

    public ExamResponse createManagedExam(ExamRequest request) {
        validateSchedule(request.examDate(), request.startTime(), request.endTime());
        ExamEntity exam = new ExamEntity();
        applyRequest(exam, request);
        exam.setCreatedAt(Instant.now());
        ensureNoConflicts(exam, null);
        return examMapper.toResponse(examRepo.save(exam));
    }

    public ExamResponse updateManagedExam(Long id, ExamRequest request) {
        validateSchedule(request.examDate(), request.startTime(), request.endTime());
        ExamEntity exam = getExamOrThrow(id);
        if (exam.getStatus() == ExamStatus.COMPLETED) {
            throw new IllegalArgumentException("Completed exams cannot be edited");
        }
        applyRequest(exam, request);
        ensureNoConflicts(exam, id);
        return examMapper.toResponse(examRepo.save(exam));
    }

    public ExamResponse cancelExam(Long id) {
        ExamEntity exam = getExamOrThrow(id);
        exam.setStatus(ExamStatus.CANCELLED);
        return examMapper.toResponse(examRepo.save(exam));
    }

    public void deleteExam(Long id) {
        ExamEntity exam = getExamOrThrow(id);
        exam.setStatus(ExamStatus.CANCELLED);
        examRepo.save(exam);
    }

    @Transactional(readOnly = true)
    public List<ExamResponse> findExams(
            Long academicYearId,
            Long semesterId,
            Long classId,
            Long groupId,
            Long courseId,
            Long supervisorId,
            Long roomId,
            LocalDate date,
            ExamStatus status
    ) {
        return filteredExams(academicYearId, semesterId, classId, groupId, courseId, supervisorId, roomId, date, status)
                .stream()
                .sorted(Comparator
                        .comparing((ExamEntity exam) -> exam.getExamDate() != null ? exam.getExamDate() : LocalDate.MAX)
                        .thenComparing(exam -> exam.getStartTime() != null ? exam.getStartTime() : LocalTime.MAX))
                .map(examMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ExamResponse> findExamsByDay(LocalDate date, Long classId, Long groupId, Long roomId) {
        return findExams(null, null, classId, groupId, null, null, roomId, date, null);
    }

    @Transactional(readOnly = true)
    public List<ExamResponse> findStudentVisibleExams(Long classId, Long groupId) {
        if (classId == null) {
            return List.of();
        }

        return findExams(null, null, classId, null, null, null, null, null, null)
                .stream()
                .filter(exam -> exam.groupId() == null || groupId != null && exam.groupId().equals(groupId))
                .toList();
    }

    @Transactional(readOnly = true)
    public ExamResponse getExamDetails(Long id) {
        return examRepo.findAllWithRelations()
                .stream()
                .filter(exam -> exam.getId().equals(id))
                .findFirst()
                .map(examMapper::toResponse)
                .orElseThrow(() -> new ExamNotFoundException("Exam not found with id: " + id));
    }

    public ExamResponse changeStatus(Long id, ExamStatus status) {
        ExamEntity exam = getExamOrThrow(id);
        if (status != ExamStatus.CANCELLED && exam.getStatus() == ExamStatus.CANCELLED) {
            ensureNoConflicts(exam, id);
        }
        exam.setStatus(status);
        return examMapper.toResponse(examRepo.save(exam));
    }

    @Transactional(readOnly = true)
    public ExamSummaryResponse getSummary(
            Long academicYearId,
            Long semesterId,
            Long classId,
            Long groupId,
            Long courseId,
            Long supervisorId,
            Long roomId,
            LocalDate date,
            ExamStatus status
    ) {
        List<ExamEntity> exams = filteredExams(academicYearId, semesterId, classId, groupId, courseId, supervisorId, roomId, date, status);
        LocalDate today = LocalDate.now();
        long conflicts = exams.stream()
                .filter(exam -> exam.getExamDate() != null && exam.getStartTime() != null && exam.getEndTime() != null)
                .flatMap(exam -> conflictsFor(exam.getExamDate(), exam.getStartTime(), exam.getEndTime(), exam.getRoom(), exam.getAcademicClass(), exam.getStudentGroup(), exam.getSupervisor(), exam.getId()).stream())
                .count();

        return new ExamSummaryResponse(
                exams.size(),
                exams.stream().filter(exam -> exam.getStatus() != ExamStatus.CANCELLED && exam.getExamDate() != null && !exam.getExamDate().isBefore(today)).count(),
                exams.stream().filter(exam -> today.equals(exam.getExamDate())).count(),
                exams.stream().map(ExamEntity::getRoom).filter(Objects::nonNull).map(RoomEntity::getId).distinct().count(),
                exams.stream().filter(exam -> exam.getStatus() == ExamStatus.PLANNED).count(),
                exams.stream().filter(exam -> exam.getStatus() == ExamStatus.IN_PROGRESS).count(),
                exams.stream().filter(exam -> exam.getStatus() == ExamStatus.COMPLETED).count(),
                exams.stream().filter(exam -> exam.getStatus() == ExamStatus.CANCELLED).count(),
                conflicts
        );
    }

    @Transactional(readOnly = true)
    public List<ExamConflictResponse> checkConflicts(ExamConflictCheckRequest request) {
        validateSchedule(request.examDate(), request.startTime(), request.endTime());
        RoomEntity room = request.roomId() != null ? getRoomOrThrow(request.roomId()) : null;
        AcademicClassEntity academicClass = request.classId() != null ? getClassOrThrow(request.classId()) : null;
        StudentGroupEntity group = request.groupId() != null ? getGroupOrThrow(request.groupId()) : null;
        TeacherEntity supervisor = request.supervisorId() != null ? getTeacherOrThrow(request.supervisorId()) : null;
        return conflictsFor(request.examDate(), request.startTime(), request.endTime(), room, academicClass, group, supervisor, request.examId());
    }

    private void applyRequest(ExamEntity exam, ExamRequest request) {
        exam.setTitle(request.title().trim());
        exam.setCourse(getCourseOrThrow(request.courseId()));
        exam.setAcademicClass(getClassOrThrow(request.classId()));
        exam.setStudentGroup(request.groupId() != null ? getGroupOrThrow(request.groupId()) : null);
        exam.setRoom(getRoomOrThrow(request.roomId()));
        exam.setSupervisor(getTeacherOrThrow(request.supervisorId()));
        exam.setSemester(getSemesterOrThrow(request.semesterId()));
        exam.setExamDate(request.examDate());
        exam.setStartTime(request.startTime());
        exam.setEndTime(request.endTime());
        exam.setType(request.type());
        exam.setSessionType(request.sessionType() != null ? request.sessionType() : SessionType.MAIN);
        exam.setStatus(request.status() != null ? request.status() : ExamStatus.PLANNED);
        exam.setDuration(request.duration());
        exam.setWeight(request.weight());
        exam.setInstructions(request.instructions());
    }

    private List<ExamEntity> filteredExams(
            Long academicYearId,
            Long semesterId,
            Long classId,
            Long groupId,
            Long courseId,
            Long supervisorId,
            Long roomId,
            LocalDate date,
            ExamStatus status
    ) {
        return examRepo.findAllWithRelations()
                .stream()
                .filter(exam -> academicYearId == null
                        || exam.getSemester() != null
                        && exam.getSemester().getAcademicYear() != null
                        && academicYearId.equals(exam.getSemester().getAcademicYear().getId())
                        || exam.getAcademicClass() != null
                        && exam.getAcademicClass().getAcademicYear() != null
                        && academicYearId.equals(exam.getAcademicClass().getAcademicYear().getId()))
                .filter(exam -> semesterId == null || exam.getSemester() != null && semesterId.equals(exam.getSemester().getId()))
                .filter(exam -> classId == null || exam.getAcademicClass() != null && classId.equals(exam.getAcademicClass().getId()))
                .filter(exam -> groupId == null || exam.getStudentGroup() != null && groupId.equals(exam.getStudentGroup().getId()))
                .filter(exam -> courseId == null || exam.getCourse() != null && courseId.equals(exam.getCourse().getId()))
                .filter(exam -> supervisorId == null || exam.getSupervisor() != null && supervisorId.equals(exam.getSupervisor().getId()))
                .filter(exam -> roomId == null || exam.getRoom() != null && roomId.equals(exam.getRoom().getId()))
                .filter(exam -> date == null || date.equals(exam.getExamDate()))
                .filter(exam -> status == null || exam.getStatus() == status)
                .toList();
    }

    private void ensureNoConflicts(ExamEntity exam, Long excludedId) {
        if (exam.getStatus() == ExamStatus.CANCELLED) return;
        List<ExamConflictResponse> conflicts = conflictsFor(
                exam.getExamDate(),
                exam.getStartTime(),
                exam.getEndTime(),
                exam.getRoom(),
                exam.getAcademicClass(),
                exam.getStudentGroup(),
                exam.getSupervisor(),
                excludedId
        );
        if (!conflicts.isEmpty()) {
            throw new ExamConflictException(conflicts.get(0).message());
        }
    }

    private List<ExamConflictResponse> conflictsFor(
            LocalDate examDate,
            LocalTime startTime,
            LocalTime endTime,
            RoomEntity room,
            AcademicClassEntity academicClass,
            StudentGroupEntity group,
            TeacherEntity supervisor,
            Long excludedId
    ) {
        return examRepo.findActiveOverlapping(examDate, startTime, endTime, excludedId)
                .stream()
                .flatMap(existing -> conflictResponses(existing, room, academicClass, group, supervisor).stream())
                .toList();
    }

    private List<ExamConflictResponse> conflictResponses(
            ExamEntity existing,
            RoomEntity room,
            AcademicClassEntity academicClass,
            StudentGroupEntity group,
            TeacherEntity supervisor
    ) {
        return java.util.stream.Stream.of(
                        room != null && existing.getRoom() != null && existing.getRoom().getId().equals(room.getId())
                                ? new ExamConflictResponse("ROOM", "Room is already used by another exam during this time slot", existing.getId(), existing.getTitle())
                                : null,
                        academicClass != null && existing.getAcademicClass() != null && existing.getAcademicClass().getId().equals(academicClass.getId())
                                ? new ExamConflictResponse("CLASS", "Academic class already has another exam during this time slot", existing.getId(), existing.getTitle())
                                : null,
                        group != null && existing.getStudentGroup() != null && existing.getStudentGroup().getId().equals(group.getId())
                                ? new ExamConflictResponse("GROUP", "Group already has another exam during this time slot", existing.getId(), existing.getTitle())
                                : null,
                        supervisor != null && existing.getSupervisor() != null && existing.getSupervisor().getId().equals(supervisor.getId())
                                ? new ExamConflictResponse("SUPERVISOR", "Supervisor is already assigned to another exam during this time slot", existing.getId(), existing.getTitle())
                                : null
                )
                .filter(Objects::nonNull)
                .toList();
    }

    private void validateSchedule(LocalDate examDate, LocalTime startTime, LocalTime endTime) {
        if (examDate == null) {
            throw new IllegalArgumentException("Exam date is required");
        }
        if (startTime == null || endTime == null || !endTime.isAfter(startTime)) {
            throw new IllegalArgumentException("End time must be after start time");
        }
    }

    private void checkExamNotExists(AddExamRequest request, Long courseId) {
        boolean exists = examRepo.existsByCourseIdAndTitleAndTypeAndSessionType(
                courseId,
                request.title(),
                ExamType.valueOf(request.type()),
                SessionType.valueOf(request.session())
        );
        if (exists) {
            throw new ExamAlreadyExistsException("Exam already exists for this course " + courseId);
        }
    }

    private List<TeacherEntity> getTeachersOrThrow(List<Long> teacherIds) {
        if (teacherIds == null || teacherIds.isEmpty()) {
            return List.of();
        }
        List<TeacherEntity> teachers = teacherRepository.findAllById(teacherIds);
        if (teachers.size() != teacherIds.size()) {
            throw new TeacherNotFoundException("One or more teachers not found");
        }
        return teachers;
    }

    private ExamEntity getExamOrThrow(Long id) {
        return examRepo.findById(id)
                .orElseThrow(() -> new ExamNotFoundException("Exam not found with id: " + id));
    }

    private CourseEntity getCourseOrThrow(Long courseId) {
        return courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException("Course not found with id: " + courseId));
    }

    private TeacherEntity getTeacherOrThrow(Long teacherId) {
        return teacherRepository.findById(teacherId)
                .orElseThrow(() -> new TeacherNotFoundException("Teacher not found with id: " + teacherId));
    }

    private AcademicClassEntity getClassOrThrow(Long classId) {
        return classRepository.findById(classId)
                .orElseThrow(() -> new IllegalArgumentException("Class not found with id: " + classId));
    }

    private StudentGroupEntity getGroupOrThrow(Long groupId) {
        return groupRepository.findById(groupId)
                .orElseThrow(() -> new IllegalArgumentException("Group not found with id: " + groupId));
    }

    private RoomEntity getRoomOrThrow(Long roomId) {
        return roomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("Room not found with id: " + roomId));
    }

    private SemesterEntity getSemesterOrThrow(Long semesterId) {
        return semesterRepository.findById(semesterId)
                .orElseThrow(() -> new IllegalArgumentException("Semester not found with id: " + semesterId));
    }
}
