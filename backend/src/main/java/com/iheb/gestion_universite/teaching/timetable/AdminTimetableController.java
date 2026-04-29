package com.iheb.gestion_universite.teaching.timetable;

import com.iheb.gestion_universite.teaching.timetable.dto.TimetableRequest;
import com.iheb.gestion_universite.teaching.timetable.dto.TimetableResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/admin/timetable")
public class AdminTimetableController {

    private final TimetableFacade timetableFacade;

    @GetMapping
    public ResponseEntity<List<TimetableResponse>> getAll(
            @RequestParam(required = false) Long classId,
            @RequestParam(required = false) Long semesterId
    ) {
        return ResponseEntity.ok(timetableFacade.findAll(classId, semesterId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TimetableResponse> getOne(@PathVariable Long id) {
        return ResponseEntity.ok(timetableFacade.getOne(id));
    }

    @PostMapping
    public ResponseEntity<TimetableResponse> create(@Valid @RequestBody TimetableRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(timetableFacade.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TimetableResponse> update(@PathVariable Long id, @Valid @RequestBody TimetableRequest request) {
        return ResponseEntity.ok(timetableFacade.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        timetableFacade.delete(id);
        return ResponseEntity.noContent().build();
    }
}
