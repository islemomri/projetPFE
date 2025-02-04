package com.project.app.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.project.app.model.Directeur;

@Repository
public interface DirecteurRepository extends JpaRepository<Directeur, Long>{

}
