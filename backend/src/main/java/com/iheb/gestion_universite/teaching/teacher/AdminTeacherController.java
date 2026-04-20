package com.iheb.gestion_universite.teaching.teacher;


import com.iheb.gestion_universite.teaching.teacher.dto.UpdateTeacherRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.iheb.gestion_universite.teaching.teacher.dto.AddTeacherRequest;

@RestController
@RequestMapping("/api/v1/admin/teachers")
@RequiredArgsConstructor
public class AdminTeacherController {
    private final AdminTeachersService adminTeachersService;

    @PostMapping()
    public ResponseEntity<?> addTeacher(@RequestBody AddTeacherRequest request) {
        adminTeachersService.addTeacher(request);
        return ResponseEntity.ok().build();
    }
    @PutMapping("/{id}")
    public ResponseEntity<?> updateTeacher( @PathVariable Long id ,@RequestBody UpdateTeacherRequest request) {
        adminTeachersService.updateTeacher(id,request);
        return ResponseEntity.ok().build();
    }
    @GetMapping
    public ResponseEntity<?> getAllTeachers() {
        return ResponseEntity.ok(adminTeachersService.findAllTeachers());
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTeacher(@PathVariable Long id) {
        adminTeachersService.deleteTeacher(id);
        return ResponseEntity.noContent().build();
    }
//    @GetMapping
//    public ResponseEntity<List<TeacherEntity>> getTeachers(){
//        return ResponseEntity.ok(adminTeachersService.findAllTeachers());
//    }
//    @GetMapping("/{id}")
//    public ResponseEntity<?> getTeacher(@PathVariable Long id){
//        return ResponseEntity.ok(adminTeachersService.checkTeacherExists(id)) ;
//    }

}
