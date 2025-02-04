package com.project.app.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.project.app.model.Employe;

@Repository
public interface EmployeRepository extends JpaRepository<Employe, Long> {
	
	 
}
