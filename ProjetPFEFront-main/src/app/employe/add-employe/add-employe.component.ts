import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CardModule } from 'primeng/card';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { FileUploadModule } from 'primeng/fileupload';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { ProgressBarModule } from 'primeng/progressbar';
import { MessageService } from 'primeng/api';
import { SelectModule } from 'primeng/select';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import { Employe } from '../model/employe';
import { EmoloyeService } from '../service/emoloye.service';


@Component({
  selector: 'app-add-employe',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    FloatLabelModule,
    InputTextModule,
    PasswordModule,
    RouterModule,
    FileUploadModule,
    BadgeModule,
    ProgressBarModule,
    ButtonModule,
    ToastModule,
    SelectModule,
    DropdownModule,
    FormsModule
  ],
  templateUrl: './add-employe.component.html',
  styleUrls: ['./add-employe.component.css'] ,// Correction ici : utilisez 'styleUrls' au pluriel
  providers: [MessageService],
})
export class AddEmployeComponent implements OnInit {
  addEmployeeForm !: FormGroup;
  selectedCity!: string;
  selectedSexe!: string;
  totalSizePercent: number = 0;
  totalSize: number = 0;
  files: any[] = []; // Fichiers sélectionnés
  uploadedFiles: any[] = []; // Fichiers téléchargés
  uploadProgress: number = 0;
  isCanceled: boolean = false;
  errorMessage!: string;
  showSuccessAlert: boolean = false;
 
 

  // Fonction pour réinitialiser le champ de téléchargement après la fermeture de l'alerte
  resetFileUpload(fileUpload: any): void {
    fileUpload.clear(); // Effacer les fichiers sélectionnés
  }

  
  constructor(private messageService: MessageService, private  EmoloyeService :EmoloyeService, private router: Router) {}

  

  sexes = [
    { name: 'Homme' },
    { name: 'Femme' }
  ];

  ngOnInit() {

    const employeData = localStorage.getItem('employe');
    const employe = employeData ? JSON.parse(employeData) : {};
  
    console.log('Employé récupéré depuis localStorage:', employe);
    // Initialisation du formulaire avec les valeurs récupérées
 
    
  
    this.addEmployeeForm = new FormGroup({
      'Nom': new FormControl(employe.nom || '', Validators.required),
      'Prenom': new FormControl(employe.prenom || '', Validators.required),
      'dN': new FormControl(null, Validators.required),
      'dR': new FormControl(null, Validators.required),
      'sexe': new FormControl(null, Validators.required),
      'email': new FormControl(null, [Validators.required, Validators.email]),
      'lieudenaissance': new FormControl(employe.lieuDeNaissance || '', Validators.required),
      'code':  new FormControl(null, Validators.required),
      'description':  new FormControl(null, Validators.required),
      'Departement': new FormControl(null, Validators.required),
      'Poste': new FormControl(null, Validators.required),
     'Telecharger': new FormControl(null, Validators.required) , // Initialiser comme faux et obligatoire
     'matricule': new FormControl(employe.matricule, Validators.required),
    });


  
    
  }
  
  
  onSubmit() {


    let emp= new Employe()
    emp.nom=this.addEmployeeForm.controls['Nom'].value
    emp.prenom=this.addEmployeeForm.controls['Prenom'].value
  
    emp.dateNaissance=this.addEmployeeForm.controls['dN'].value
    emp.dateRecrutement=this.addEmployeeForm.controls['dR'].value
    emp.sexe=this.addEmployeeForm.controls['sexe'].value.name
    emp.lieuNaissance = this.addEmployeeForm.controls['lieudenaissance'].value.name
    emp.codeQualification=this.addEmployeeForm.controls['code'].value
    emp.descriptionQualification=this.addEmployeeForm.controls['description'].value
    emp.departement=this.addEmployeeForm.controls['Departement'].value
    emp.matricule=this.addEmployeeForm.controls['matricule'].value
  
    emp.photo=this.addEmployeeForm.controls['Telecharger'].value
    
    emp.email=this.addEmployeeForm.controls['email'].value
    console.log(emp);
    this.EmoloyeService.addEmploye(emp).subscribe(response => {
      console.log('Employé ajouté avec succès:', response);
      this.showSuccessAlert = true;
    
    
     
    });
    this.router.navigate(['/emmploye-existant']);
  }


  viewStatus() {
    // Logique pour voir l'état, ou une autre action
    console.log('Voir l\'état de l\'employé');
  }
  
  onSelectedFiles(event: any) {
    if (event.files && event.files.length > 0) {
      const uploadedFile = event.files[0]; // Prendre le premier fichier sélectionné
      const imageUrl = `https://your-upload-url.com/${encodeURIComponent(uploadedFile.name)}`; // Générer l'URL du fichier téléchargé
  
      // Mettre à jour le formulaire avec l'URL de l'image téléchargée
      this.addEmployeeForm.controls['Telecharger'].setValue(imageUrl); // Utiliser l'URL dans 'Telecharger'
      this.files = Array.from(event.files).map((file: any) => ({
        ...file,
        state: 'pending'
      }));
      this.updateTotalSize(); // Si tu as une méthode pour mettre à jour la taille totale des fichiers
    } else {
      // Si aucun fichier n'est sélectionné, afficher un message d'erreur
      this.addEmployeeForm.controls['Telecharger'].setValue(null); // Réinitialiser le champ Telecharger
      this.errorMessage = 'Aucun fichier sélectionné !'; // Définir un message d'erreur
      console.log(this.errorMessage); // Afficher l'erreur dans la console
    }
  }
  
  
  
 
 
  
  
  

  uploadEvent(uploadCallback: any) {
    const totalSize = this.files.reduce((sum, file) => sum + file.size, 0);
    let uploaded = 0;
  
    // Simulation de la progression du téléchargement
    const interval = setInterval(() => {
      uploaded += 100000; // Simule un téléchargement de 100KB à chaque intervalle
      this.uploadProgress = Math.round((uploaded / totalSize) * 100);
      this.totalSizePercent = this.uploadProgress;
  
      // Mettre à jour l'état des fichiers pendant le processus de téléchargement
      this.files.forEach(file => file.state = 'pending');  // État 'pending' pendant l'upload
  
      if (this.uploadProgress >= 100) {
        clearInterval(interval);
  
        // Après l'upload, on met l'état à 'completed'
        this.files.forEach(file => file.state = 'completed');
        
        this.uploadedFiles = [...this.uploadedFiles, ...this.files];  // Ajoute les fichiers à la liste des téléchargés
        this.files = [];  // Vide la liste des fichiers en attente
        this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Téléchargement complet !' });
      }
    }, 100); // Déclenche tous les 100ms
  }
  
  

  // Supprimer un fichier de la liste des fichiers en attente
  onRemoveTemplatingFile(event: any, file: any, removeFileCallback: any, index: number) {
    this.files.splice(index, 1);
    removeFileCallback();
  }

  // Supprimer un fichier téléchargé
  removeUploadedFileCallback(index: number) {
    this.uploadedFiles.splice(index, 1);
  }

  // Format de la taille du fichier en KB
  formatSize(size: number) {
    return (size / 1024).toFixed(2) + ' KB';
  }

  // Calcul de la taille totale des fichiers sélectionnés
  updateTotalSize() {
    this.totalSize = this.files.reduce((sum, file) => sum + file.size, 0);
  }
  
  choose(event: Event, callback: Function) {
    // Votre logique pour la méthode choose
    callback(event);
  }
  resetForm() {
    this.addEmployeeForm.reset();  // Réinitialise le formulaire
    this.showSuccessAlert = false; // Masque l'alerte
  }
  dismissAlert(fileUpload: any): void {
    // Logique pour fermer l'alerte
    this.resetFileUpload(fileUpload); 

    this.resetForm();  // Réinitialiser le formulaire et masquer l'alerte
  }
  
}
