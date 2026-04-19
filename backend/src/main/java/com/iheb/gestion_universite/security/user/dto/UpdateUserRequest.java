package com.iheb.gestion_universite.security.user.dto;

import java.util.Set;

public record UpdateUserRequest(

        String email,

        Set<String> roleNames) {
}

