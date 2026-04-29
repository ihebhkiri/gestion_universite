package com.iheb.gestion_universite.teaching.teacher;


import com.iheb.gestion_universite.teaching.teacher.dto.AssignTeacherRequest;
import com.iheb.gestion_universite.teaching.teacher.dto.BulkDeleteTeachersRequest;
import com.iheb.gestion_universite.teaching.teacher.dto.TeacherAssignmentResponse;
import com.iheb.gestion_universite.teaching.teacher.dto.TeacherResponse;
import com.iheb.gestion_universite.teaching.teacher.dto.UpdateTeacherRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.iheb.gestion_universite.teaching.teacher.dto.AddTeacherRequest;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/admin/teachers")
@RequiredArgsConstructor
public class AdminTeacherController {
    private final AdminTeachersService adminTeachersService;

    @PostMapping()
    public ResponseEntity<Void> addTeacher(@RequestBody AddTeacherRequest request) {
        adminTeachersService.addTeacher(request);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Void> updateTeacher(@PathVariable Long id, @RequestBody UpdateTeacherRequest request) {
        adminTeachersService.updateTeacher(id,request);
        return ResponseEntity.ok().build();
    }

    @GetMapping
    public Page<TeacherResponse> getTeachers(
            @RequestParam(required = false, defaultValue = "") String search,
            @RequestParam(required = false) Long department,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long speciality,
            @RequestParam(required = false) Long subject,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hiredFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hiredTo,
            Pageable pageable) {

        return adminTeachersService.findAllTeachers(search, department, status, speciality, subject, hiredFrom, hiredTo, pageable);
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAllTeacherOptions() {
        return ResponseEntity.ok(adminTeachersService.findAllTeacherOptions());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TeacherResponse> getTeacher(@PathVariable Long id) {
        return ResponseEntity.ok(adminTeachersService.getTeacherById(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTeacher(@PathVariable Long id) {
        adminTeachersService.deleteTeacher(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/batch")
    public ResponseEntity<Void> bulkDelete(@Valid @RequestBody BulkDeleteTeachersRequest request) {
        adminTeachersService.deleteTeachersBulk(request.teacherIds());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/assignments")
    public ResponseEntity<TeacherAssignmentResponse> assignTeacher(
            @PathVariable Long id,
            @Valid @RequestBody AssignTeacherRequest request) {

        return ResponseEntity.status(HttpStatus.CREATED).body(adminTeachersService.assignTeacher(id, request));
    }

}
