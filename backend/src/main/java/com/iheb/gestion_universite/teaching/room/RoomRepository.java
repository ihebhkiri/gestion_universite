package com.iheb.gestion_universite.teaching.room;

import org.springframework.data.jpa.repository.JpaRepository;

public interface RoomRepository extends JpaRepository<RoomEntity, Long> {
    boolean existsByCodeIgnoreCase(String code);
}
