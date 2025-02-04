export class Employe {
   
    nom!: string; // Nom de l'employé
    prenom!: string; // Prénom de l'employé
  
    dateNaissance!: Date; // Date de naissance
    dateRecrutement!: Date; // Date de recrutement
    sexe!: string; // Sexe de l'employé (Homme/Femme)
    email!: string; // Adresse email
    lieuNaissance!: string; // Lieu de naissance
    codeQualification!: string; // Code de qualification
    descriptionQualification!: string; // Description de la qualification
    departement!: string; // Département où l'employé travaille
    matricule!: number;
    poste!: string; // Poste actuel de l'employé
    photo!: File | null; // Photo téléchargée
  }
  