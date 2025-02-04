package com.project.app.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.project.app.model.RH;

@Repository
public interface RHRepository extends JpaRepository<RH, Long>{

}
