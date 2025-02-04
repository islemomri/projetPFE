package com.project.app.service;

import com.project.app.dto.RegisterDto;
import com.project.app.model.Utilisateur;

public interface AuthService {
	Utilisateur createUser(RegisterDto registerDto);
}
