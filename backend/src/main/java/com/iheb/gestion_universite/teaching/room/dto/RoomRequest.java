package com.iheb.gestion_universite.teaching.room.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record RoomRequest(
        @NotBlank(message = "Room name is required")
        String name,
        @NotNull(message = "Capacity is required")
        @Min(value = 1, message = "Capacity must be greater than 0")
        Integer capacity,
        @NotBlank(message = "Room type is required")
        String type,
        String building,
        String location
) {
}
