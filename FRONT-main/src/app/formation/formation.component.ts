import { Component, OnInit, ViewChild ,NgZone, ChangeDetectorRef } from '@angular/core';
import { FormationDto } from './model/FormationDto.model';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { TypeFormation } from './model/type-formation.model';
import { SousTypeFormation } from './model/SousTypeFormation.model';

import dayGridPlugin from '@fullcalendar/daygrid'; // Plugin pour la vue mensuelle

import interactionPlugin from '@fullcalendar/interaction'; // Plugin pour les interactions (clic, glisser-déposer)
import timeGridPlugin from '@fullcalendar/timegrid';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { MultiSelectModule } from 'primeng/multiselect';
import { ReactiveFormsModule } from '@angular/forms';  // Importer ReactiveFormsModule
import { EmoloyeService } from '../employe/service/emoloye.service';

import { Utilisateur } from '../utilisateur/model/utilisateur';
import { UtilisateurService } from '../utilisateur/service/utilisateur.service';
import { CommonModule } from '@angular/common';
import { FormationService } from './service/formation.service';
import { Table, TableModule } from 'primeng/table';  // Import de la table PrimeNG
import { CardModule } from 'primeng/card';    // Import de la Card PrimeNG
import { TagModule } from 'primeng/tag';
import { PosteService } from '../poste/service/poste.service';
import { Poste } from '../poste/model/poste';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { FullCalendarModule } from '@fullcalendar/angular';

import { TabViewModule } from 'primeng/tabview'; 
import { CalendarOptions } from '@fullcalendar/core';
import { FormationPosteService } from './service/FormationPosteService.service';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DirectionService } from '../direction/service/direction.service';
import { RadioButtonModule } from 'primeng/radiobutton';
import { ListboxModule } from 'primeng/listbox';
import { FormationDto_Resultat } from './model/FormationDto_Resultat';
interface FormationPosteId {
  formationId: number;
  posteId: number;
}
@Component({
  selector: 'app-formation',
  imports: [CalendarModule,
    DropdownModule,
    InputTextModule,
    DialogModule,
    ButtonModule,
    FullCalendarModule,
    MultiSelectModule,
     ReactiveFormsModule,
    CommonModule,
    TableModule,
    CardModule,
    TagModule,
    FormsModule,
    ToastModule,
    TabViewModule,
    CalendarModule,
    ConfirmDialogModule,
    RadioButtonModule,
    ListboxModule,

  ],
  providers: [MessageService,ConfirmationService],
  templateUrl: './formation.component.html',
  styleUrl: './formation.component.css'
})
export class FormationComponent implements OnInit{
  employes: any[] = [];  // Liste des employés
  cities: any[] = [];  // Liste des employés pour le multiselect
  formationForm: FormGroup;
  dialogVisible: boolean = false; 
  dialogVisibleModif: boolean = false; 
  responsables: Utilisateur[] = [];
  selectedResponsableType: string = '';
  typeFormations = Object.values(TypeFormation); // ['INTERNE', 'EXTERNE']
  sousTypeFormations = Object.values(SousTypeFormation); // ['INTEGRATION', 'POLYVALENCE', ...]
  static formationPosteList: { formationId: number, posteId: number }[] = [];
  formations: FormationDto[] = [];
  displayEventDialog: boolean = false;
  selectedEvent: any = null;
  posteSelectionne: Poste | null = null;
  selectedFormation: any;
  displayDialog: boolean = false;
  globalFilter: string = '';
  postes: Poste[] = [];  
  selectedPoste: Poste | null = null; 
  safeDocumentUrl: SafeUrl | null = null;
  displayPdfDialog: boolean = false;
  pdfUrl: SafeResourceUrl | null = null;
  pdfUrls: { [key: string]: SafeResourceUrl } = {};
  displayModificationDialog: boolean = false;
  modificationForm: FormGroup;
  selectedFile: File | null = null;
  formationsNonValidees: any[] = [];
  formationsValidees: any[] = [];
  formationsCompletes: any[] = []; 
  filterTextNonValidees: string = '';
  selectedPosteId!:number;
  filterTextValidees: string = '';
displayPosteAssignmentDialog: boolean = false;
selectedEmploye: any = null;
selectedDirection: any = null;
selectedSite: any = null;
directions: any[] = [];
sites: any[] = [];
selectedRadio: { [key: string]: string } = {};
selectedEmployees: any[] = [];
employeeTempResults: { [key: number]: string } = {};
selectedEmployes: any[] = [];

  resultatOptions = [
    { label: 'Réussi', value: 'REUSSI' },
    { label: 'Échec', value: 'ECHEC' },
    { label: 'Programme Complémentaire', value: 'PROGRAMME_COMPLEMENTAIRE' },
  ];
  loading: boolean = false;
  @ViewChild('tableNonValidees') tableNonValidees!: Table;
  @ViewChild('tableValidees') tableValidees!: Table;
  displayCalendarDialog: boolean = false;
  calendarEvents: any[] = [];
  selectedDate: Date = new Date();
  modalData: { action: string; event: any } | null = null;
  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    events: [],
    eventClick: this.handleEventClick.bind(this),
    eventDisplay: 'block', // Assure un bon affichage
    height: 'auto' // Ajuste la hauteur automatiquement
  };
  handleEventClick(info: any): void {
    this.selectedEvent = {
      title: info.event.title,
      start: info.event.start,
      end: info.event.end,
    };
    this.displayEventDialog = true; // Afficher le dialogue
  }
  openCalendarDialog() {
    this.displayCalendarDialog = true;
    this.loadCalendarEvents();
  }





  private transformToFormationDtocalendrier(data: any): FormationDto {
    return {
      id: data.id,
      titre: data.titre,
      description: data.description,
      typeFormation: data.typeFormation,
      sousTypeFormation: data.sousTypeFormation,
      dateDebutPrevue: this.ensureISODateString(data.dateDebutPrevue),
      dateFinPrevue: this.ensureISODateString(data.dateFinPrevue),
      responsableEvaluationId: data.responsableEvaluationId || null,
      responsableEvaluationExterne: data.responsableEvaluationExterne || null,
      employeIds: data.employeIds || [],
      responsableEvaluation: data.responsableEvaluation || null,
      employes: data.employes || [],
      fichierPdf: data.fichierPdf || null,
      organisateurId: data.organisateurId,
      titrePoste: data.titrePoste || null,
      valide: data.valide || false
    };
  }
  
  private ensureISODateString(dateInput: any): string {
    if (!dateInput) return new Date().toISOString(); // Valeur par défaut si null
    
    // Si c'est déjà une string ISO valide
    if (typeof dateInput === 'string' && this.isValidISODate(dateInput)) {
      return dateInput;
    }
    
    // Convertir en Date
    const date = this.convertToDate(dateInput);
    return date ? date.toISOString() : new Date().toISOString();
  }
  
  private convertToDate(dateInput: any): Date | null {
    if (!dateInput) return null;
    
    // Si c'est déjà une Date valide
    if (dateInput instanceof Date && !isNaN(dateInput.getTime())) {
      return dateInput;
    }
    
    // Si c'est un timestamp (nombre)
    if (typeof dateInput === 'number') {
      return new Date(dateInput);
    }
    
    // Si c'est une string
    if (typeof dateInput === 'string') {
      // Essayez le parsing direct
      const date = new Date(dateInput);
      if (!isNaN(date.getTime())) return date;
      
      // Formats spécifiques
      // Format "YYYY-MM-DD"
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
        return new Date(dateInput + 'T00:00:00');
      }
      
      // Format "DD/MM/YYYY"
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateInput)) {
        const [d, m, y] = dateInput.split('/');
        return new Date(`${y}-${m}-${d}`);
      }
    }
    
    console.warn(`Format de date non supporté:`, dateInput);
    return null;
  }
  
  private isValidISODate(dateString: string): boolean {
    return /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})?)?$/.test(dateString);
  }
  
  private updateCalendar(): void {
    this.calendarOptions = {
      ...this.calendarOptions,
      events: [...this.calendarEvents]
    };
    
    // Si vous utilisez ViewChild pour accéder au calendrier
  
  }
  
  loadCalendarEvents(): void {
    const rhId = localStorage.getItem('RHID');
    if (!rhId) {
      console.error("Impossible de récupérer l'ID du RH !");
      return;
    }

    this.formationservice.getFormationsParRH(Number(rhId)).subscribe({
      next: (data) => {
        this.calendarEvents = data
          .map((formation: any) => {
            const transformed = this.transformToFormationDtocalendrier(formation);
            
            // Palette professionnelle raffinée
            const eventStyle = transformed.valide 
              ? { // Événement confirmé - Thème bleu professionnel
                  bgColor: '#e8f4fc', // Bleu très clair
                  borderColor: '#4a89dc', // Bleu vif mais professionnel
                  textColor: '#2c3e50', // Noir bleuté pour le texte
                  dotColor: '#4a89dc' // Bleu cohérent avec la bordure
                }
              : {
                bgColor: '#fff7ed',  // Orange ultra clair (fond crème)
                borderColor: '#f97316', // Orange vif mais contrôlé
                textColor: '#9a3412', // Brun-orange foncé (meilleure lisibilité)
                dotColor: '#f97316'   // Cohérence avec la bordure
              };

            return {
              title: transformed.titre,
              start: transformed.dateDebutPrevue,
              end: transformed.dateFinPrevue,
              color: eventStyle.bgColor,
              textColor: eventStyle.textColor,
              borderColor: eventStyle.borderColor,
              className: transformed.valide ? 'event-confirmed' : 'event-tentative',
              extendedProps: {
                description: transformed.description,
                type: transformed.typeFormation,
                valide: transformed.valide
              }
            };
          })
          .filter(event => event !== null);

        this.updateCalendar();
      },
      error: (error) => {
        console.error('Erreur:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Erreur lors du chargement du calendrier'
        });
      }
    });
}
  applyFilterNonValidees() {
    this.loading = true;
    setTimeout(() => {
      this.tableNonValidees.filterGlobal(this.filterTextNonValidees, 'contains');
      this.loading = false;
    }, 300);
  }

  resetFilterNonValidees() {
    this.filterTextNonValidees = '';
    this.tableNonValidees.filterGlobal('', 'contains');
  }

  applyFilterValidees() {
    this.loading = true;
    setTimeout(() => {
      this.tableValidees.filterGlobal(this.filterTextValidees, 'contains');
      this.loading = false;
    }, 300);
  }

  resetFilterValidees() {
    this.filterTextValidees = '';
    this.tableValidees.filterGlobal('', 'contains');
  }
  constructor(private fb: FormBuilder, 
    private changeDetectorRef: ChangeDetectorRef,
    private directionservice: DirectionService,
    private formationPosteService: FormationPosteService,
    private confirmationService: ConfirmationService,
    private ngZone: NgZone,
    private messageService: MessageService,
    private employeService: EmoloyeService,
    private utilisateurService: UtilisateurService,
    private formationservice : FormationService,
    private posteService : PosteService,
     private sanitizer: DomSanitizer) {
    this.formationForm = this.fb.group({
      titre: ['', Validators.required],
      description: ['', Validators.required],
      typeFormation: [null, Validators.required],
      sousTypeFormation: [null, Validators.required],
      dateDebutPrevue: [null, Validators.required],
      dateFinPrevue: [null, { validators: [Validators.required, this.validateDateFin.bind(this)], updateOn: 'change' }],
      responsableEvaluationId: [null, Validators.required],
      responsableEvaluationExterne: [''],
      titrePoste: [null],
      fichierPdf: [null],
      selectedCities: [[], Validators.required],
    });






    this.modificationForm = this.fb.group({
      titre: ['', Validators.required],
      description: ['', Validators.required],
      typeFormation: ['', Validators.required],
      sousTypeFormation: ['', Validators.required],
      dateDebutPrevue: ['', Validators.required],
      dateFinPrevue: [null, { validators: [Validators.required, this.validateDateFin.bind(this)], updateOn: 'change' }],
      responsableEvaluationId: [null],
      responsableEvaluationExterne: [''],
      employeIds: [[]],
      titrePoste: ['',],
      fichierPdf: [null] ,// Ajouter un contrôle pour le fichier PDF
      selectedCitiesModif: [[]],
      responsableType: [null]
    });
    this.formationForm.valueChanges.subscribe(() => {
      this.validateDatesmodif();
    });



  }


  validateDateFin(control: AbstractControl): ValidationErrors | null {
    const dateFin = control.value;
    const dateDebut = this.formationForm?.get('dateDebutPrevue')?.value;
  
    if (!dateFin) {
      return { required: true }; // La date de fin est obligatoire
    }
  
    if (dateDebut && new Date(dateFin) < new Date(dateDebut)) {
      return { dateInvalide: true }; // La date de fin doit être après la date de début
    }
  
    return null; // La validation est réussie
  }
  validateDates(form: FormGroup) {
    const dateDebut = form.get('dateDebutPrevue')?.value;
    const dateFin = form.get('dateFinPrevue')?.value;
  
    if (dateDebut && dateFin && new Date(dateDebut) > new Date(dateFin)) {
      form.get('dateFinPrevue')?.setErrors({ dateInvalide: true });
    } else {
      form.get('dateFinPrevue')?.setErrors(null);
    }
  }
  validateDatesmodif(): void {
    const dateDebut = this.modificationForm.get('dateDebutPrevue')?.value;
    const dateFin = this.modificationForm.get('dateFinPrevue')?.value;
  
    if (dateDebut && dateFin && new Date(dateFin) < new Date(dateDebut)) {
      this.modificationForm.get('dateFinPrevue')?.setErrors({ dateInvalide: true });
    } else {
      this.modificationForm.get('dateFinPrevue')?.setErrors(null);
    }
  }

  ngOnInit(): void {
    this.loadFormations(); 
    this.displayFormationPosteList();
    const rhId = localStorage.getItem('RHID'); // Pas 'RHIDD' ni 'RHIDDDDDDDDD'
  
    if (!rhId) {
      console.error("Aucun ID RH trouvé. Vérifiez :");
      console.log("Contenu actuel du localStorage:", localStorage);
     // Redirigez si l'ID est manquant
      return;
    }
    
    console.log('RHID:', rhId); // Log propre sans 'D' supplémentaires
    // ... reste du code
  
  this.formationForm = this.fb.group({
    titre: ['', Validators.required],
    description: ['', Validators.required],
    typeFormation: [null, Validators.required],
    sousTypeFormation: [null, Validators.required],
    dateDebutPrevue: [null, Validators.required],
    dateFinPrevue: [null, Validators.required],
    responsableEvaluationId: [null, Validators.required],
    responsableEvaluationExterne: [''],
    selectedCities: [[], Validators.required],
    
    titrePoste: [null],
    fichierPdf: [null],
    responsableType: [null, Validators.required], 
  });


  
  this.formationForm.get('typeFormation')?.enable();
  this.formationForm.get('responsableType')?.enable();
  this.formationForm.valueChanges.subscribe(() => {
    this.validateDates(this.formationForm);
  });

  this.utilisateurService.getResponsables().subscribe(
    (data) => {
      console.log(data); 
      this.responsables = data;
    },
    (error) => {
      console.error('Erreur lors de la récupération des responsables', error);
    }
  );


  // Récupérer la liste des employés
  this.employeService.getEmployesWithDirectionAndSite().subscribe((data) => {
    this.employes = data;
    this.cities = this.employes.map((employe) => ({
      name: `${employe.nom} ${employe.prenom}`,  // Nom complet
      matricule: employe.matricule,  // Matricule de l'employé
      code: employe.id  // ID de l'employé (qui peut être utilisé pour l'identification)
    }));
    
  });


  this.posteService.getAllPostesnonArchives().subscribe(
    (data) => {
      this.postes = data;
    },
    (error) => {
      console.error('Erreur lors de la récupération des postes', error);
    }
  );
  this.formationForm.get('selectedCities')?.valueChanges.subscribe(selectedCodes => {
    this.selectedEmployees = this.cities.filter(emp => selectedCodes.includes(emp.code));
  });
  }
  
  onPosteSelect(event: any) {
    const selectedPoste = event.value;
     this.selectedPosteId = event.value.id; 
    console.log('ID du poste sélectionné :', this.selectedPosteId);
    if (selectedPoste && selectedPoste.document) {
      // Récupérer le contenu Base64 du PDF
      const base64Data = selectedPoste.document;
  
      // Convertir le Base64 en un Blob (fichier binaire)
      const byteCharacters = atob(base64Data); // Décoder Base64
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const fileBlob = new Blob([byteArray], { type: 'application/pdf' });
  
      // Créer une URL Blob pour afficher dans l'iframe
      const pdfUrl = URL.createObjectURL(fileBlob);
  
      // Mettre à jour l'iframe
      const pdfViewer = document.getElementById('pdfViewer') as HTMLIFrameElement;
      if (pdfViewer) {
        pdfViewer.src = pdfUrl;
      }
  
      console.log('PDF chargé depuis Base64 et affiché dans iframe');
    } else {
      console.warn('Aucun document trouvé pour ce poste.');
    }
  }
  

  showParticipants(formation: any) {
    if (formation && formation.employes) {
      this.selectedFormation = formation;
      this.displayDialog = true;
  
      if (formation.valide) {
        this.pdfUrls = {};
        formation.employes.forEach((employe: any) => {
          // Récupérer le document PDF pour l'employé
          this.employeService.getDocumentByEmployeIdAndFormationId(employe.id, formation.id).subscribe({
            next: (response: Blob) => {
              const fileURL = URL.createObjectURL(new Blob([response], { type: 'application/pdf' }));
              this.pdfUrls[employe.id] = this.sanitizer.bypassSecurityTrustResourceUrl(fileURL);
            },
            error: (err) => {
              console.error(`Erreur lors de la récupération du document pour employé ${employe.id} et formation ${formation.id}:`, err);
              this.messageService.add({
                severity: 'error',
                summary: 'Erreur',
                detail: `Document introuvable pour employé ${employe.id}`
              });
            }
          });
  
          // Récupérer le résultat de l'employé pour cette formation
          this.formationservice.getResultatFormation(formation.id, employe.id).subscribe({
            next: (result) => {
              // Ajouter le résultat à l'objet employé
              employe.resultat = result.resultat;
              employe.res = result.res; // Si vous avez besoin de cette propriété
            },
            error: (err) => {
              console.error(`Erreur lors de la récupération du résultat pour employé ${employe.id} et formation ${formation.id}:`, err);
              employe.resultat = 'Aucun résultat disponible'; // Valeur par défaut en cas d'erreur
            }
          });
        });
      }
    } else {
      console.error('Aucun employé trouvé pour cette formation');
    }
  }
  openPdfDialog(pdfUrl: SafeUrl) {
    this.pdfUrl = pdfUrl;
    this.displayPdfDialog = true;
  }

  hidePdfDialog() {
    this.displayPdfDialog = false;
    this.pdfUrl = null;
  }

  // Fermer le dialogue
  hideDialog() {
    this.displayDialog = false;
  }
  // Méthode pour ouvrir la popup de modification
  openModificationDialog(formation: any) {
    this.selectedResponsableTypeModif = (formation.sousTypeFormation === 'INTEGRATION' || formation.sousTypeFormation === 'POLYVALENCE')
    ? 'INTERNE'
    : formation.responsableEvaluationId ? 'INTERNE' : 'EXTERNE';

    this.selectedFormation = formation;
    this.displayModificationDialog = true;
    if (formation.sousTypeFormation === 'POLYCOMPETENCE') {
      this.modificationForm.get('sousTypeFormation')?.disable();
  } else {
      this.modificationForm.get('sousTypeFormation')?.enable();
  }
    // Récupérer les IDs des employés de la formation (pour TOUS les types de formation)
    const employeIds = formation.employes.map((emp: any) => emp.id);

    // Pré-sélectionner les employés dans le formControl (pour TOUS les types de formation)
    this.modificationForm.patchValue({
        selectedCitiesModif: employeIds
    });

    // Initialiser la liste des employés sélectionnés (pour TOUS les types de formation)
    this.selectedEmployeesModif = this.cities
        .filter(city => employeIds.includes(city.code))
        .map(city => ({
            ...city,
            name: city.name || `${city.nom} ${city.prenom}`
        }));

    // Traitement spécifique à POLYCOMPETENCE
    if (formation.sousTypeFormation === 'POLYCOMPETENCE') {
        this.selectedRadioModif = {};
        
        // Charger les résultats existants
        formation.employes.forEach((emp: any) => {
            this.formationservice.getResultatFormation(formation.id, emp.id).subscribe({
                next: (result) => {
                    this.selectedRadioModif[emp.id] = result.resultat;
                    this.changeDetectorRef.detectChanges();
                },
                error: (err) => {
                    console.error('Erreur récupération résultat', err);
                    this.selectedRadioModif[emp.id] = '';
                }
            });
        });
    }
// Initialiser le type de responsable
this.selectedResponsableTypeModif = formation.responsableEvaluationId ? 'INTERNE' : 'EXTERNE';
    // Trouver le poste actuel
    const currentPoste = this.postes.find(poste => poste.titre === formation.titrePoste);
    this.selectedResponsableTypeModif = formation.responsableEvaluationId ? 'INTERNE' : 'EXTERNE';
    // Remplir le formulaire
    this.modificationForm.patchValue({
        titre: formation.titre,
        description: formation.description,
        typeFormation: formation.typeFormation,
        sousTypeFormation: formation.sousTypeFormation,
        dateDebutPrevue: new Date(formation.dateDebutPrevue),
        dateFinPrevue: new Date(formation.dateFinPrevue),
        responsableType: this.selectedResponsableTypeModif,  // <-- Ajoutez cette ligne
        responsableEvaluationId: formation.responsableEvaluation?.id || null,
        responsableEvaluationExterne: formation.responsableEvaluationExterne || '',
        employeIds: employeIds,
        titrePoste: currentPoste
        // Note: selectedCitiesModif est déjà défini plus haut
    });
   
    if (formation.sousTypeFormation === 'INTEGRATION' || formation.sousTypeFormation === 'POLYVALENCE') {
      this.modificationForm.get('typeFormation')?.disable();
      this.modificationForm.get('responsableType')?.disable();
      this.modificationForm.get('responsableType')?.setValue('INTERNE'); // <-- Sécurité supplémentaire
  } else {
      this.modificationForm.get('typeFormation')?.enable();
      this.modificationForm.get('responsableType')?.enable();
  }
    this.changeDetectorRef.detectChanges(); 
    
  
    // Afficher le PDF du poste
    if (currentPoste && currentPoste.document) {
        this.loadPdfIntoIframe(currentPoste.document);
    } else {
        this.pdfUrl = null;
    }
}
// Ajoutez cette méthode pour filtrer les options de sous-type
getFilteredSousTypes(): any[] {
  const currentSousType = this.modificationForm.get('sousTypeFormation')?.value;
  const typeFormation = this.modificationForm.get('typeFormation')?.value;
  
  // Si POLYCOMPETENCE est déjà sélectionné, on l'inclut quand même (mais disabled)
  if (currentSousType === 'POLYCOMPETENCE') {
    return this.sousTypeFormations;
  }
  
  // Pour INTEGRATION/POLYVALENCE, on exclut POLYCOMPETENCE
  if (typeFormation === 'INTERNE') {
    return this.sousTypeFormations.filter(option => 
      option !== 'POLYCOMPETENCE'
    );
  }
  
  return this.sousTypeFormations;
}
  loadPdfIntoIframe(file: File | string) {
    if (file) {
      let pdfUrl: string;
  
      if (typeof file === 'string') {
        // Si le fichier est en Base64
        const byteCharacters = atob(file);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const fileBlob = new Blob([byteArray], { type: 'application/pdf' });
        pdfUrl = URL.createObjectURL(fileBlob);
      } else {
        // Si le fichier est de type File
        pdfUrl = URL.createObjectURL(file);
      }
  
      // Créer une URL sécurisée pour l'iframe
      this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(pdfUrl);
      




    } else {
      this.pdfUrl = null; // Réinitialiser l'iframe si aucun document n'est disponible
    }
  }
  onPosteSelectModification(event: any) {
    const selectedPoste = event.value; // Récupérer le poste sélectionné
  
    if (selectedPoste && selectedPoste.document) {
      // Charger le PDF du poste sélectionné dans l'iframe
      this.loadPdfIntoIframe(selectedPoste.document);
    } else {
      this.pdfUrl = null; // Réinitialiser l'iframe si aucun document n'est disponible
    }
  }
onFileChange(event: any) {
  const file = event.target.files[0];
  if (file) {
    this.selectedFile = file;
    this.modificationForm.get('fichierPdf')?.setValue(file);

    // Mettre à jour l'iframe avec le nouveau fichier PDF
    const fileURL = URL.createObjectURL(file);
    this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(fileURL);
  }
}
closeModificationDialog() {
  this.displayModificationDialog = false;
  this.modificationForm.reset();
  this.selectedFile = null;
  this.pdfUrl = null;
}
submitModificationForm() {
  if (this.modificationForm.valid) {
    const formValues = this.modificationForm.getRawValue();
    const rhId = Number(localStorage.getItem('RHID'));
    const formationId = this.selectedFormation.id;

    // Si c'est une formation POLYCOMPETENCE
    if (formValues.sousTypeFormation === 'POLYCOMPETENCE') {
      const formationDto: FormationDto_Resultat = {
        titre: formValues.titre,
        description: formValues.description,
        typeFormation: formValues.typeFormation,
        sousTypeFormation: formValues.sousTypeFormation,
        dateDebutPrevue: this.formatDate(formValues.dateDebutPrevue),
        dateFinPrevue: this.formatDate(formValues.dateFinPrevue),
        employes: formValues.selectedCitiesModif.map((employeId: number) => ({
          employeId: employeId,
          resultat: this.selectedRadioModif[employeId]
        })),
        responsableEvaluationId: this.selectedResponsableTypeModif === 'INTERNE' ? 
                              formValues.responsableEvaluationId : undefined,
        responsableEvaluationExterne: this.selectedResponsableTypeModif === 'EXTERNE' ? 
                                    formValues.responsableEvaluationExterne : undefined
      };

      // Appel du service pour POLYCOMPETENCE
      this.formationservice.modifierFormationAvecResultat(formationDto, rhId, formationId).subscribe({
        next: (response) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail: 'Formation mise à jour avec succès'
          });
          this.closeModificationDialog();
          this.loadFormations();
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: error.error || 'Erreur lors de la mise à jour'
          });
        }
      });
    } else {
      // Logique pour les autres types de formation (INTEGRATION, POLYVALENCE, etc.)
      const formData = new FormData();
      
      // Ajouter les champs obligatoires
      formData.append('titre', formValues.titre);
      formData.append('description', formValues.description);
      formData.append('typeFormation', formValues.typeFormation);
      formData.append('sousTypeFormation', formValues.sousTypeFormation);
      formData.append('dateDebutPrevue', formValues.dateDebutPrevue.toISOString().split('T')[0]);
      formData.append('dateFinPrevue', formValues.dateFinPrevue.toISOString().split('T')[0]);
      formData.append('organisateurId', rhId.toString());

      // Gérer le responsable selon le type
      if (this.selectedResponsableTypeModif === 'INTERNE' && formValues.responsableEvaluationId) {
        formData.append('responsableEvaluationId', formValues.responsableEvaluationId.toString());
      } else if (this.selectedResponsableTypeModif === 'EXTERNE' && formValues.responsableEvaluationExterne) {
        formData.append('responsableEvaluationExterne', formValues.responsableEvaluationExterne);
      }

      // Ajouter les employés sélectionnés
      formValues.selectedCitiesModif?.forEach((id: number) => {
        formData.append('employeIds', id.toString());
      });

      // Gérer le fichier PDF
      if (formValues.fichierPdf) {
        formData.append('fichierPdf', formValues.fichierPdf);
      } else if (formValues.titrePoste?.document) {
        // Si un nouveau poste est sélectionné mais pas de nouveau fichier
        const document = formValues.titrePoste.document;
        if (typeof document === 'string' && document.startsWith('JVBERi0')) {
          const pdfFile = this.base64ToFile(document, 'document.pdf');
          formData.append('fichierPdf', pdfFile);
        }
      }

      // Ajouter le titre du poste
      formData.append('titrePoste', formValues.titrePoste?.titre || '');

      // Appel du service pour les autres types
      this.formationservice.modifierFormation(
        formationId,
        formValues.titre,
        formValues.description,
        formValues.typeFormation,
        formValues.sousTypeFormation,
        formValues.dateDebutPrevue.toISOString().split('T')[0],
        formValues.dateFinPrevue.toISOString().split('T')[0],
        formValues.responsableEvaluationId || null,
        formValues.responsableEvaluationExterne || null,
        formValues.selectedCitiesModif || [],
        formValues.fichierPdf || null,
        rhId,
        formValues.titrePoste?.titre || ''
      ).subscribe({
        next: (response) => {
          // Mettre à jour le poste associé si nécessaire
          if (formValues.titrePoste?.id) {
            this.formationPosteService.updatePosteForFormation(formationId, formValues.titrePoste.id).subscribe({
              next: () => {
                console.log('Poste mis à jour avec succès');
              },
              error: (error) => {
                console.error('Erreur lors de la mise à jour du poste', error);
              }
            });
          }

          this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail: 'Formation mise à jour avec succès'
          });
          this.closeModificationDialog();
          this.loadFormations();
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: error.error || 'Erreur lors de la mise à jour'
          });
        }
      });
    }
  } else {
    this.messageService.add({
      severity: 'error',
      summary: 'Erreur',
      detail: 'Veuillez remplir tous les champs obligatoires'
    });
  }
}
// Méthodes utilitaires pour gérer les réponses
private handleSuccessResponse(response: any) {
  console.log('Formation mise à jour avec succès', response);
  this.messageService.add({
    severity: 'success',
    summary: 'Succès',
    detail: 'Formation mise à jour avec succès'
  });
  this.closeModificationDialog();
  this.loadFormations();
}

displayFormationPosteList() {
  this.formationPosteService.getAllPairs().subscribe({
    next: (pairs) => {
      console.log('Liste des paires formationId et posteId :', pairs);
    },
    error: (error) => {
      console.error('Erreur lors de la récupération des paires', error);
    },
  });
}

isInProgress(dateFinPrevue: Date): boolean {
  const today = new Date();
  const dateFin = new Date(dateFinPrevue);
  return today <= dateFin; // Retourne true si la formation est en cours
}



  onResponsableTypeChange(value: string) {
    this.selectedResponsableType = value;
  }
  openDialog() {
    this.dialogVisible = true;
  }
  openDialogModif() {
    this.dialogVisibleModif = true;
  }

  closeDialogModif() {
    this.dialogVisibleModif = false;
  }
  closeDialog() {
    this.dialogVisible = false;
  }
  private formatDate(date: Date | string | null): string {
    if (!date) return '';
    
    // Si c'est déjà une string, la retourner directement
    if (typeof date === 'string') return date;
    
    // Si c'est un objet Date, le formater
    return date.toISOString().split('T')[0];
  }
  submitFormation() {
    if (this.formationForm.invalid) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Veuillez remplir tous les champs pour créer une formation.'
      });
  
      Object.keys(this.formationForm.controls).forEach(key => {
        const control = this.formationForm.get(key);
        if (control?.invalid) {
          console.error(`Champ ${key} invalide:`, control.errors);
        }
      });
      return;
    }
  
    if (this.formationForm.valid) {
      const formValues = this.formationForm.getRawValue();
      const rhId = Number(localStorage.getItem('RHID'));
  
      // Si c'est une formation de polycompétences
      if (this.isPolycompetence()) {
        // Vérifier qu'on a bien des résultats pour chaque employé
        if (!this.selectedRadio || Object.keys(this.selectedRadio).length === 0) {
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: 'Veuillez sélectionner un résultat pour chaque employé.'
          });
          return;
        }
      
        // Créer l'objet avec toutes les propriétés dès le départ
        const formationDto: FormationDto_Resultat = {
          titre: formValues.titre,
          description: formValues.description,
          typeFormation: formValues.typeFormation,
          sousTypeFormation: formValues.sousTypeFormation,
          dateDebutPrevue: this.formatDate(formValues.dateDebutPrevue),
          dateFinPrevue: this.formatDate(formValues.dateFinPrevue),
          employes: formValues.selectedCities.map((employeId: number) => ({
            employeId: employeId,
            resultat: this.selectedRadio[employeId]
          })),
          // Initialiser les propriétés optionnelles
          responsableEvaluationId: undefined,
          responsableEvaluationExterne: undefined
        };
      
        // Affecter le responsable selon le type
        if (this.selectedResponsableType === 'INTERNE') {
          formationDto.responsableEvaluationId = formValues.responsableEvaluationId;
          formationDto.responsableEvaluationExterne = undefined;
        } else {
          formationDto.responsableEvaluationExterne = formValues.responsableEvaluationExterne;
          formationDto.responsableEvaluationId = undefined;
        }
      
       
        console.log('Données envoyées:', formationDto);
        
        // Appel du service
        this.formationservice.creerFormationAvecResultat(formationDto, rhId).subscribe({
       
        });
        this.closeDialog();
        this.loadFormations();
      } else {
        // Logique existante pour les autres types de formation
        const formData = new FormData();
  
        formData.append('titre', formValues.titre);
        formData.append('description', formValues.description);
        formData.append('typeFormation', formValues.typeFormation);
        formData.append('sousTypeFormation', formValues.sousTypeFormation);
        formData.append('dateDebutPrevue', formValues.dateDebutPrevue.toISOString().split('T')[0]);
        formData.append('dateFinPrevue', formValues.dateFinPrevue.toISOString().split('T')[0]);
  
        if (formValues.responsableEvaluationId) {
          formData.append('responsableEvaluationId', formValues.responsableEvaluationId.toString());
        }
        if (formValues.responsableEvaluationExterne) {
          formData.append('responsableEvaluationExterne', formValues.responsableEvaluationExterne);
        }
  
        formData.append('organisateurId', rhId.toString());
        formData.append('titrePoste', formValues.titrePoste.titre);
  
        formValues.selectedCities.forEach((id: number) => {
          formData.append('employeIds', id.toString());
        });
  
        if (formValues.titrePoste.document) {
          if (typeof formValues.titrePoste.document === 'string' && formValues.titrePoste.document.startsWith('JVBERi0')) {
            const pdfFile = this.base64ToFile(formValues.titrePoste.document, 'document.pdf');
            formData.append('fichierPdf', pdfFile);
          } else if (formValues.titrePoste.document instanceof File) {
            formData.append('fichierPdf', formValues.titrePoste.document);
          }
        }
  
        this.formationservice.creerFormation(formData).subscribe({
          next: (formationId) => {
            console.log('Formation ajoutée avec succès', formationId);
  
            if (this.posteSelectionne && this.posteSelectionne.id !== undefined) {
              this.formationPosteService.addPair(formationId, this.posteSelectionne.id).subscribe({
                next: () => {
                  console.log('Paire formationId et posteId ajoutée avec succès');
                  this.displayFormationPosteList();
                },
                error: (error) => {
                  console.error('Erreur lors de l\'ajout de la paire', error);
                },
              });
            } else {
              console.error('Données manquantes :', { posteSelectionne: this.posteSelectionne });
            }
  
            this.displayFormationPosteList();
            this.closeDialog();
            this.loadFormations();
          },
          error: (error) => {
            console.error('Erreur lors de l\'ajout de la formation', error);
          }
        });
      }
    }
  }

  loadFormations(): void {
    const rhId = localStorage.getItem('RHID');
  
    if (!rhId) {
      console.error("Impossible de récupérer l'ID du RH !");
      return;
    }
  
    this.loading = true;
    this.ngZone.run(() => {
      this.formationservice.getFormationsParRH(Number(rhId)).subscribe(
        (data) => {
          console.log("Formations récupérées avec succès", data);
          
          // Transformez les données reçues
          this.formations = data.map(item => this.transformToFormationDto(item));
          
          // Filtrer les formations INTÉGRATION et POLYVALENCE validées
          this.formationsValidees = this.formations.filter(f => 
            f.valide && 
            (f.sousTypeFormation === 'INTEGRATION' || 
             f.sousTypeFormation === 'POLYVALENCE')
          );
          
          // Filtrer les formations INTÉGRATION et POLYVALENCE non validées
          this.formationsNonValidees = this.formations.filter(f => 
            !f.valide && 
            (f.sousTypeFormation === 'INTEGRATION' || 
             f.sousTypeFormation === 'POLYVALENCE')
          );
          
          // Filtrer les formations POLYCOMPETENCES
          this.formationsCompletes = this.formations.filter(f => 
            f.sousTypeFormation === 'POLYCOMPETENCE'
          );
          
          this.loading = false;
          this.updateCalendarEvents();
        },
        (error) => {
          console.error('Erreur lors de la récupération des formations', error);
          this.loading = false;
        }
      );
    });
  }
  private transformToFormationDto(data: any): FormationDto {
    return {
      id: data.id,
      titre: data.titre,
      description: data.description,
      typeFormation: data.typeFormation,
      sousTypeFormation: data.sousTypeFormation,
      dateDebutPrevue: data.dateDebutPrevue,
      dateFinPrevue: data.dateFinPrevue,
      responsableEvaluationId: data.responsableEvaluationId,
      responsableEvaluationExterne: data.responsableEvaluationExterne,
      employeIds: data.employeIds || [],
      responsableEvaluation: data.responsableEvaluation,
      employes: data.employes,
      fichierPdf: data.fichierPdf,
      organisateurId: data.organisateurId,
      titrePoste: data.titrePoste,
      valide: data.valide
    };
  }
  // Méthode séparée pour la mise à jour du calendrier
  updateCalendarEvents(): void {
    this.calendarOptions.events = this.formations.map((formation) => ({
      title: formation.titre,
      start: new Date(formation.dateDebutPrevue), // Notez le changement de dateDebutPrevue à date_debut_prevue
      end: new Date(formation.dateFinPrevue),    // Notez le changement de dateFinPrevue à date_fin_prevue
    }));
    
    // Forcer la mise à jour du calendrier
    setTimeout(() => {
      this.calendarOptions = { ...this.calendarOptions };
    }, 0);
  }


  base64ToFile(base64: string, filename: string): File {
    const byteCharacters = atob(base64); // Décoder Base64
    const byteNumbers = new Array(byteCharacters.length);
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'application/pdf' }); // Créer un Blob
    return new File([blob], filename, { type: 'application/pdf' });
  }
  isEmployeeSelected(employeeCode: string): boolean {
    const selectedEmployees = this.formationForm.get('selectedCities')?.value || [];
    return selectedEmployees.includes(employeeCode);
  }

  isPolycompetence(): boolean {
    return this.formationForm.get('sousTypeFormation')?.value?.toLowerCase() === 'polycompetence';
  }

  onEmployeSelectionChange(selectedIds: number[]) {
    // Mettre à jour la liste des employés sélectionnés
    this.selectedEmployes = this.cities
      .filter(city => selectedIds.includes(city.code))
      .map(emp => ({
        ...emp,
        resultat: emp.resultat || null // Conserver le résultat existant si déjà défini
      }));
  }
  
  updateEmployeResultat(employe: any, resultat: string) {
    employe.resultat = resultat;
    // Vous pouvez ajouter ici une logique supplémentaire si nécessaire
  }


  
 // Fonction pour afficher nom et matricule
 customFilter(event: any, option: any): boolean {
  const searchValue = event.query.toLowerCase();
  const name = option.name.toLowerCase();
  const matricule = option.matricule.toString().toLowerCase();

  // Rechercher dans le nom et le matricule
  return name.includes(searchValue) || matricule.includes(searchValue);
}
getFormationStatus(dateFinPrevue: Date): string {
  const currentDate = new Date();
  
  // Si la date de fin est dans le futur, afficher "En cours"
  if (new Date(dateFinPrevue) > currentDate) {
    return 'En cours';  // premier tag
  } else {
    return 'Terminé'; // deuxième tag
  }
}

getStatusSeverity(dateFinPrevue: Date): 'success' | 'info' {
  const currentDate = new Date();

  // Si la date de fin est dans le futur, retourner 'info'
  if (new Date(dateFinPrevue) > currentDate) {
    return 'info'; // bleu clair (en cours)
  } else {
    return 'success'; // vert (terminé)
  }
}

ajouterResultat(formationId: number, employeId: number, resultat: string) {
  this.formationservice.ajouterResultatFormation(formationId, employeId, resultat).subscribe({
    next: (response) => {
      console.log('Résultat ajouté avec succès :', response);
      this.messageService.add({
        severity: 'success',
        summary: 'Succès',
        detail: 'Résultat mis à jour avec succès !',
      });
    },
    error: (err) => {
      console.error('Erreur lors de la mise à jour du résultat :', err);
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Une erreur est survenue lors de la mise à jour du résultat.',
      });
    },
  });
}

onSousTypeChange(sousType: string | null) {
  if (!sousType) return;
  
  const sousTypeLower = sousType.toLowerCase();
  
  if (sousTypeLower === 'polyvalence' || sousTypeLower === 'integration') {
    this.formationForm.get('typeFormation')?.setValue('INTERNE');
    this.formationForm.get('typeFormation')?.disable(); // <-- Ici
    
    this.formationForm.get('responsableType')?.setValue('INTERNE');
    this.formationForm.get('responsableType')?.disable(); // <-- Ici
    
    this.selectedResponsableType = 'INTERNE';
  } else {
    this.formationForm.get('typeFormation')?.enable(); // <-- Ici
    this.formationForm.get('responsableType')?.enable(); // <-- Ici
  }
}
shouldShowPosteSection(): boolean {
  const sousType = this.formationForm.get('sousTypeFormation')?.value;
  return !['polycompetence', 'sensibilisation'].includes(sousType?.toLowerCase());
}


getSeverity(resultat: string): "success" | "info" | "warn" | "danger" | "secondary" | "contrast" | undefined {
  switch (resultat) {
    case 'REUSSI':
      return 'success'; // Vert
    case 'ECHEC':
      return 'danger'; // Rouge
    case 'PROGRAMME_COMPLEMENTAIRE':
      return 'warn'; // Orange (utilisez 'warn' au lieu de 'warning')
    default:
      return 'info'; // Bleu (par défaut)
  }
}

// Méthode pour obtenir le libellé du résultat
getResultatLabel(resultat: string): string {
  const option = this.resultatOptions.find((opt) => opt.value === resultat);
  return option ? option.label : 'non évalué';
}



// Méthode pour mettre à jour le résultat
// Méthode principale pour mettre à jour le résultat
// Méthode pour mettre à jour le résultat
updateResultat(formationId: number, employeId: number, resultat: string, employe: any) {
  // Vérifier si c'est une formation POLYCOMPETENCE
  if (this.selectedFormation?.sousTypeFormation === 'POLYCOMPETENCE') {
    // Pour les formations polycompétences, mettre à jour directement sans confirmation
    this.formationservice.ajouterResultatFormation(formationId, employeId, resultat).subscribe({
      next: (response) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Résultat mis à jour avec succès !',
        });
        employe.resultat = resultat;
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Une erreur est survenue lors de la mise à jour du résultat.',
        });
      },
    });
  } 
  else if (resultat === 'REUSSI') {
    this.confirmationService.confirm({
        message: `Êtes-vous sûr que l'employé ${employe.nom} ${employe.prenom} a réussi cette formation ?`,
        header: 'Confirmation de réussite',
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
            employe.tempResultat = 'REUSSI';
            
            // Deuxième confirmation pour changement de poste
            this.confirmationService.confirm({
                message: `Voulez-vous passer cet employé à un autre poste comme poste actuel ?`,
                header: 'Changement de poste',
                icon: 'pi pi-info-circle',
                accept: () => {
                    this.showDirectionSiteDialog(formationId, employe);
                },
                reject: () => {
                    // Appel du service pour enregistrer le résultat
                    this.formationservice.ajouterResultatFormation(formationId, employe.id, 'REUSSI').subscribe({
                        next: (response) => {
                            // Afficher d'abord le message toast de succès
                            this.messageService.add({
                                severity: 'success',
                                summary: 'Succès',
                                detail: 'Résultat mis à jour avec succès !'
                            });
                            
                            // Puis afficher le message dans une boîte de dialogue
                            this.confirmationService.confirm({
                                message: `L'employé ${employe.nom} ${employe.prenom} reste à son poste actuel mais a bien réussi cette formation et peut l'exercer .`,
                                header: 'Information',
                                icon: 'pi pi-check-circle',
                                acceptLabel: 'OK',
                                rejectVisible: false, // Cache le bouton Non
                                accept: () => {
                                    employe.resultat = 'REUSSI';
                                    employe.tempResultat = null;
                                }
                            });
                        },
                        error: (err) => {
                            this.messageService.add({
                                severity: 'error',
                                summary: 'Erreur',
                                detail: 'Une erreur est survenue lors de la mise à jour du résultat.'
                            });
                        }
                    });
                }
            });
        },
        reject: () => {
            employe.resultat = null;
            employe.tempResultat = null;
        }
    });
}
  else {
    // Pour les autres résultats (ECHEC, PROGRAMME_COMPLEMENTAIRE)
    this.formationservice.ajouterResultatFormation(formationId, employeId, resultat).subscribe({
      next: (response) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Résultat mis à jour avec succès !',
        });
        employe.resultat = resultat;
        employe.tempResultat = null;
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Une erreur est survenue lors de la mise à jour du résultat.',
        });
      },
    });
  }
}

// Afficher le dialogue de sélection direction/site
showDirectionSiteDialog(formationId: number, employe: any) {
  this.selectedEmploye = employe;
  
  // Récupérer l'ID du poste associé à la formation
  this.formationPosteService.getPosteIdByFormationId(formationId).subscribe({
    next: (posteId) => {
      // Récupérer les détails complets du poste
      this.posteService.getPosteById(posteId).subscribe({
        next: (poste) => {
          this.selectedPoste = poste;
          
          // Charger les directions pour ce poste
          this.posteService.getDirectionsByPosteId(posteId).subscribe({
            next: (directions) => {
              this.directions = directions;
              this.displayPosteAssignmentDialog = true;
            },
            error: (err) => {
              console.error('Erreur directions:', err);
              this.messageService.add({
                severity: 'error',
                summary: 'Erreur',
                detail: 'Impossible de charger les directions'
              });
              // Annuler le résultat temporaire en cas d'erreur
              employe.tempResultat = null;
            }
          });
        },
        error: (err) => {
          console.error('Erreur poste:', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: 'Impossible de récupérer les détails du poste'
          });
          employe.tempResultat = null;
        }
      });
    },
    error: (err) => {
      console.error('Erreur poste ID:', err);
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Impossible de récupérer le poste associé'
      });
      employe.tempResultat = null;
    }
  });
}

// Gestion de la sélection de direction
onDirectionSelect(event: any) {
  this.selectedDirection = event.value;
  this.selectedSite = null; // Réinitialiser la sélection de site
  
  if (this.selectedDirection) {
    // Charger les sites pour la direction sélectionnée
    this.directionservice.getSitesByDirection(this.selectedDirection.id).subscribe({
      next: (sites) => {
        this.sites = sites;
      },
      error: (err) => {
        console.error('Erreur sites:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de charger les sites'
        });
      }
    });
  }
}

confirmAssignment() {
  // First check all required selections with proper null checks
  if (!this.selectedDirection?.id || !this.selectedSite?.id || 
      !this.selectedEmploye?.id || !this.selectedPoste?.id || 
      !this.selectedFormation?.id) {
    this.messageService.add({
      severity: 'warn',
      summary: 'Attention',
      detail: 'Veuillez sélectionner tous les éléments requis'
    });
    return;
  }

  // Now TypeScript knows these values can't be undefined
  const employeId = this.selectedEmploye.id;
  const posteId = this.selectedPoste.id;
  const directionId = this.selectedDirection.id;
  const siteId = this.selectedSite.id;
  const formationId = this.selectedFormation.id;

  console.log('IDs sélectionnés:', {
    employeId,
    posteId,
    directionId,
    siteId
  });

  // Appel pour changer le poste de l'employé
  this.formationservice.changerPosteEmploye(
    employeId,
    posteId,
    directionId,
    siteId
  ).subscribe({
    next: (posteResponse) => {
      // Si le changement de poste réussit, on met à jour le résultat de formation
      this.formationservice.ajouterResultatFormation(
        formationId, 
        employeId, 
        'REUSSI'
      ).subscribe({
        next: (formationResponse) => {
          // Mettre à jour l'interface seulement après les deux succès
          this.selectedEmploye.resultat = 'REUSSI';
          this.selectedEmploye.tempResultat = null;
          
          this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail: 'Affectation et résultat mis à jour avec succès !'
          });

          // Fermer le dialogue
          this.displayPosteAssignmentDialog = false;
          this.selectedDirection = null;
          this.selectedSite = null;
        },
        error: (formationErr) => {
          console.error('Erreur lors de la mise à jour du résultat:', formationErr);
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: "Erreur lors de l'enregistrement du résultat"
          });
        }
      });
    },
    error: (posteErr) => {
      console.error('Erreur lors du changement de poste:', posteErr);
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: "Erreur lors du changement de poste"
      });
    }
  });
}
// Annulation du dialogue d'affectation
onPosteAssignmentDialogHide() {
  // Réinitialiser le résultat temporaire si l'utilisateur ferme sans confirmer
  if (this.selectedEmploye?.tempResultat) {
    this.selectedEmploye.tempResultat = null;
  }
  this.selectedDirection = null;
  this.selectedSite = null;
}

// Réinitialiser le résultat (pour permettre une nouvelle sélection)
resetResultat(employe: any) {
  employe.resultat = null;
  employe.tempResultat = null;
}
 

 // Méthode qui met à jour le radio sélectionné pour un employé donné
 editingEmployee: { [key: string]: boolean } = {};
 onRadioChange(employeeCode: string, selectedValue: string): void {
  this.selectedRadio[employeeCode] = selectedValue;
  this.editingEmployee[employeeCode] = false; // Masquer les boutons après sélection
  console.log(`Employé ${employeeCode} a sélectionné : ${selectedValue}`);
}

editSelection(employeeCode: string): void {
  this.editingEmployee[employeeCode] = true; // Afficher à nouveau les boutons radio
}

// Variables pour la modification
selectedResponsableTypeModif: string = '';
selectedEmployeesModif: any[] = [];
selectedRadioModif: { [key: string]: string } = {};
editingEmployeeModif: { [key: string]: boolean } = {};

// Méthodes pour la modification
isPolycompetenceModif(): boolean {
  return this.modificationForm.get('sousTypeFormation')?.value?.toLowerCase() === 'polycompetence';
}

shouldShowPosteSectionModif(): boolean {
  const sousType = this.modificationForm.get('sousTypeFormation')?.value;
  return !['polycompetence', 'sensibilisation'].includes(sousType?.toLowerCase());
}

onSousTypeChangeModif(value: string | null) {
  if (!value) return;

  const sousTypeLower = value.toLowerCase();

  // Désactiver le champ sousTypeFormation si POLYCOMPETENCE
  if (sousTypeLower === 'polycompetence') {
    this.modificationForm.get('sousTypeFormation')?.disable();
  } else {
    this.modificationForm.get('sousTypeFormation')?.enable();
  }

  // Logique pour INTEGRATION/POLYVALENCE
  if (sousTypeLower === 'integration' || sousTypeLower === 'polyvalence') {
    this.modificationForm.get('typeFormation')?.setValue('INTERNE');
    this.modificationForm.get('typeFormation')?.disable();

    this.modificationForm.get('responsableType')?.setValue('INTERNE');
    this.modificationForm.get('responsableType')?.disable();

    this.selectedResponsableTypeModif = 'INTERNE';
  } else {
    this.modificationForm.get('typeFormation')?.enable();
    this.modificationForm.get('responsableType')?.enable();
  }
}

onResponsableTypeChangeModif(value: string) {
  this.selectedResponsableTypeModif = value;
}

onRadioChangeModif(employeeCode: string, selectedValue: string): void {
  this.selectedRadioModif[employeeCode] = selectedValue;
  this.editingEmployeeModif[employeeCode] = false;
}

editSelectionModif(employeeCode: string): void {
  this.editingEmployeeModif[employeeCode] = true;
}

onEmployeSelectionChangeModif(selectedCodes: number[]) {
  // Mettre à jour la liste des employés sélectionnés
  this.selectedEmployeesModif = selectedCodes
    .map(code => {
      const cityEmp = this.cities.find(c => c.code === code);
      return cityEmp ? {
        ...cityEmp,
        name: cityEmp.name || `${cityEmp.nom} ${cityEmp.prenom}`
      } : null;
    })
    .filter(Boolean);

  // Gérer les résultats
  selectedCodes.forEach(code => {
    if (!this.selectedRadioModif[code]) {
      this.selectedRadioModif[code] = '';
    }
  });

  // Nettoyer les résultats des employés désélectionnés
  Object.keys(this.selectedRadioModif).forEach(codeStr => {
    const code = Number(codeStr);
    if (!selectedCodes.includes(code)) {
      delete this.selectedRadioModif[code];
    }
  });
}


}







