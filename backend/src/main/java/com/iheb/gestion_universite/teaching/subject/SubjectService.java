package com.iheb.gestion_universite.teaching.subject;

import com.iheb.gestion_universite.teaching.subject.dto.AddSubjectRequest;
import com.iheb.gestion_universite.teaching.subject.dto.SubjectDataResponse;
import com.iheb.gestion_universite.teaching.subject.dto.SubjectStatsResponse;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class SubjectService {
    private final SubjectRepository subjectRepository;

    public SubjectEntity createSubject(AddSubjectRequest request) {
        checkSubjectExists(request.subjectName());
        SubjectEntity subject = new SubjectEntity();
        subject.setSubjectName(request.subjectName().trim().toUpperCase());
        return subjectRepository.save(subject);
    }

    public SubjectEntity getSubjectById(Long id) {
        return subjectRepository.findById(id).orElseThrow(() -> new RuntimeException("Subject not found"));
    }

    public SubjectEntity updateSubject(Long id, AddSubjectRequest request) {
        SubjectEntity existingSubject = getSubjectById(id);
        checkSubjectExistsForUpdate(id, request.subjectName());
        existingSubject.setSubjectName(request.subjectName().trim().toUpperCase());
        return subjectRepository.save(existingSubject);
    }

    public void deleteSubject(Long id) {
        SubjectEntity existingSubject = getSubjectById(id);
        subjectRepository.delete(existingSubject);
    }

    public List<SubjectDataResponse> getSubjects() {
        return subjectRepository.findAll()
                .stream()
                .map(this::mapToDataResponse)
                .toList();
    }

    public SubjectDataResponse getOne(Long id) {
        return mapToDataResponse(getSubjectById(id));
    }


    private void checkSubjectExists(String subjectName) {
        if (subjectRepository.existsBySubjectNameIgnoreCase(subjectName)) {
            throw new RuntimeException("Subject already exists");
        }
    }

    private void checkSubjectExistsForUpdate(Long id, String subjectName) {
        if (subjectRepository.existsBySubjectNameIgnoreCaseAndIdNot(subjectName, id)) {
            throw new RuntimeException("Subject already exists");
        }
    }

    private SubjectDataResponse mapToDataResponse(SubjectEntity entity) {
        return new SubjectDataResponse(entity.getId(), entity.getSubjectName());
    }

}
