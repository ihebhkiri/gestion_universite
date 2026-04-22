package com.iheb.gestion_universite.student_managment.student_group;

import com.iheb.gestion_universite.student_managment.student_group.dto.AddGroupRequest;
import com.iheb.gestion_universite.student_managment.student_group.dto.GroupResponse;
import com.iheb.gestion_universite.student_managment.student_group.dto.GroupStatsResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/admin")
public class GroupController {

    private final GroupService groupService;

    @GetMapping("/groups")
    public ResponseEntity<List<GroupResponse>> getAllGroups() {
        return ResponseEntity.ok(groupService.getAllGroups());
    }

    @PostMapping("/groups")
    public ResponseEntity<Void> createGroup(@Valid @RequestBody AddGroupRequest request) {
        groupService.createGroup(request);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @PutMapping("/groups/{groupId}")
    public ResponseEntity<Void> updateGroup(@PathVariable Long groupId, @Valid @RequestBody AddGroupRequest request) {
        groupService.updateGroup(groupId, request);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/groups/{groupId}")
    public ResponseEntity<Void> deleteGroup(@PathVariable Long groupId) {
        groupService.deleteGroup(groupId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/groups/stats")
    public ResponseEntity<GroupStatsResponse> getStats() {
        return ResponseEntity.ok(groupService.getStats());
    }
}
