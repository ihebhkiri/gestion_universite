package com.iheb.gestion_universite.security.user;


import com.iheb.gestion_universite.security.user.dto.UserDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
@RequestMapping ("/api/v1/users/me")
public class UserController {

    private final UserRepository userRepository;

    @GetMapping
    @Transactional (readOnly = true)
    public ResponseEntity<UserDTO> getCurrentUser (org.springframework.security.core.Authentication authentication) {

        UserEntity userEntity = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new org.springframework.security.core.userdetails.UsernameNotFoundException("user not found"));
        UserDTO userDTO = new UserDTO();
        userDTO.setEmail(userEntity.getEmail());
        userDTO.setId(userEntity.getId());
        userDTO.setRoles(userEntity.getRole()
                .stream()
                .map(role -> role.getName())
                .collect(Collectors.toSet()));
        return ResponseEntity.ok(userDTO);
    }


}
