package com.iheb.gestion_universite.student_managment.student;


import com.iheb.gestion_universite.student_managment.student.dto.AddStudentRequest;
import com.iheb.gestion_universite.student_managment.student.dto.UpdateStudentRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/students")
@RequiredArgsConstructor
public class AdminStudentController {
    private final AdminStudentsService adminStudentsService;

    @PostMapping()
    public ResponseEntity<?> addStudent(@RequestBody AddStudentRequest request) {
        adminStudentsService.addStudent(request);
        return ResponseEntity.ok().build();
    }
    @PutMapping("/{id}")
    public ResponseEntity<?> updateStudent( @PathVariable Long id ,@RequestBody UpdateStudentRequest request) {
        adminStudentsService.updateStudent(id,request);
        return ResponseEntity.ok().build();
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteStudent(@PathVariable Long id) {
        adminStudentsService.deleteStudent(id);
        return ResponseEntity.status(HttpStatus.ACCEPTED).build();
    }
    @GetMapping
    public ResponseEntity<List<StudentEntity>> getStudents(){
        return ResponseEntity.ok(adminStudentsService.findAllStudents());
    }
    @GetMapping("/{id}")
    public ResponseEntity<?> getStudent(@PathVariable Long id){
        return ResponseEntity.ok(adminStudentsService.checkStudentExists(id)) ;
    }

}
