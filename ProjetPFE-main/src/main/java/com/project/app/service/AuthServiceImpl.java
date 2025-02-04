package com.project.app.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.project.app.dto.AdminRegisterDto;
import com.project.app.dto.DirecteurRegisterDTO;
import com.project.app.dto.RHRegisterDTO;
import com.project.app.dto.RegisterDto;
import com.project.app.model.Administrateur;
import com.project.app.model.Directeur;
import com.project.app.model.RH;
import com.project.app.model.Utilisateur;
import com.project.app.repository.UtilisateurRepository;


import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;


@Service
public class AuthServiceImpl implements AuthService{
	
	private final UtilisateurRepository utilisateurRepository;
	private final PasswordEncoder passwordEncoder;
	
	@PersistenceContext
    private EntityManager entityManager;
	
	@Autowired
    public AuthServiceImpl(UtilisateurRepository utilisateurRepository, PasswordEncoder passwordEncoder) {
        this.utilisateurRepository = utilisateurRepository;
        this.passwordEncoder = passwordEncoder;
    }

	@Override
	@Transactional
	public Utilisateur createUser(RegisterDto registerDto) {
	    if (utilisateurRepository.existsByEmail(registerDto.getEmail())) {
	        return null;
	    }
	    Utilisateur utilisateur;
	    
	    if (registerDto instanceof AdminRegisterDto) {
	        utilisateur = createUserFromAdminDto((AdminRegisterDto) registerDto);
	    } else if (registerDto instanceof RHRegisterDTO) {
	        utilisateur = createUserFromRHDto((RHRegisterDTO) registerDto);
	    } else if (registerDto instanceof DirecteurRegisterDTO) {
	        utilisateur = createUserFromDirecteurDto((DirecteurRegisterDTO) registerDto);
	    } else {
	        throw new IllegalArgumentException("Invalid RegisterDto type");
	    }

	    utilisateurRepository.save(utilisateur); 
	    return utilisateur;
	}

	
	@Transactional
	private Utilisateur createUserFromAdminDto(AdminRegisterDto Adto) {
		Administrateur administrateur = new Administrateur();
		administrateur.setNom(Adto.getNom());
		administrateur.setPrenom(Adto.getPrenom());
		administrateur.setEmail(Adto.getEmail());
		administrateur.setPassword(passwordEncoder.encode(Adto.getPassword()));
		administrateur.setRole(Adto.getRole());
		Utilisateur utilisateur = utilisateurRepository.save(administrateur);
		administrateur.setId(utilisateur.getId());
		return entityManager.merge(administrateur);
	}
	
	@Transactional
	private Utilisateur createUserFromDirecteurDto(DirecteurRegisterDTO Ddto) {
	    Directeur directeur = new Directeur();
	    directeur.setNom(Ddto.getNom());
	    directeur.setPrenom(Ddto.getPrenom());
	    directeur.setEmail(Ddto.getEmail());
	    directeur.setPassword(passwordEncoder.encode(Ddto.getPassword()));
	    directeur.setRole(Ddto.getRole());
	    Utilisateur utilisateur = utilisateurRepository.save(directeur);
	    directeur.setId(utilisateur.getId());
	    return entityManager.merge(directeur);
	}
	
	@Transactional
	private Utilisateur createUserFromRHDto(RHRegisterDTO Rdto) {
	    RH rh = new RH();
	    rh.setNom(Rdto.getNom());
	    rh.setPrenom(Rdto.getPrenom());
	    rh.setEmail(Rdto.getEmail());
	    rh.setPassword(passwordEncoder.encode(Rdto.getPassword()));
	    rh.setRole(Rdto.getRole());
	    Utilisateur utilisateur = utilisateurRepository.save(rh);
	    rh.setId(utilisateur.getId());
	    return entityManager.merge(rh);
	}



}
