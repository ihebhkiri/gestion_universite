package com.iheb.gestion_universite.security.user.dto;

import java.util.Set;

public record CreateUserRequest(String email,

                                String password,
                                Set<String> roleNames) {


}
