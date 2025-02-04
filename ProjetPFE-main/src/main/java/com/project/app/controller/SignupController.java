package com.project.app.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.project.app.dto.AdminRegisterDto;
import com.project.app.dto.DirecteurRegisterDTO;
import com.project.app.dto.RHRegisterDTO;
import com.project.app.model.Utilisateur;
import com.project.app.service.AuthService;

import jakarta.transaction.Transactional;

@RestController
@RequestMapping("/signup")
public class SignupController {

    private final AuthService authService;

    @Autowired
    public SignupController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/admin")
    @Transactional
    public ResponseEntity<?> inscrireAdmin(@RequestBody AdminRegisterDto registerDto) {
        Utilisateur utilisateurCree = authService.createUser(registerDto);
        if (utilisateurCree != null) {
            return ResponseEntity.status(HttpStatus.CREATED).body(utilisateurCree);
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("L'email est déjà utilisé ou les données fournies sont invalides.");
        }
    }

    @PostMapping("/directeur")
    @Transactional
    public ResponseEntity<?> inscrireDirecteur(@RequestBody DirecteurRegisterDTO registerDto) {
        Utilisateur utilisateurCree = authService.createUser(registerDto);
        if (utilisateurCree != null) {
            return ResponseEntity.status(HttpStatus.CREATED).body(utilisateurCree);
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("L'email est déjà utilisé ou les données fournies sont invalides.");
        }
    }

    @PostMapping("/rh")
    @Transactional
    public ResponseEntity<?> inscrireRH(@RequestBody RHRegisterDTO registerDto) {
        Utilisateur utilisateurCree = authService.createUser(registerDto);
        if (utilisateurCree != null) {
            return ResponseEntity.status(HttpStatus.CREATED).body(utilisateurCree);
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("L'email est déjà utilisé ou les données fournies sont invalides.");
        }
    }
}
