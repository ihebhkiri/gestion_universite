package com.iheb.gestion_universite.security.user.dto;

import java.util.Set;

public record Me(String email , Set<String> roles) {

}
