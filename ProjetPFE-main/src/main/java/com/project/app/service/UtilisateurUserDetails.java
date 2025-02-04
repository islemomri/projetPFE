package com.project.app.service;

import java.util.Collection;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.User;

import com.project.app.model.Utilisateur;

public class UtilisateurUserDetails extends User{
	
	private Long id;
	
	public UtilisateurUserDetails(Utilisateur utilisateur, Collection<? extends GrantedAuthority> authorities) {
		super(utilisateur.getEmail(), utilisateur.getPassword(), authorities);
        this.id = utilisateur.getId();
	}
	
	public Long getId() {
        return id;
    }

}
