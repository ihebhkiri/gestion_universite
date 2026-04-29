package com.iheb.gestion_universite.teaching.timetable;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.List;

public interface TimetableRepository extends JpaRepository<TimetableEntity, Long> {

    List<TimetableEntity> findByAcademicClassIdAndSemesterId(Long academicClassId, Long semesterId);

    List<TimetableEntity> findByAcademicClassId(Long academicClassId);

    List<TimetableEntity> findBySemesterId(Long semesterId);

    @Query("""
            select count(entry) > 0
            from TimetableEntity entry
            where entry.teacher.id = :teacherId
              and entry.dayOfWeek = :dayOfWeek
              and (:semesterId is null or entry.semester.id = :semesterId)
              and (:excludedId is null or entry.id <> :excludedId)
              and entry.startTime < :endTime
              and entry.endTime > :startTime
            """)
    boolean hasTeacherConflict(
            @Param("teacherId") Long teacherId,
            @Param("dayOfWeek") DayOfWeek dayOfWeek,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime,
            @Param("semesterId") Long semesterId,
            @Param("excludedId") Long excludedId
    );

    @Query("""
            select count(entry) > 0
            from TimetableEntity entry
            where entry.room.id = :roomId
              and entry.dayOfWeek = :dayOfWeek
              and (:semesterId is null or entry.semester.id = :semesterId)
              and (:excludedId is null or entry.id <> :excludedId)
              and entry.startTime < :endTime
              and entry.endTime > :startTime
            """)
    boolean hasRoomConflict(
            @Param("roomId") Long roomId,
            @Param("dayOfWeek") DayOfWeek dayOfWeek,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime,
            @Param("semesterId") Long semesterId,
            @Param("excludedId") Long excludedId
    );

    @Query("""
            select count(entry) > 0
            from TimetableEntity entry
            where entry.academicClass.id = :classId
              and entry.dayOfWeek = :dayOfWeek
              and (:semesterId is null or entry.semester.id = :semesterId)
              and (:excludedId is null or entry.id <> :excludedId)
              and entry.startTime < :endTime
              and entry.endTime > :startTime
            """)
    boolean hasClassConflict(
            @Param("classId") Long classId,
            @Param("dayOfWeek") DayOfWeek dayOfWeek,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime,
            @Param("semesterId") Long semesterId,
            @Param("excludedId") Long excludedId
    );
}
