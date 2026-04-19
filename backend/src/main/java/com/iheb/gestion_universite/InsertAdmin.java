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
            UserEntity userEntity =  new UserEntity();
            userEntity.setEmail("test@gmail.com");
            userEntity.setPassword(passwordEncoder.encode("testtest"));
            userEntity.getRoles()
                    .add(roleAdmin);
            userRepository.save(userEntity);

        }


        if (userRepository.findByEmail("naaymyh@gmail.com")
                .isEmpty()) {
            UserEntity student = new UserEntity();
            student.setEmail("naaymyh@gmail.com");

            student.setPassword(passwordEncoder.encode("testtest"));
            student.getRoles()
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
