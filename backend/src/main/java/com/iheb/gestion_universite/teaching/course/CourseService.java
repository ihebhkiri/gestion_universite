package com.iheb.gestion_universite.teaching.course;

import com.iheb.gestion_universite.teaching.course.dto.AddCourseRequest;
import com.iheb.gestion_universite.teaching.course.dto.CourseDataResponse;
import com.iheb.gestion_universite.teaching.course.dto.CourseStatsResponse;
import com.iheb.gestion_universite.teaching.subject.SubjectEntity;
import com.iheb.gestion_universite.teaching.subject.SubjectRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class CourseService {
    private final CourseRepository courseRepository;
    private final SubjectRepository subjectRepository;

    public CourseEntity create(AddCourseRequest request) {
        checkCodeExists(request.code());
        SubjectEntity subject = getSubjectById(request.subjectId());

        CourseEntity course = new CourseEntity();
        course.setCode(normalizeCode(request.code()));
        course.setTitle(normalizeTitle(request.title()));
        course.setCredits(request.credits());
        course.setHours(request.hours());
        course.setSubject(subject);
        course.setCoefficient(request.coefficient());
        return courseRepository.save(course);
    }

    public CourseEntity update(Long id, AddCourseRequest request) {
        CourseEntity existing = getById(id);
        checkCodeExistsForUpdate(id, request.code());
        SubjectEntity subject = getSubjectById(request.subjectId());

        existing.setCode(normalizeCode(request.code()));
        existing.setTitle(normalizeTitle(request.title()));
        existing.setCredits(request.credits());
        existing.setHours(request.hours());
        existing.setSubject(subject);
        existing.setCoefficient(request.coefficient());
        return courseRepository.save(existing);
    }

    public void delete(Long id) {
        courseRepository.delete(getById(id));
    }

    public void bulkDelete(List<Long> ids) {
        courseRepository.deleteAllByIdInBatch(ids);
    }

    public List<CourseDataResponse> getAll() {
        return courseRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public CourseDataResponse getOne(Long id) {
        return toResponse(getById(id));
    }

    public CourseEntity getEntityById(Long id) {
        return getById(id);
    }

    public CourseStatsResponse getStats() {
        List<CourseEntity> courses = courseRepository.findAll();
        double avgCredits = courses.stream()
                .mapToDouble(c -> c.getCredits() == null ? 0.0 : c.getCredits())
                .average()
                .orElse(0.0);
        long totalHours = courses.stream()
                .mapToLong(c -> c.getHours() == null ? 0 : c.getHours())
                .sum();
        return new CourseStatsResponse(courses.size(), avgCredits, totalHours);
    }

    private CourseEntity getById(Long id) {
        return courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found"));
    }

    private SubjectEntity getSubjectById(Long id) {
        return subjectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Subject not found"));
    }

    private void checkCodeExists(String code) {
        if (courseRepository.existsByCodeIgnoreCase(code)) {
            throw new RuntimeException("Course code already exists");
        }
    }

    private void checkCodeExistsForUpdate(Long id, String code) {
        if (courseRepository.existsByCodeIgnoreCaseAndIdNot(code, id)) {
            throw new RuntimeException("Course code already exists");
        }
    }

    private CourseDataResponse toResponse(CourseEntity entity) {
        Long subjectId = entity.getSubject() != null ? entity.getSubject().getId() : null;
        String subjectName = entity.getSubject() != null ? entity.getSubject().getSubjectName() : null;
        return new CourseDataResponse(
                entity.getId(),
                entity.getCode(),
                entity.getTitle(),
                entity.getCredits(),
                entity.getHours(),
                subjectId,
                subjectName,
                entity.getCoefficient()
        );
    }

    private String normalizeCode(String code) {
        return code == null ? null : code.trim().toUpperCase();
    }

    private String normalizeTitle(String title) {
        return title == null ? null : title.trim();
    }
}

