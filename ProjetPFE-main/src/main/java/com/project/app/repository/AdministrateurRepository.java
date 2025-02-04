package com.project.app.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.project.app.model.Administrateur;

@Repository
public interface AdministrateurRepository extends JpaRepository<Administrateur, Long>{

}
