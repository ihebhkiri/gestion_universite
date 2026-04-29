package com.iheb.gestion_universite.teaching.timetable;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class TimetableService {

    private final TimetableRepository timetableRepository;

    public TimetableEntity create(TimetableEntity entry) {
        validateEntry(entry);
        ensureNoConflicts(entry, null);
        return timetableRepository.save(entry);
    }

    public TimetableEntity update(Long id, TimetableEntity next) {
        TimetableEntity existing = getById(id);
        validateEntry(next);
        ensureNoConflicts(next, id);

        existing.setDayOfWeek(next.getDayOfWeek());
        existing.setStartTime(next.getStartTime());
        existing.setEndTime(next.getEndTime());
        existing.setSessionType(next.getSessionType());
        existing.setCourse(next.getCourse());
        existing.setTeacher(next.getTeacher());
        existing.setRoom(next.getRoom());
        existing.setAcademicClass(next.getAcademicClass());
        existing.setSemester(next.getSemester());
        return timetableRepository.save(existing);
    }

    public void delete(Long id) {
        timetableRepository.delete(getById(id));
    }

    public TimetableEntity getById(Long id) {
        return timetableRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Timetable entry not found with id: " + id));
    }

    public List<TimetableEntity> findAll(Long classId, Long semesterId) {
        if (classId != null && semesterId != null) {
            return timetableRepository.findByAcademicClassIdAndSemesterId(classId, semesterId);
        }
        if (classId != null) {
            return timetableRepository.findByAcademicClassId(classId);
        }
        if (semesterId != null) {
            return timetableRepository.findBySemesterId(semesterId);
        }
        return timetableRepository.findAll();
    }

    private void validateEntry(TimetableEntity entry) {
        if (entry.getEndTime() == null || entry.getStartTime() == null || !entry.getEndTime().isAfter(entry.getStartTime())) {
            throw new IllegalArgumentException("End time must be after start time");
        }
    }

    private void ensureNoConflicts(TimetableEntity entry, Long excludedId) {
        Long semesterId = entry.getSemester() != null ? entry.getSemester().getId() : null;
        DayOfWeek day = entry.getDayOfWeek();
        LocalTime start = entry.getStartTime();
        LocalTime end = entry.getEndTime();

        if (timetableRepository.hasTeacherConflict(entry.getTeacher().getId(), day, start, end, semesterId, excludedId)) {
            throw new TimetableConflictException("Teacher is already assigned during this time slot");
        }
        if (timetableRepository.hasRoomConflict(entry.getRoom().getId(), day, start, end, semesterId, excludedId)) {
            throw new TimetableConflictException("Room is already occupied during this time slot");
        }
        if (timetableRepository.hasClassConflict(entry.getAcademicClass().getId(), day, start, end, semesterId, excludedId)) {
            throw new TimetableConflictException("Academic class already has a course during this time slot");
        }
    }
}
