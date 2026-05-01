package com.iheb.gestion_universite.evaluation.exam;

import com.iheb.gestion_universite.academic.academic_class.AcademicClassEntity;
import com.iheb.gestion_universite.academic.academic_year.AcademicYearEntity;
import com.iheb.gestion_universite.academic.semester.SemesterEntity;
import com.iheb.gestion_universite.evaluation.exam.dto.ExamResponse;
import com.iheb.gestion_universite.student_managment.student_group.StudentGroupEntity;
import com.iheb.gestion_universite.teaching.course.CourseEntity;
import com.iheb.gestion_universite.teaching.room.RoomEntity;
import com.iheb.gestion_universite.teaching.teacher.TeacherEntity;
import org.springframework.stereotype.Component;

import java.util.Objects;

@Component
public class ExamMapper {

    public ExamResponse toResponse(ExamEntity exam) {
        CourseEntity course = exam.getCourse();
        AcademicClassEntity academicClass = exam.getAcademicClass();
        StudentGroupEntity group = exam.getStudentGroup();
        RoomEntity room = exam.getRoom();
        TeacherEntity supervisor = exam.getSupervisor();
        SemesterEntity semester = exam.getSemester();
        AcademicYearEntity academicYear = semester != null ? semester.getAcademicYear() : null;

        return new ExamResponse(
                exam.getId(),
                exam.getTitle(),
                exam.getType(),
                exam.getSessionType(),
                exam.getStatus(),
                exam.getDuration(),
                exam.getWeight(),
                exam.getExamDate(),
                exam.getStartTime(),
                exam.getEndTime(),
                exam.getInstructions(),
                course != null ? course.getId() : null,
                course != null ? course.getCode() : null,
                course != null ? course.getTitle() : null,
                academicClass != null ? academicClass.getId() : null,
                academicClass != null ? academicClass.getCode() : null,
                group != null ? group.getId() : null,
                group != null ? group.getName() : null,
                room != null ? room.getId() : null,
                room != null ? room.getCode() : null,
                room != null ? room.getName() : null,
                supervisor != null ? supervisor.getId() : null,
                teacherName(supervisor),
                semester != null ? semester.getId() : null,
                semester != null ? semester.getName() : null,
                academicYear != null ? academicYear.getLabel() : null,
                exam.getCreatedAt()
        );
    }

    private String teacherName(TeacherEntity teacher) {
        if (teacher == null) return null;
        return (Objects.toString(teacher.getFirstName(), "") + " " + Objects.toString(teacher.getLastName(), "")).trim();
    }
}
