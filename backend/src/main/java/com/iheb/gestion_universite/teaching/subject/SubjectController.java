package com.iheb.gestion_universite.teaching.subject;


import com.iheb.gestion_universite.teaching.subject.dto.AddSubjectRequest;
import com.iheb.gestion_universite.teaching.subject.dto.SubjectDataResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/admin/subjects")
public class SubjectController {
private final SubjectService subjectService;
@PostMapping
    public ResponseEntity<Void> createSubject(@Valid @RequestBody AddSubjectRequest request) {
        subjectService.createSubject(request);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }
    @PutMapping("/{id}")
    public ResponseEntity<Void> updateSubject(@PathVariable Long id, @Valid @RequestBody AddSubjectRequest request) {
        subjectService.updateSubject(id, request);
        return ResponseEntity.ok().build();
    }

    @GetMapping
    public ResponseEntity<List<SubjectDataResponse>> getSubjects() {
        return ResponseEntity.ok(subjectService.getSubjects());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SubjectDataResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(subjectService.getOne(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteById(@PathVariable Long id) {
        subjectService.deleteSubject(id);
        return ResponseEntity.noContent().build();
    }


}
