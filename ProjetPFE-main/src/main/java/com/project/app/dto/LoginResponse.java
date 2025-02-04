package com.project.app.dto;

public record LoginResponse(String jwt,String role,Long utilisateurId) {

}
