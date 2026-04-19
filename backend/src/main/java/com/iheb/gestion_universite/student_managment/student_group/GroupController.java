package com.iheb.gestion_universite.student_managment.student_group;

import com.iheb.gestion_universite.student_managment.student_group.dto.AddGroupRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/admin/")
public class GroupController {

    private final GroupService groupService;

    @PostMapping("/classes/{classId}/groups")
    public ResponseEntity<?> createGroup(@PathVariable Long classId, @RequestBody AddGroupRequest request) {
        groupService.createGroup(classId, request);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/groups/{groupId}")
    public ResponseEntity<?> updateGroup(@PathVariable Long groupId, @RequestBody AddGroupRequest request) {
        groupService.updateGroup(groupId, request);
        return ResponseEntity.ok().build();
    }
}
