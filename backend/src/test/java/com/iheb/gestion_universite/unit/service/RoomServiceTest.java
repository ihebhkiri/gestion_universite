package com.iheb.gestion_universite.unit.service;

import com.iheb.gestion_universite.teaching.room.RoomRepository;
import com.iheb.gestion_universite.teaching.room.RoomService;
import com.iheb.gestion_universite.teaching.room.dto.RoomRequest;
import com.iheb.gestion_universite.teaching.room.dto.RoomResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.test.context.ActiveProfiles;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
class RoomServiceTest {

    @Autowired
    private RoomRepository roomRepository;

    private RoomService roomService;

    @BeforeEach
    void setUp() {
        roomRepository.deleteAll();
        roomService = new RoomService(roomRepository);
    }

    @Test
    void shouldFilterRoomsByLocationAndType() {
        roomService.create(new RoomRequest("Room C", 40, "CLASSROOM", "Main", "C"));
        roomService.create(new RoomRequest("Room Lab", 24, "LAB", "Main", "C"));
        roomService.create(new RoomRequest("Room D", 35, "CLASSROOM", "Main", "D"));

        Page<RoomResponse> page = roomService.getPage(
                null,
                null,
                "C",
                "CLASSROOM",
                PageRequest.of(0, 9, Sort.by("name").ascending())
        );

        assertThat(page.getContent())
                .singleElement()
                .extracting(RoomResponse::name)
                .isEqualTo("ROOM C");
    }
}
