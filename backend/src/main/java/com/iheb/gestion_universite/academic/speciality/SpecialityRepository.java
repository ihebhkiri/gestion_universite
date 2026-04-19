package com.iheb.gestion_universite.academic.speciality;

import org.springframework.data.jpa.repository.JpaRepository;

public interface SpecialityRepository extends JpaRepository<SpecialityEntity, Long> {
    boolean existsByName(String name);
    boolean existsByCode(String code);
}
