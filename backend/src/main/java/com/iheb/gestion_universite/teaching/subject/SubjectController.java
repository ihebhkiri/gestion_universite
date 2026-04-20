package com.iheb.gestion_universite.teaching.subject;


import com.iheb.gestion_universite.teaching.subject.dto.AddSubjectRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/admin/subjects")
public class SubjectController {
private final SubjectService subjectService;
@PostMapping
    public SubjectEntity createSubject(@RequestBody AddSubjectRequest request) {
        return subjectService.createSubject(request);
    }
    @PutMapping("/{id}")
    public SubjectEntity updateSubject(@PathVariable Long id, @RequestBody AddSubjectRequest request) {
        return subjectService.updateSubject(id, request);
    }

    @GetMapping
    public List<SubjectEntity> getAllSubjects() {
        return subjectService.getAllSubjects();
    }

    @DeleteMapping("/{id}")
    public void deleteSubject(@PathVariable Long id) {
        subjectService.deleteSubject(id);
    }
}
