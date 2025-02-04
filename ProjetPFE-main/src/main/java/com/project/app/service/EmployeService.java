package com.project.app.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.project.app.model.Employe;
import com.project.app.repository.EmployeRepository;

@Service
public class EmployeService implements IEmployeService {
	@Autowired
    private EmployeRepository employeRepository;
	public List<Employe> getAllEmployes() {
        return employeRepository.findAll();
    }

	 public Employe addEmploye(Employe employe) {
	       

	        return employeRepository.save(employe);
	    }

    public Optional<Employe> getEmployeById(Long id) {
        return employeRepository.findById(id);
    }

    public void deleteEmploye(Long id) {
        employeRepository.deleteById(id);
    }

}
