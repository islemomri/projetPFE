import { Component, CUSTOM_ELEMENTS_SCHEMA, EventEmitter, OnInit, Output ,AfterViewInit, SecurityContext } from '@angular/core';
import { FormationService } from '../service/formation.service';
import { FormationDto } from '../model/FormationDto.model';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { PaginatorModule } from 'primeng/paginator';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog'; 
import { EmoloyeService } from '../../employe/service/emoloye.service';
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';
import * as pdfjsLib from 'pdfjs-dist';
import { ChangeDetectorRef } from '@angular/core';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { TabViewModule } from 'primeng/tabview';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import PSPDFKit from 'pspdfkit';
import { FullCalendarModule } from '@fullcalendar/angular'; // Importez FullCalendarModule

import dayGridPlugin from '@fullcalendar/daygrid'; // Plugin pour la vue mensuelle
import timeGridPlugin from '@fullcalendar/timegrid'; // Plugin pour la vue hebdomadaire/jour
import interactionPlugin from '@fullcalendar/interaction'; // Plugin pour les interactions
import { CalendarOptions } from '@fullcalendar/core'; // Options du calendrier
import { TooltipModule } from 'primeng/tooltip';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-formation-responsable',
  imports: [CardModule,
    TagModule,
    TabViewModule,
    TableModule,
    ButtonModule,
    PaginatorModule,
    InputTextModule,
    CommonModule,
    DialogModule,
    ToastModule,
    PdfViewerModule,
    TooltipModule,
    FormsModule ,
    FullCalendarModule




    

  ],
  templateUrl: './formation-responsable.component.html',
  styleUrl: './formation-responsable.component.css',
  providers: [MessageService],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class FormationResponsableComponent implements OnInit, AfterViewInit{
// Variables existantes...
showSignaturePad: boolean = false;
pspdfkitInstance: any;
formations: FormationDto[] = [];
selectedFormation: any;
displayDialog: boolean = false;
displayPdfDialog: boolean = false;
  pdfUrl: SafeResourceUrl | null = null;
  pdfUrls: { [key: string]: SafeResourceUrl } = {};
  participantsMap: { [key: number]: number } = {}; 
  pdfDialogVisible: boolean = false;
  selectedPdfUrl: SafeUrl | null = null;
  signatureDataUrl: string | null = null;
  signatureImage: string | null = null; // Pour stocker l'image de la signature
  signaturePosition = { x: 0, y: 0 }; // Position de la signature sur le PDF
  pdfBytes: Uint8Array | null = null;
  selectedEmploye: any;
  allEmployeesEvaluated: boolean = false;
  formationsValidees: FormationDto[] = [];
  formationsNonValidees: FormationDto[] = [];
  showTempMatricule: boolean = false;
  pdfLoading: boolean = false;
  loading: boolean = false; 
tempMatriculePosition: { x: number; y: number } = { x: 0, y: 0 };

  constructor(
    private formationservice : FormationService,
     private Emoloyeservice: EmoloyeService,
     private sanitizer: DomSanitizer,
     private messageService: MessageService,
    
     private cdr: ChangeDetectorRef){
     }

    
     displayEventDialog: boolean = false;
     selectedEvent: any = null;
     displayCalendarDialog: boolean = false; // Pour afficher/masquer le dialogue du calendrier
     calendarEvents: any[] = []; // Événements du calendrier
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
   
     // Méthode pour gérer le clic sur un événement du calendrier
     handleEventClick(info: any): void {
      // Récupérer les détails de la formation cliquée
      const formation = this.formations.find(f => f.titre === info.event.title);
    
      if (formation) {
        // Afficher les détails de la formation dans le dialogue
        this.selectedEvent = {
          title: formation.titre,
          start: formation.dateDebutPrevue,
          end: formation.dateFinPrevue,
          description: formation.description,
          typeFormation: formation.typeFormation,
          sousTypeFormation: formation.sousTypeFormation,
          responsableEvaluation: formation.responsableEvaluation,
          responsableEvaluationExterne: formation.responsableEvaluationExterne,
          valide: formation.valide,
        };
        this.displayEventDialog = true; // Afficher le dialogue
      } else {
        console.error('Formation non trouvée.');
      }
    }
    today: Date = new Date();

openCalendar(formation: any) {
  // Tu peux afficher le calendrier ici en le rendant visible via une logique
  const calendar = document.querySelector(`#calendar-${formation.id}`) as HTMLElement;

  if (calendar) {
    calendar.style.display = 'block';
  }
}

verifierDateRappel(formation: any) {
  if (formation.dateRappel && formation.dateRappel > new Date(formation.dateFinPrevue)) {
    // Réinitialiser ou afficher une alerte
    formation.dateRappel = null;
    alert("La date de rappel doit être avant la date de fin !");
  }
}

   
     // Méthode pour ouvrir le dialogue du calendrier
     openCalendarDialog() {
       this.displayCalendarDialog = true;
       this.loadCalendarEvents();
     }
   
     // Méthode pour charger les événements du calendrier
   // Ajoutez cette méthode pour transformer les dates de manière fiable
private transformToFormationDto(data: any): FormationDto {
  return {
    id: data.id,
    titre: data.titre,
    description: data.description,
    typeFormation: data.typeFormation,
    sousTypeFormation: data.sousTypeFormation,
    dateDebutPrevue: this.formatDateForCalendar(data.dateDebutPrevue),
    dateFinPrevue: this.formatDateForCalendar(data.dateFinPrevue),
                                                 
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
calendarState: { [key: number]: boolean } = {};
toggleCalendar(formationId: number) {
  this.calendarState[formationId] = !this.calendarState[formationId];
}

// Vérifie si le calendrier doit être affiché pour cette formation
isCalendarVisible(formationId: number): boolean {
  return !!this.calendarState[formationId];
}
loadExistingRappelDates() {
  this.formations.forEach(formation => {
    this.formationservice.getDateRappel(formation.id!).subscribe({
      next: (date) => {
        if (date) formation.dateRappel = date;
        // Calculer la date par défaut si non définie
        if (!formation.dateRappel) {
          this.setDefaultRappelDate(formation);
        }
      },
      error: (err) => console.error(err)
    });
  });
}
// Fonction pour ajouter/soustraire des jours à une date
addDays(days: number, date?: Date): Date {
  const result = date ? new Date(date) : new Date();
  result.setDate(result.getDate() + days);
  return result;
}
// Dans votre composant
getDefaultRappelDate(dateFinPrevu: Date | null | undefined): Date | null {
  if (!dateFinPrevu) return null;
  const date = new Date(dateFinPrevu);
  date.setDate(date.getDate() - 2);
  return date;
}
// Dans votre template, vous pourriez l'utiliser comme ceci :
// (formation.dateFinPrevu | date: 'dd/MM/yyyy' : addDays(-2))

setDefaultRappelDate(formation: any) {
  if (formation.dateFinPrevu) {
    const dateFin = new Date(formation.dateFinPrevu);
    dateFin.setDate(dateFin.getDate() - 2); // 2 jours avant la fin
    formation.dateRappelDefault = dateFin.toISOString().split('T')[0];
  }
}
loadingDates: { [key: number]: boolean } = {};

onDateSelect(formation: any) {
  if (formation.dateRappel) {
    this.loadingDates[formation.id] = true;
    
    this.formationservice.modifierDateRappel(formation.id, formation.dateRappel)
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail: 'Date de rappel mise à jour'
          });
          this.loadingDates[formation.id] = false;
        },
        error: (err) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: 'Échec de la mise à jour'
          });
          this.loadingDates[formation.id] = false;
        }
      });
  }
}

resetToDefault(formation: any) {
  if (formation.dateRappelDefault) {
    formation.dateRappel = formation.dateRappelDefault;
    this.onDateSelect(formation);
  }
}

private formatDateForCalendar(dateInput: any): string {
  if (!dateInput) return new Date().toISOString();
  
  // Si c'est déjà une string ISO valide
  if (typeof dateInput === 'string' && this.isValidISODate(dateInput)) {
    return dateInput;
  }
  
  // Convertir en Date
  const date = this.convertToDate(dateInput);
  return date ? date.toISOString() : new Date().toISOString();
}

private isValidISODate(dateString: string): boolean {
  return /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})?)?$/.test(dateString);
}

private convertToDate(dateInput: any): Date | null {
  if (!dateInput) return null;
  
  // Si c'est déjà une Date valide
  if (dateInput instanceof Date && !isNaN(dateInput.getTime())) {
    return dateInput;
  }
  
  // Si c'est un timestamp
  if (typeof dateInput === 'number') {
    return new Date(dateInput);
  }
  
  // Si c'est une string
  if (typeof dateInput === 'string') {
    // Essayez le parsing direct
    const date = new Date(dateInput);
    if (!isNaN(date.getTime())) return date;
    
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

// Modifiez loadCalendarEvents comme suit :
loadCalendarEvents() {
  const responsableID = localStorage.getItem('RESPONSABLEID');
  if (!responsableID) {
    console.error("Impossible de récupérer l'ID du responsable !");
    return;
  }

  this.formationservice.getFormationsParResponsable(Number(responsableID)).subscribe(
    (data) => {
      this.calendarEvents = data.map(item => {
        const formation = this.transformToFormationDto(item);
        
        // Palette professionnelle bleu/orange
        const style = formation.valide 
          ? { // Événement confirmé - Thème bleu
              bgColor: '#e8f4fc',
              borderColor: '#4a89dc',
              textColor: '#2c3e50',
              dotColor: '#4a89dc'
            }
          : { // Événement temporaire - Thème orange
              bgColor: '#fff7ed',
              borderColor: '#f97316',
              textColor: '#9a3412',
              dotColor: '#f97316'
            };

        return {
          title: formation.titre,
          start: formation.dateDebutPrevue,
          end: formation.dateFinPrevue,
          color: style.bgColor,
          borderColor: style.borderColor,
          textColor: style.textColor,
          extendedProps: {
            description: formation.description,
            type: formation.typeFormation,
            valide: formation.valide
          },
          className: formation.valide ? 'event-confirmed' : 'event-tentative'
        };
      });

      this.updateCalendar();
    },
    (error) => {
      console.error('Erreur:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Erreur lors du chargement du calendrier'
      });
    }
  );
}

private updateCalendar(): void {
  this.calendarOptions = {
    ...this.calendarOptions,
    events: [...this.calendarEvents]
  };
  
  // Si vous utilisez ViewChild pour accéder au calendrier
  
}
   
  ngAfterViewInit(): void {
    throw new Error('Method not implemented.');
  }
     isFormationEnCours(dateFin: string | Date): boolean {
      const dateFinPrevue = new Date(dateFin);
      const today = new Date();
      return dateFinPrevue >= today;
    }
    


  ngOnInit(): void {
    const responsableID = localStorage.getItem('RESPONSABLEID');
    if (!responsableID) {
      console.error("Impossible de récupérer l'ID du RH !");
      return;
    }else{
     
        this.formationservice.getFormationsParResponsable(Number(responsableID)).subscribe(
          (data) => {
            console.log("hiiiiii",data );
            this.formations = data;
            this.formationsValidees = this.formations.filter((f) => f.valide);
            this.formationsNonValidees = this.formations.filter((f) => !f.valide);
          
            
          },
          (error) => {
            console.error('Erreur lors de la récupération des formations', error);
            
          }
        );
      
    }
    this.initializeSelectedPdfUrl();
  }

  getStatusSeverity(dateFin: Date): "success" | "danger" | "warn" | undefined {
    const today = new Date();
    if (new Date(dateFin) < today) {
      return 'danger'; // Terminée
    } else {
      return 'success'; // En cours
    }
  }
  

  getFormationStatus(dateFin: Date): string {
    const today = new Date();
    if (new Date(dateFin) < today) {
      return 'Terminée';
    } else {
      return 'En cours';
    }
  }





  private hasOpenedBefore: boolean = false;
  private allEmployeesValidated: boolean = false;

  showParticipants(formation: any) { 
    console.log("Formation sélectionnée :", formation);
  
    this.selectedFormation = formation;
    this.displayDialog = true;
    this.participantsMap = {};
    this.pdfUrls = {};
    this.allEmployeesValidated = false; // Reset au début

    if (!formation.id) {
      console.error("⚠️ ID de la formation est indéfini !");
      this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'ID de la formation est indéfini !' });
      return;
    }

    let documentsCount = 0;
    formation.employes.forEach((employe: any) => {
      this.participantsMap[employe.id] = formation.id;

      this.Emoloyeservice.getDocumentByEmployeIdAndFormationId(employe.id, formation.id).subscribe({
        next: (response: Blob) => {
          const fileURL = URL.createObjectURL(new Blob([response], { type: 'application/pdf' }));
          this.pdfUrls[employe.id] = this.sanitizer.bypassSecurityTrustResourceUrl(fileURL);
          
          documentsCount++;
          if (documentsCount === formation.employes.length) {
            this.checkAllEmployeesEvaluated(formation);
          }
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
    });
}

private checkAllEmployeesEvaluated(formation: any) {
  const allEvaluated = formation.employes.every((employe: any) => this.pdfUrls[employe.id]);



  this.hasOpenedBefore = true; // Marquer que la première ouverture est passée
}

  onConfirmValidation() {
    this.displayValidationConfirmDialog = false;
    
    this.formationservice.validerFormation(this.selectedFormation.id).subscribe({
      next: (response) => {
        if (response.success) {
          this.allEmployeesEvaluated = true;
          this.selectedFormation.valide = true;
          this.messageService.add({ 
            severity: 'success', 
            summary: 'Succès', 
            detail: 'Tous les employés ont été validés avec succès',
            life: 3000
          });
  
          setTimeout(() => {
            this.hideDialog();
          }, 1000);
  
          this.loadFormationsData();
        }
      },
      error: (err) => {
        console.error('Erreur lors de la validation de la formation :', err);
        this.messageService.add({ 
          severity: 'error', 
          summary: 'Erreur', 
          detail: 'Erreur lors de la validation finale' 
        });
      }
    });
  }
   shouldDisplayValidationDialog(): boolean {
    return this.displayValidationConfirmDialog && !this.selectedFormation?.valide;
  }
  onRejectValidation() {
    this.displayValidationConfirmDialog = false;
  }
  areAllEmployeesEvaluated(): boolean {
    if (!this.selectedFormation || !this.selectedFormation.employes) {
      return false;
    }
  
    return this.selectedFormation.employes.every(
      (employe: any) => this.pdfUrls[employe.id]
    );
  }
  

  hideDialog() {
    this.displayDialog = false;
    this.pdfUrls = {};
    this.allEmployeesEvaluated = false;
    
    // Libérer les URLs
    Object.values(this.pdfUrls).forEach(url => {
      const unsafeUrl = this.sanitizer.sanitize(4, url);
      if (unsafeUrl) URL.revokeObjectURL(unsafeUrl);
    });
  
    if (this.selectedPdfUrl) {
      const oldUrl = this.sanitizer.sanitize(4, this.selectedPdfUrl);
      if (oldUrl) URL.revokeObjectURL(oldUrl);
    }
  }
  selectedPosition: { x: number; y: number } | null = null;




  

  initializeSelectedPdfUrl() {
    this.selectedPdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl('');
  }

  async loadPdf() {
    try {
      this.pspdfkitInstance = await PSPDFKit.load({
        baseUrl: location.protocol + '//' + location.host + '/assets/',
        document: '/assets/example.pdf', // Chemin vers votre PDF
        container: '#pspdfkit-container',
      });

      // Activer le mode d'édition de texte
      this.pspdfkitInstance.setViewState((viewState: any) =>
        viewState.set('interactionMode', PSPDFKit.InteractionMode.CONTENT_EDITOR)
      );

      console.log('PSPDFKit chargé avec succès.');
    } catch (error) {
      console.error('Erreur lors du chargement de PSPDFKit :', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Impossible de charger le PDF.',
      });
    }
  }

  async openPdfDialog(pdfUrl: SafeUrl | null, employe: any) {
    if (!pdfUrl || !employe) {
      console.error('Aucun PDF ou employé sélectionné.');
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Aucun PDF ou employé sélectionné.',
      });
      return;
    }
  
    // Libérer l'URL de l'ancien PDF s'il existe
    if (this.selectedPdfUrl) {
      const oldUrl = this.sanitizer.sanitize(4, this.selectedPdfUrl);
      if (oldUrl) {
        URL.revokeObjectURL(oldUrl);
      }
    }
  
    this.selectedEmploye = employe; // Définir selectedEmploye ici
  
    try {
      const url = this.sanitizer.sanitize(4, pdfUrl);
      if (!url) {
        console.error('URL invalide.');
        return;
      }
  
      const existingPdfBytes = await fetch(url).then((res) => res.arrayBuffer());
      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      const pages = pdfDoc.getPages();
      const firstPage = pages[0];
  
      // Texte à afficher (matricule, nom, prénom)
      const matriculeText = `${employe.matricule}`;
      const nomPrenomText = `${employe.nom} ${employe.prenom}`;
      const formation = this.selectedFormation;
      const titrePosteText = formation?.titrePoste || '';
      const dateDebutPrevue = formation?.dateDebutPrevue || '';
      const dateFinPrevue = formation?.dateFinPrevue || '';
      const responsableEvaluationnom = formation?.responsableEvaluation.nom || '';
      const responsableEvaluationprenom = formation?.responsableEvaluation.prenom || '';
      // Si une position spécifique est sélectionnée
      if (this.selectedPosition) {
        const { x, y } = this.selectedPosition;
        firstPage.drawText(matriculeText, {
          x: 130,
          y: y,
          size: 12,
          color: rgb(0, 0, 0),
        });
        // Positionner le nom et prénom avec une taille différente
        firstPage.drawText(nomPrenomText.toLowerCase(), {
          x: x + 100, // Décalage en X pour ne pas superposer avec le matricule
          y: y,
          size: 14,  // Taille plus grande pour le nom et prénom
          color: rgb(0, 0, 0),
        });

        firstPage.drawText(titrePosteText, {
          x: x,
          y: y - 20, // décalage vers le bas
          size: 12,
          color: rgb(0, 0, 0),
        });
        firstPage.drawText(dateDebutPrevue, {
          x: x,
          y: y - 20, // décalage vers le bas
          size: 12,
          color: rgb(0, 0, 0),
        });
        firstPage.drawText(dateFinPrevue, {
          x: x,
          y: y - 20, // décalage vers le bas
          size: 12,
          color: rgb(0, 0, 0),
        });
        firstPage.drawText(responsableEvaluationnom, {
          x: x,
          y: y - 20, // décalage vers le bas
          size: 12,
          color: rgb(0, 0, 0),
        });
        firstPage.drawText(responsableEvaluationprenom, {
          x: x,
          y: y - 20, // décalage vers le bas
          size: 12,
          color: rgb(0, 0, 0),
        });

      } else {
        // Position par défaut si aucune position sélectionnée
        firstPage.drawText(matriculeText, {
          x: 130,
          y: firstPage.getHeight() - 210,
          size: 12,
          color: rgb(0, 0, 0),
        });
        // Positionner le nom et prénom avec une taille différente
        firstPage.drawText(nomPrenomText.toLowerCase(), {
          x: 160,
          y: firstPage.getHeight() - 190,
          size: 14, // Taille plus grande pour le nom et prénom
          color: rgb(0, 0, 0),
        });
        firstPage.drawText(titrePosteText, {
          x: 160,
          y: firstPage.getHeight() - 250,
          size: 12,
          color: rgb(0, 0, 0),
        });
        firstPage.drawText(dateDebutPrevue, {
          x: 211,
          y: firstPage.getHeight() - 272,
          size: 10,
          color: rgb(0, 0, 0),
        });
        firstPage.drawText(dateFinPrevue, {
          x: 280,
          y: firstPage.getHeight() - 272,
          size: 10,
          color: rgb(0, 0, 0),
        });
        firstPage.drawText(responsableEvaluationnom, {
          x: 185,
          y: firstPage.getHeight() - 292,
          size: 10,
          color: rgb(0, 0, 0),
        });
        firstPage.drawText(responsableEvaluationprenom, {
          x: 211,
          y: firstPage.getHeight() - 292,
          size: 10,
          color: rgb(0, 0, 0),
        });
      }
  
      // Sauvegarder les modifications du PDF
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const modifiedPdfUrl = URL.createObjectURL(blob);
  
      // Mettre à jour selectedPdfUrl pour afficher le PDF modifié
      this.selectedPdfUrl = modifiedPdfUrl;
      this.cdr.detectChanges(); // Force la détection des changements
      this.pdfDialogVisible = true;
    } catch (error) {
      console.error('Erreur lors de la modification du PDF:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Une erreur est survenue lors de l\'ouverture du PDF.',
      });
    } finally {
      this.selectedPosition = null; // Réinitialiser la position après modification
    }
  }
  

  printPdf() {
    if (this.selectedPdfUrl) {
      // Désanctuariser l'URL en une chaîne de caractères
      const pdfUrl = this.sanitizer.sanitize(4, this.selectedPdfUrl) as string;
  
      if (pdfUrl) {
        const printWindow = window.open(pdfUrl, '_blank');
        if (printWindow) {
          printWindow.onload = () => {
            printWindow.print();
          };
        } else {
          console.error('Impossible d\'ouvrir une nouvelle fenêtre pour l\'impression.');
        }
      } else {
        console.error('URL invalide pour l\'impression.');
      }
    } else {
      console.error('Aucun PDF à imprimer.');
    }}

    private loadFormationsData() {
      const responsableID = localStorage.getItem('RESPONSABLEID');
      if (!responsableID) return;
    
      this.formationservice.getFormationsParResponsable(Number(responsableID)).subscribe(
        (data) => {
          this.formations = data;
          this.loadExistingRappelDates();
          this.formationsValidees = this.formations.filter((f) => f.valide);
          this.formationsNonValidees = this.formations.filter((f) => !f.valide);
          this.cdr.detectChanges(); // Forcer la mise à jour de la vue
        },
        (error) => {
          console.error('Erreur lors de la récupération des formations', error);
        }
      );
    }
  

    displayValidationConfirmDialog: boolean = false;

    async saveModifiedPdf(formationId: number, employeId: number) {
      let modifiedPdfFile: File;
    
      if (this.selectedFile) {
        modifiedPdfFile = this.selectedFile;
      } else if (this.selectedPdfUrl) {
        const url = this.sanitizer.sanitize(4, this.selectedPdfUrl);
        if (!url) {
          console.error('URL invalide.');
          return;
        }
    
        const existingPdfBytes = await fetch(url).then(res => res.arrayBuffer());
        const pdfDoc = await PDFDocument.load(existingPdfBytes);
        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        modifiedPdfFile = new File([blob], 'modified_pdf.pdf', { type: 'application/pdf' });
      } else {
        console.error('Aucun PDF sélectionné.');
        return;
      }
    
      this.formationservice.modifierDocumentEmployeFormation(formationId, employeId, modifiedPdfFile).subscribe({
        next: (response) => {
          console.log('PDF modifié enregistré avec succès:', response);
          
          // 1. Afficher l'alerte de succès
          this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail: 'Les modifications ont été enregistrées avec succès !',
            life: 3000
          });
    
          // 2. Fermer le dialogue PDF
          this.pdfDialogVisible = false;
          
          // 3. Vérifier si tous les employés sont évalués
          this.checkAllEmployeesEvaluated(this.selectedFormation);
          
          // 4. Nettoyer les ressources
          this.clearPdf();
        },
        error: (err) => {
          console.error('Erreur lors de l\'enregistrement du PDF modifié:', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: 'Une erreur est survenue lors de l\'enregistrement.',
            life: 5000
          });
        }
      });
    }
    
selectedFile: File | null = null;
pdfViewerKey = 0; // Clé initiale
// Méthode pour gérer la sélection d'un fichier
onFileSelected(event: any) {
  const file = event.target.files[0];

  if (!file) {
    return;
  }

  if (file.type !== 'application/pdf') {
    this.messageService.add({
      severity: 'error',
      summary: 'Format invalide',
      detail: 'Veuillez sélectionner un fichier PDF.',
    });
    return;
  }

  const fileReader = new FileReader();
  fileReader.onload = () => {
    const blob = new Blob([fileReader.result as ArrayBuffer], { type: 'application/pdf' });
    const fileURL = URL.createObjectURL(blob);

    // Libérer l'ancienne URL pour éviter les fuites de mémoire
    if (this.selectedPdfUrl) {
      URL.revokeObjectURL(this.selectedPdfUrl as string);
    }

    // Mettre à jour l'URL du PDF affiché
    this.selectedPdfUrl = fileURL;
    this.pdfViewerKey = new Date().getTime(); // Force le rafraîchissement du composant PDF Viewer
    this.cdr.detectChanges();
  };

  fileReader.readAsArrayBuffer(file);
}



handlePdfLoaded(pdf: any) {
  console.log('PDF prêt:', pdf);
  // Traitements supplémentaires si nécessaire
}

handlePdfError(error: any) {
  console.error('Erreur PDF:', error);
  this.messageService.add({
    severity: 'error',
    summary: 'Erreur',
    detail: 'Le PDF n\'a pas pu être affiché',
    life: 5000
  });
}


// Dans votre composant TypeScript
isFormationEnAttente(formationId: number): boolean {
  return this.formationsNonValidees.some(formation => formation.id === formationId);
}
clearPdf() {
  if (this.selectedPdfUrl) {
    const oldUrl = this.sanitizer.sanitize(4, this.selectedPdfUrl);
    if (oldUrl) {
      URL.revokeObjectURL(oldUrl); // Libérer l'URL Blob de l'ancien PDF
    }
  }
  this.selectedPdfUrl = null; // Réinitialiser l'URL du PDF
  this.selectedFile = null; // Réinitialiser le fichier sélectionné
  this.cdr.detectChanges(); // Forcer la mise à jour de la vue
}
// Gestion des événements du PDF Viewer
onPdfLoadComplete(pdf: any) {
  console.log('PDF chargé avec succès', pdf);
}

onPdfLoadError(error: any) {
  console.error('Erreur de chargement PDF:', error);
  this.messageService.add({
    severity: 'error',
    summary: 'Erreur',
    detail: 'Impossible de charger le document PDF'
  });
}

// Nettoyage des ressources
ngOnDestroy() {
  // Libérer toutes les URLs Blob
  if (this.selectedPdfUrl) {
    const oldUrl = this.sanitizer.sanitize(SecurityContext.RESOURCE_URL, this.selectedPdfUrl);
    if (oldUrl) URL.revokeObjectURL(oldUrl);
  }
  
  Object.values(this.pdfUrls).forEach(url => {
    const unsafeUrl = this.sanitizer.sanitize(SecurityContext.RESOURCE_URL, url);
    if (unsafeUrl) {
      URL.revokeObjectURL(unsafeUrl);
    }
  });
}


  // Gérer le début du glisser
  onDragStart(event: DragEvent) {
    // Vérifier si l'objet DataTransfer est disponible et qu'un matricule est sélectionné
    if (event.dataTransfer && this.selectedEmploye?.matricule) {
      event.dataTransfer.setData('text/plain', this.selectedEmploye.matricule);
      event.dataTransfer.effectAllowed = 'move'; // Autoriser le déplacement
      console.log(`Début du drag : matricule ${this.selectedEmploye.matricule}`);
    }
  }
  
  onDragOver(event: DragEvent) {
    event.preventDefault(); // Permettre le dépôt
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move'; // Indiquer que le déplacement est autorisé
    }
    console.log('Élément en cours de déplacement.');
  }
  
  onDrop(event: DragEvent) {
    event.preventDefault(); // Empêcher le comportement par défaut
    
    // Obtenir la position de l'élément où le texte doit être affiché
    const pdfContainer = event.currentTarget as HTMLElement;
    const rect = pdfContainer.getBoundingClientRect();
  
    // Calculer les coordonnées de dépôt
    const dropX = event.clientX - rect.left;
    const dropY = event.clientY - rect.top;
  
    // Récupérer l'échelle actuelle du PDF
    const pdfViewer = pdfContainer.querySelector('pdf-viewer') as any;
    const pdfScale = pdfViewer?.pdfViewer?.getPageView(0)?.viewport?.scale || 1;
  
    // Convertir les coordonnées en coordonnées PDF
    const pdfX = dropX / pdfScale;
    const pdfY = (rect.height - dropY) / pdfScale; // Inverser Y pour s'adapter au PDF
  
    // Mettre à jour la position sélectionnée
    this.selectedPosition = { x: pdfX, y: pdfY };
  
    // Ajouter le texte directement au PDF
    this.addMatriculeToPdf(); 
  }
  
  
  
  
  
  async addMatriculeToPdf() {
    // Vérification des conditions nécessaires
    if (!this.selectedPdfUrl || !this.selectedEmploye?.matricule || !this.selectedPosition) {
      console.error('Les conditions pour modifier le PDF ne sont pas remplies.');
      return;
    }
  
    try {
      // Extraire une URL sécurisée sous forme de chaîne de caractères
      const sanitizedUrl = this.sanitizer.sanitize(4, this.selectedPdfUrl);
  
      // Vérification que l'URL sécurisée est valide
      if (!sanitizedUrl) {
        console.error('URL sécurisée invalide.');
        return;
      }
  
      // Charger le contenu PDF existant
      const existingPdfBytes = await fetch(sanitizedUrl).then((res) => {
        if (!res.ok) {
          throw new Error(`Échec du chargement du PDF : ${res.status} ${res.statusText}`);
        }
        return res.arrayBuffer();
      });
  
      // Charger et manipuler le PDF
      const pdfDoc = await PDFDocument.load(existingPdfBytes);
  
      // Obtenir la première page du PDF
      const firstPage = pdfDoc.getPages()[0];
      const { x, y } = this.selectedPosition;
  
      // Ajouter le matricule directement au PDF de façon permanente
      firstPage.drawText(`Matricule: ${this.selectedEmploye.matricule}`, {
        x: x, // Position X
        y: y, // Position Y
        size: 12, // Taille du texte
        font: await pdfDoc.embedFont(StandardFonts.Helvetica), // Police standard
        color: rgb(0, 0, 0), // Texte en noir
        lineHeight: 14 // Espacement des lignes
      });
  
      // Sauvegarder le PDF modifié
      const pdfBytes = await pdfDoc.save();
  
      // Convertir les octets en un blob pour le navigateur
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  
      // Libérer l'ancienne URL pour éviter des fuites mémoire
      if (this.selectedPdfUrl instanceof Object) {
        const oldUrl = this.sanitizer.sanitize(4, this.selectedPdfUrl);
        if (oldUrl) {
          URL.revokeObjectURL(oldUrl);
        }
      }
  
      // Générer une nouvelle URL pour le PDF modifié
      const modifiedPdfUrl = URL.createObjectURL(blob);
      this.selectedPdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(modifiedPdfUrl);
  
      // Notifier Angular pour détecter les changements
      this.cdr.detectChanges();
  
      console.log('PDF modifié avec succès et matricule ajouté.');
    } catch (error) {
      console.error('Erreur lors de la modification du PDF :', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Une erreur est survenue lors de la modification du PDF.',
      });
    }
  }
  
  reloadPdfViewer() {
    const pdfContainer = document.querySelector('pdf-viewer') as HTMLElement;
    if (pdfContainer) {
      pdfContainer.innerHTML = ''; // Supprimer l'ancien contenu
      setTimeout(() => {
        const newViewer = document.createElement('pdf-viewer');
        newViewer.setAttribute('src', this.selectedPdfUrl as string);
        pdfContainer.appendChild(newViewer); // Ajouter le nouveau PDF
      }, 0);
    }
  }
  
  
  // Ajouter la signature au PDF
  async addSignatureToPdf() {
    if (!this.selectedPdfUrl || !this.signatureImage) {
      return;
    }
  
    // Charger le PDF
    const url = this.sanitizer.sanitize(4, this.selectedPdfUrl);
    if (!url) {
      console.error('URL invalide.');
      return;
    }
  
    const existingPdfBytes = await fetch(url).then((res) => res.arrayBuffer());
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
  
    // Convertir l'image de la signature en PNG
    const pngImage = await pdfDoc.embedPng(this.signatureImage);
  
    // Ajouter la signature à la première page
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];
    const { width, height } = firstPage.getSize();
  
    firstPage.drawImage(pngImage, {
      x: this.signaturePosition.x,
      y: height - this.signaturePosition.y - 50, // Ajuster la position Y
      width: 100,
      height: 50,
    });
  
    // Enregistrer le PDF modifié
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    this.selectedPdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(blob));
  }
 // Ajoutez cette propriété pour stocker les fichiers PDF temporaires
tempPdfFiles: { [key: string]: File } = {};

// Méthode pour ouvrir le sélecteur de fichier pour un employé spécifique
openFileInput(employe: any) {
  const fileInput = document.querySelector('#fileInput') as HTMLInputElement;
  if (fileInput) {
    fileInput.click();
  }
}

// Méthode pour gérer la sélection de fichier pour un employé spécifique
async onEmployeeFileSelected(event: any, employe: any) {
  const file = event.target.files[0];
  if (!file) return;

  if (file.type !== 'application/pdf') {
    this.messageService.add({
      severity: 'error',
      summary: 'Format invalide',
      detail: 'Veuillez sélectionner un fichier PDF.',
    });
    return;
  }

  // Stocker le fichier temporairement
  this.tempPdfFiles[employe.id] = file;

  // Générer une URL pour prévisualisation
  const fileReader = new FileReader();
  fileReader.onload = () => {
    const blob = new Blob([fileReader.result as ArrayBuffer], { type: 'application/pdf' });
    const fileURL = URL.createObjectURL(blob);

    // Mettre à jour l'URL de prévisualisation pour cet employé
    this.pdfUrls[employe.id] = this.sanitizer.bypassSecurityTrustResourceUrl(fileURL);

    // Définir l'URL sélectionnée et l'employé courant
    this.selectedPdfUrl = fileURL;
    this.selectedEmploye = employe;

    // Fermer le dialogue des participants et ouvrir le dialogue de visualisation
    this.displayDialog = false;
    this.pdfDialogVisible = true;

    this.cdr.detectChanges();
  };

  fileReader.readAsArrayBuffer(file);
}



// Méthode pour enregistrer le PDF d'un employé
saveEmployeePdf(formationId: number, employeId: number) {
  const pdfFile = this.tempPdfFiles[employeId];
  if (!pdfFile) {
    this.messageService.add({
      severity: 'warn',
      summary: 'Aucun changement',
      detail: 'Aucun nouveau fichier PDF sélectionné.',
    });
    return;
  }

  this.formationservice.modifierDocumentEmployeFormation(formationId, employeId, pdfFile).subscribe({
    next: (response) => {
      this.messageService.add({
        severity: 'success',
        summary: 'Succès',
        detail: 'Le document a été enregistré avec succès!',
        life: 3000
      });
      
      // Nettoyer le fichier temporaire
      delete this.tempPdfFiles[employeId];
      
      // Vérifier si tous les employés sont évalués
      this.checkAllEmployeesEvaluated(this.selectedFormation);
    },
    error: (err) => {
      console.error('Erreur lors de l\'enregistrement:', err);
      this.messageService.add({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Une erreur est survenue lors de l\'enregistrement.',
        life: 5000
      });
    }
  });
}
}