package com.iheb.gestion_universite.evaluation.exam;


import com.iheb.gestion_universite.evaluation.exam.dto.AddExamRequest;
import com.iheb.gestion_universite.evaluation.exam.dto.AddExamResponse;
import com.iheb.gestion_universite.evaluation.grade.repositories.GradesRepo;
import com.iheb.gestion_universite.core.exceptions.ExamAlreadyExistsException;
import com.iheb.gestion_universite.core.exceptions.TeacherNotFoundException;
import com.iheb.gestion_universite.student_managment.student.StudentRepository;
import com.iheb.gestion_universite.teaching.course.CourseEntity;
import com.iheb.gestion_universite.teaching.course.CourseRepository;
import com.iheb.gestion_universite.teaching.teacher.TeacherEntity;
import com.iheb.gestion_universite.teaching.teacher.TeacherRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ExamService {

    private final CourseRepository courseRepository;

    private final TeacherRepository teacherRepository;

    private final ExamRepo examRepo;

    private final StudentRepository studentRepository;

    private final GradesRepo gradesRepo;
    public AddExamResponse createExam (AddExamRequest request, Long courseId) {

        checkExamNotExists(request, courseId);
        var course = getCourseOrThrow(courseId);
        var teachers = getTeachersOrThrow(request.teacherIds());
        var exam = buildExam(request, course, teachers);
        examRepo.save(exam);
        return mapToResponse(exam, courseId);

    }

    private void checkExamNotExists (AddExamRequest request, Long courseId) {

        boolean exists = examRepo.existsByCourseIdAndTitleAndTypeAndSessionType(courseId, request.title(), ExamType.valueOf(request.type()), SessionType.valueOf(request.session()));
        if (exists) {
            throw new ExamAlreadyExistsException("Exam already exists for this course " + courseId);
        }
    }

    private ExamEntity buildExam (AddExamRequest request, CourseEntity course, List<TeacherEntity> teachers) {

        var exam = new ExamEntity();
        exam.setDuration(request.duration());
        exam.setWeight(request.weight());
        exam.setType(ExamType.valueOf(request.type()));
        exam.setTitle(request.title());
        exam.setCourse(course);
        exam.setCreatedAt(Instant.now());
        return exam;
    }

    private AddExamResponse mapToResponse (ExamEntity exam, Long courseId) {

        return new AddExamResponse(
                exam.getTitle(),
                exam.getWeight(),
                exam.getDuration(),
                exam.getType().name(),
                courseId
        );
    }

    private List<TeacherEntity> getTeachersOrThrow (List<Long> teacherIds) {

        List<TeacherEntity> teachers = teacherRepository.findAllById(teacherIds);

        if (teachers.size() != teacherIds.size()) {
            throw new TeacherNotFoundException("One or more teachers not found");
        }

        return teachers;
    }

    private CourseEntity getCourseOrThrow (Long courseId) {

        return courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

    }


}
