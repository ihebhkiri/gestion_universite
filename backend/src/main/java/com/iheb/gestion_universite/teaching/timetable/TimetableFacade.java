package com.iheb.gestion_universite.teaching.timetable;

import com.iheb.gestion_universite.academic.academic_class.AcademicClassEntity;
import com.iheb.gestion_universite.academic.academic_class.ClassService;
import com.iheb.gestion_universite.academic.semester.SemesterEntity;
import com.iheb.gestion_universite.academic.semester.SemesterService;
import com.iheb.gestion_universite.teaching.course.CourseEntity;
import com.iheb.gestion_universite.teaching.course.CourseService;
import com.iheb.gestion_universite.teaching.room.RoomEntity;
import com.iheb.gestion_universite.teaching.room.RoomService;
import com.iheb.gestion_universite.teaching.teacher.AdminTeachersService;
import com.iheb.gestion_universite.teaching.teacher.TeacherEntity;
import com.iheb.gestion_universite.teaching.timetable.dto.TimetableRequest;
import com.iheb.gestion_universite.teaching.timetable.dto.TimetableResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class TimetableFacade {

    private final TimetableService timetableService;

    private final CourseService courseService;

    private final AdminTeachersService teacherService;

    private final RoomService roomService;

    private final ClassService classService;

    private final SemesterService semesterService;

    public TimetableResponse create (TimetableRequest request) {

        return toResponse(timetableService.create(toEntity(request)));
    }

    public TimetableResponse update (Long id, TimetableRequest request) {

        return toResponse(timetableService.update(id, toEntity(request)));
    }

    public void delete (Long id) {

        timetableService.delete(id);
    }

    public List<TimetableResponse> findAll (Long classId, Long semesterId) {

        return timetableService.findAll(classId, semesterId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public TimetableResponse getOne (Long id) {

        return toResponse(timetableService.getById(id));
    }

    private TimetableEntity toEntity (TimetableRequest request) {

        CourseEntity course = courseService.getEntityById(request.courseId());
        TeacherEntity teacher = teacherService.checkTeacherExists(request.teacherId());
        RoomEntity room = roomService.getById(request.roomId());
        AcademicClassEntity academicClass = classService.getById(request.academicClassId());
        SemesterEntity semester = semesterService.getEntityById(request.semesterId());

        TimetableEntity entry = new TimetableEntity();
        entry.setDayOfWeek(request.dayOfWeek());
        entry.setStartTime(request.startTime());
        entry.setEndTime(request.endTime());
        entry.setSessionType(request.sessionType());
        entry.setCourse(course);
        entry.setTeacher(teacher);
        entry.setRoom(room);
        entry.setAcademicClass(academicClass);
        entry.setSemester(semester);
        return entry;
    }

    private TimetableResponse toResponse (TimetableEntity entry) {

        CourseEntity course = entry.getCourse();
        TeacherEntity teacher = entry.getTeacher();
        RoomEntity room = entry.getRoom();
        AcademicClassEntity academicClass = entry.getAcademicClass();
        SemesterEntity semester = entry.getSemester();
        String teacherName = teacher == null
                ? null
                : (Objects.toString(teacher.getFirstName(), "") + " " + Objects.toString(teacher.getLastName(), "")).trim();

        return new TimetableResponse(
                entry.getId(),
                entry.getDayOfWeek(),
                entry.getStartTime(),
                entry.getEndTime(),
                entry.getSessionType(),
                course != null ? course.getId() : null,
                course != null ? course.getCode() : null,
                course != null ? course.getTitle() : null,
                teacher != null ? teacher.getId() : null,
                teacherName,
                room != null ? room.getId() : null,
                room != null ? room.getCode() : null,
                room != null ? room.getName() : null,
                academicClass != null ? academicClass.getId() : null,
                academicClass != null ? academicClass.getCode() : null,
                semester != null ? semester.getId() : null,
                semester != null ? semester.getName() : null
        );
    }
}
