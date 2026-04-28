package com.iheb.gestion_universite.teaching.course;

import com.iheb.gestion_universite.teaching.course.dto.AddCourseRequest;
import com.iheb.gestion_universite.teaching.course.dto.BulkDeleteCoursesRequest;
import com.iheb.gestion_universite.teaching.course.dto.CourseDataResponse;
import com.iheb.gestion_universite.teaching.course.dto.CourseStatsResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/admin/courses")
public class CourseController {
    private final CourseService courseService;

    @PostMapping
    public ResponseEntity<Void> create(@Valid @RequestBody AddCourseRequest request) {
        courseService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Void> update(@PathVariable Long id, @Valid @RequestBody AddCourseRequest request) {
        courseService.update(id, request);
        return ResponseEntity.ok().build();
    }

    @GetMapping
    public ResponseEntity<List<CourseDataResponse>> getAll() {
        return ResponseEntity.ok(courseService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CourseDataResponse> getOne(@PathVariable Long id) {
        return ResponseEntity.ok(courseService.getOne(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        courseService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/bulk-delete")
    public ResponseEntity<Void> bulkDelete(@Valid @RequestBody BulkDeleteCoursesRequest request) {
        courseService.bulkDelete(request.courseIds());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/stats")
    public ResponseEntity<CourseStatsResponse> getStats() {
        return ResponseEntity.ok(courseService.getStats());
    }
}

