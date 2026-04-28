package com.iheb.gestion_universite.student_managment.student;


import com.iheb.gestion_universite.core.storage.FileStorageService;
import com.iheb.gestion_universite.student_managment.student.dto.AddStudentRequest;
import com.iheb.gestion_universite.student_managment.student.dto.BulkDeleteStudentsRequest;
import com.iheb.gestion_universite.student_managment.student.dto.StudentDataResponse;
import com.iheb.gestion_universite.student_managment.student.dto.StudentStatsResponse;
import com.iheb.gestion_universite.student_managment.student.dto.UpdateStudentRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Path;
import java.util.List;

@RestController
@RequestMapping ("/api/v1/admin/students")
@RequiredArgsConstructor
public class AdminStudentController {

    private final AdminStudentsService adminStudentsService;

    private final FileStorageService fileStorageService;

    @PostMapping (consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Void> addStudent (
            @RequestPart ("student") @Valid AddStudentRequest request,
            @RequestPart (value = "image", required = false) MultipartFile image) {

        String imageFilename = fileStorageService.store(image);
        adminStudentsService.addStudent(request, imageFilename);
        return ResponseEntity.status(HttpStatus.CREATED)
                .build();
    }

    @PutMapping ("/{id}")
    public ResponseEntity<Void> updateStudent (@PathVariable Long id, @Valid @RequestBody UpdateStudentRequest request) {

        adminStudentsService.updateStudent(id, request);
        return ResponseEntity.ok()
                .build();
    }

    @PostMapping ("/{id}/image")
    public ResponseEntity<Void> uploadImage (@PathVariable Long id, @RequestParam ("image") MultipartFile image) {

        String filename = fileStorageService.store(image);
        adminStudentsService.updateProfileImage(id, filename);
        return ResponseEntity.ok()
                .build();
    }

    @DeleteMapping ("/{id}")
    public ResponseEntity<Void> deleteStudent (@PathVariable Long id) {

        adminStudentsService.deleteStudent(id);
        return ResponseEntity.noContent()
                .build();
    }

    @PostMapping ("/bulk-delete")
    public ResponseEntity<Void> bulkDelete (@Valid @RequestBody BulkDeleteStudentsRequest request) {

        adminStudentsService.deleteStudentsBulk(request.studentIds());
        return ResponseEntity.noContent()
                .build();
    }

    @GetMapping
    public Page<StudentDataResponse> getStudents (
            @RequestParam (required = false, defaultValue = "") String search,
            @RequestParam (required = false) Long academicYear,
            @RequestParam (required = false) Long program,
            @RequestParam (required = false) String status,
            Pageable pageable) {

        return adminStudentsService.findAllStudents(search, academicYear, program, status, pageable);
    }

    @GetMapping ("/{id}")
    public ResponseEntity<StudentDataResponse> getStudent (@PathVariable Long id) {

        return ResponseEntity.ok(adminStudentsService.getStudentById(id));
    }

    @GetMapping ("/stats")
    public ResponseEntity<StudentStatsResponse> getStudentStats () {

        return ResponseEntity.ok(adminStudentsService.getStudentStats());
    }

    @GetMapping ("/images/{filename}")
    public ResponseEntity<Resource> getImage (@PathVariable String filename) {

        try {
            Path file = fileStorageService.load(filename);
            Resource resource = new UrlResource(file.toUri());
            if (resource.exists() && resource.isReadable()) {
                return ResponseEntity.ok()
                        .contentType(MediaType.IMAGE_JPEG)
                        .body(resource);
            }
            return ResponseEntity.notFound()
                    .build();
        } catch (Exception e) {
            return ResponseEntity.notFound()
                    .build();
        }
    }
}
