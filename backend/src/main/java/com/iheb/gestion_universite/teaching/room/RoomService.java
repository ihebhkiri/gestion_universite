package com.iheb.gestion_universite.teaching.room;

import com.iheb.gestion_universite.teaching.room.dto.RoomResponse;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class RoomService {

    private final RoomRepository roomRepository;

    public RoomEntity getById(Long id) {
        return roomRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Room not found with id: " + id));
    }

    public List<RoomResponse> getAll() {
        return roomRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private RoomResponse toResponse(RoomEntity room) {
        return new RoomResponse(
                room.getId(),
                room.getCode(),
                room.getName(),
                room.getCapacity(),
                room.getBuilding()
        );
    }
}
