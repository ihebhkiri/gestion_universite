package com.iheb.gestion_universite.teaching.subject;

import org.springframework.data.jpa.repository.JpaRepository;

public interface SubjectRepository  extends JpaRepository<SubjectEntity, Long> {
  boolean existsBySubjectName(String subjectName);
  boolean existsBySubjectNameIgnoreCase(String subjectName);
  boolean existsBySubjectNameIgnoreCaseAndIdNot(String subjectName, Long id);
}
