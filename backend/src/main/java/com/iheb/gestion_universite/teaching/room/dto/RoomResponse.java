package com.iheb.gestion_universite.teaching.room.dto;

public record RoomResponse(
        Long id,
        String code,
        String name,
        Integer capacity,
        String type,
        String building,
        String location
) {
}
