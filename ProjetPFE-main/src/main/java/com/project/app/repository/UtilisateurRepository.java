package com.project.app.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.project.app.model.Utilisateur;


@Repository
public interface UtilisateurRepository extends JpaRepository<Utilisateur, Long>{
	
	Optional<Utilisateur> findByEmail(String email);
    Boolean existsByEmail(String email);
}
