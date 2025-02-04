package com.project.app.model;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Data;
@Data
@Entity
public class Employe {
	 @Id
	    @GeneratedValue(strategy = GenerationType.IDENTITY)
	    private Long id;

	    private String nom;
	    private String prenom;
	  
	   
	    private Integer matricule;

	
	    private LocalDate dateNaissance;
	    private LocalDate dateRecrutement;
	    private String sexe;
	    private String email;
	    private String lieuNaissance;
	    private String codeQualification;
	    private String descriptionQualification;
	    private String departement;
	    private String poste;
	    private String photo;
		public Long getId() {
			return id;
		}
		public void setId(Long id) {
			this.id = id;
		}
		public String getNom() {
			return nom;
		}
		public void setNom(String nom) {
			this.nom = nom;
		}
		public String getPrenom() {
			return prenom;
		}
		public void setPrenom(String prenom) {
			this.prenom = prenom;
		}
		
		public Integer getMatricule() {
			return matricule;
		}
		public void setMatricule(Integer matricule) {
			this.matricule = matricule;
		}
		public LocalDate getDateNaissance() {
			return dateNaissance;
		}
		public void setDateNaissance(LocalDate dateNaissance) {
			this.dateNaissance = dateNaissance;
		}
		public LocalDate getDateRecrutement() {
			return dateRecrutement;
		}
		public void setDateRecrutement(LocalDate dateRecrutement) {
			this.dateRecrutement = dateRecrutement;
		}
		public String getSexe() {
			return sexe;
		}
		public void setSexe(String sexe) {
			this.sexe = sexe;
		}
		public String getEmail() {
			return email;
		}
		public void setEmail(String email) {
			this.email = email;
		}
		public String getLieuNaissance() {
			return lieuNaissance;
		}
		public void setLieuNaissance(String lieuNaissance) {
			this.lieuNaissance = lieuNaissance;
		}
		public String getCodeQualification() {
			return codeQualification;
		}
		public void setCodeQualification(String codeQualification) {
			this.codeQualification = codeQualification;
		}
		public String getDescriptionQualification() {
			return descriptionQualification;
		}
		public void setDescriptionQualification(String descriptionQualification) {
			this.descriptionQualification = descriptionQualification;
		}
		public String getDepartement() {
			return departement;
		}
		public void setDepartement(String departement) {
			this.departement = departement;
		}
		public String getPoste() {
			return poste;
		}
		public void setPoste(String poste) {
			this.poste = poste;
		}
		public String getPhoto() {
			return photo;
		}
		public void setPhoto(String photo) {
			this.photo = photo;
		}
	    
	
}
