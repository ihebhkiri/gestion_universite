package com.iheb.gestion_universite.evaluation.grade.services;


import com.iheb.gestion_universite.evaluation.grade.dtos.AddGradeRequest;
import com.iheb.gestion_universite.evaluation.grade.dtos.AddGradeResponse;
import com.iheb.gestion_universite.evaluation.exam.ExamEntity;
import com.iheb.gestion_universite.evaluation.grade.entities.GradeEntity;
import com.iheb.gestion_universite.evaluation.grade.entities.GradeStatus;
import com.iheb.gestion_universite.evaluation.exam.ExamRepo;
import com.iheb.gestion_universite.evaluation.grade.repositories.GradesRepo;
import com.iheb.gestion_universite.core.exceptions.ExamNotFoundException;
import com.iheb.gestion_universite.core.exceptions.GradeAlreadyExistsException;
import com.iheb.gestion_universite.core.exceptions.StudentNotFoundException;
import com.iheb.gestion_universite.student_managment.student.StudentEntity;
import com.iheb.gestion_universite.student_managment.student.StudentRepository;
import com.iheb.gestion_universite.teaching.subject.SubjectRepository;
import com.iheb.gestion_universite.teaching.teacher.TeacherRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class GradesService {

    private final SubjectRepository subjectRepository;

    private final TeacherRepository teacherRepository;

    private final ExamRepo examRepo;

    private final StudentRepository studentRepository;

    private final GradesRepo gradesRepo;

    public AddGradeResponse createGrade (Long examId, AddGradeRequest request) {

        checkGradeNotExists(examId, request.studentId());
        var exam = getExamOrThrow(examId);
        var student = getStudentOrThrow(request.studentId());
        var grade = buildGrade(exam, student, request);
        gradesRepo.save(grade);

        return mapToResponse(grade);
    }

    private AddGradeResponse mapToResponse (GradeEntity grade) {

        ExamEntity exam = grade.getExam();
        StudentEntity student = grade.getStudent();

        return new AddGradeResponse(
                grade.getId(),
                student.getId(),
                exam.getId(),
                exam.getType()
                        .name(),
                grade.getScore()
        );
    }

    private GradeEntity buildGrade (ExamEntity exam,
                                    StudentEntity student,
                                    AddGradeRequest request) {

        GradeEntity grade = new GradeEntity();

        grade.setExam(exam);
        grade.setStudent(student);
        grade.setScore(request.score());
        grade.setMaxScore(exam.getMaxScore() != null ? exam.getMaxScore() : 20.0);
        grade.setStatus(GradeStatus.DRAFT);

        return grade;
    }

    private void checkGradeNotExists (Long examId, Long studentId) {

        boolean exists = gradesRepo.existsByExamIdAndStudentId(examId, studentId);

        if (exists) {
            throw new GradeAlreadyExistsException(
                    "Grade already exists for studentId=" + studentId +
                            " and examId=" + examId
            );
        }
    }

    private ExamEntity getExamOrThrow (Long examId) {

        return examRepo.findById(examId)
                .orElseThrow(() -> new ExamNotFoundException("Exam not found: " + examId));
    }

    private StudentEntity getStudentOrThrow (Long studentId) {

        return studentRepository.findById(studentId)
                .orElseThrow(() -> new StudentNotFoundException("Student not found: " + studentId));
    }

}
