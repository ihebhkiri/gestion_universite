package com.iheb.gestion_universite;

import com.iheb.gestion_universite.security.role.RoleEntity;
import com.iheb.gestion_universite.security.role.RoleRepository;
import com.iheb.gestion_universite.security.user.UserEntity;
import com.iheb.gestion_universite.security.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class InsertAdmin implements CommandLineRunner {

    private final UserRepository userRepository;

    private final PasswordEncoder passwordEncoder;

    private final RoleRepository roleRepository;

    @Override
    public void run (String... args) throws Exception {

        var roleAdmin = createRole("ROLE_ADMIN");
        var roleStudent = createRole("ROLE_STUDENT");
        var roleProff = createRole("ROLE_TEACHER");
        if (userRepository.findByEmail("test@gmail.com")
                .isEmpty()) {
            UserEntity userEntity = UserEntity.builder()
                    .email("test@gmail.com")
                    .password(passwordEncoder.encode("testtest"))
                    .build();
            userEntity.getRole()
                    .add(roleAdmin);
            userRepository.save(userEntity);

        }


        if (userRepository.findByEmail("naaymyh@gmail.com")
                .isEmpty()) {
            UserEntity student = UserEntity.builder()
                    .email("naaymyh@gmail.com")
                    .password(passwordEncoder.encode("testtest"))
                    .build();
            student.getRole()
                    .add(roleStudent);
            userRepository.save(student);
        }


    }

    private RoleEntity createRole (String roleName) {

        var role = roleRepository.findByName(roleName)
                .orElseGet(() ->
                        roleRepository.save(RoleEntity.builder()
                                .name(roleName)
                                .build())

                );
        return role;

    }
}
