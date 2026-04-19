package com.iheb.gestion_universite.teaching.subject;

import com.iheb.gestion_universite.teaching.subject.dto.AddSubjectRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor

public class SubjectService {
    private final SubjectRepository subjectRepository;

    public SubjectEntity createSubject(AddSubjectRequest request) {
        checkSubjectExists(request.subjectName());
        SubjectEntity subject = new SubjectEntity();
        subject.setSubjectName(request.subjectName());
        return subjectRepository.save(subject);
    }

    public SubjectEntity getSubjectById(Long id) {
        return subjectRepository.findById(id).orElseThrow(() -> new RuntimeException("Subject not found"));
    }

    public SubjectEntity updateSubject(Long id, AddSubjectRequest request) {
        SubjectEntity existingSubject = getSubjectById(id);
        existingSubject.setSubjectName(request.subjectName());
        return subjectRepository.save(existingSubject);
    }

    public void deleteSubject(Long id) {
        subjectRepository.deleteById(id);
    }
    private void checkSubjectExists(String subjectName) {
        if (subjectRepository.existsBySubjectName(subjectName)) {
            throw new RuntimeException("Subject already exists");
        }
    }

}
