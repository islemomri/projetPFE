package com.project.app.controller;

import java.util.Collection;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.project.app.dto.LoginDto;
import com.project.app.dto.LoginResponse;
import com.project.app.service.UtilisateurUserDetails;
import com.project.app.service.UtilisateurUserDetailsService;
import com.project.app.utils.JwtUtil;


@RestController
@RequestMapping("/login")
public class LoginController {
	
	private final AuthenticationManager authenticationManager;
    private final UtilisateurUserDetailsService utilisateurUserDetailsService; // Utilisation du nouveau service
    private final JwtUtil jwtUtil;
    
    @Autowired
    public LoginController(AuthenticationManager authenticationManager,
                           UtilisateurUserDetailsService utilisateurUserDetailsService,
                           JwtUtil jwtUtil) {
        this.authenticationManager = authenticationManager;
        this.utilisateurUserDetailsService = utilisateurUserDetailsService;
        this.jwtUtil = jwtUtil;
    }
    
    @PostMapping
    public ResponseEntity<?> login(@RequestBody LoginDto loginRequest) {
        try {
            // Authentification utilisateur
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Incorrect email or password.");
        } catch (DisabledException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User is not activated.");
        }

        // Charger les détails de l'utilisateur
        UserDetails userDetails = utilisateurUserDetailsService.loadUserByUsername(loginRequest.getEmail());
        Collection<? extends GrantedAuthority> authorities = userDetails.getAuthorities();
        String role = "ROLE_USER"; // Défaut
        Long utilisateurId = null;

        // Vérification et définition du rôle
        if (userDetails instanceof UtilisateurUserDetails) {
            utilisateurId = ((UtilisateurUserDetails) userDetails).getId();
            
        }

        for (GrantedAuthority authority : authorities) {
            if (authority.getAuthority().equals("ROLE_ADMIN")) {
                role = "ADMIN";
                break;
            } else if (authority.getAuthority().equals("ROLE_DIRECTEUR")) {
                role = "DIRECTEUR";
                break;
            } else if (authority.getAuthority().equals("ROLE_RH")) {
                role = "RH";
                break;
            }
        }

        // Générer un token JWT
        String jwt = jwtUtil.generateToken(userDetails.getUsername(), authorities);

        // Construire la réponse
        LoginResponse response = new LoginResponse(jwt, role, utilisateurId);

        return ResponseEntity.ok(response);
    }
}
