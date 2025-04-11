import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TooltipModule } from 'primeng/tooltip';
import { CarouselModule } from 'primeng/carousel';
import { DropdownModule } from 'primeng/dropdown';
import { TagModule } from 'primeng/tag';
import { AvatarModule } from 'primeng/avatar';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ApiResponse } from '../../formation/model/ApiResponse';
import { FormationService } from '../../formation/service/formation.service';
import { DialogService } from 'primeng/dynamicdialog';
import { FormsModule } from '@angular/forms';

type Severity = "success" | "info" | "warn" | "danger" | "secondary" | "contrast" | undefined;
type Size = "large" | "normal" | "xlarge" | undefined;

@Component({
  selector: 'app-formation-employe',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    DialogModule,
    TooltipModule,
    CarouselModule,
    DropdownModule,
    TagModule,
    AvatarModule,
    ProgressSpinnerModule,
    FormsModule, 
  ],
  templateUrl: './formation-employe.component.html',
  styleUrls: ['./formation-employe.component.css'],
  providers: [DialogService]
})
export class FormationEmployeComponent implements OnInit {
  @Input() employeId!: number;
  @Output() formationsUpdated = new EventEmitter<void>();
  selectedFormation: ApiResponse | null = null;
displayDetailsDialog: boolean = false;
  formations: ApiResponse[] = [];
  loading = false;
  error: string | null = null;
  activeFilter: string | null = null;
  filterByStat(statType: string): void {
    // Si on clique sur le même filtre, on le désactive
    if (this.activeFilter === statType) {
      this.activeFilter = null;
      return;
    }
    
    this.activeFilter = statType;
  }
  // Configuration des statistiques
  stats = [
    { type: 'total', value: 0, label: 'Total formations', icon: 'pi pi-book' },
    { type: 'success', value: 0, label: 'Réussies', icon: 'pi pi-check-circle' },
    { type: 'warning', value: 0, label: 'En cours', icon: 'pi pi-clock' },
    { type: 'danger', value: 0, label: 'Échecs', icon: 'pi pi-times-circle' },
    { type: 'info', value: 0, label: 'En attente', icon: 'pi pi-hourglass' }
  ];
    // Cela semble être la bonne propriété selon l'erreur.
  employe: any; 
  responsiveOptions = [
    {
      breakpoint: '1024px',
      numVisible: 3,
      numScroll: 1
    },
    {
      breakpoint: '768px',
      numVisible: 2,
      numScroll: 1
    },
    {
      breakpoint: '560px',
      numVisible: 1,
      numScroll: 1
    }
  ];

  statusFilters = [
    { label: 'Tous les statuts', value: null },
    { label: 'Réussies', value: 'success' },
    { label: 'Échecs', value: 'failed' },
    { label: 'En cours', value: 'in-progress' },
    { label: 'En attente', value: 'pending' }
  ];

  typeFilters = [
    { label: 'Tous les types', value: null },
    { label: 'Interne', value: 'INTERNE' },
    { label: 'Externe', value: 'EXTERNE' },
    { label: 'Certification', value: 'CERTIFICATION' }
  ];

  chartOptions = {
    cutout: '70%',
    plugins: {
      legend: {
        display: false
      }
    }
  };

  constructor(
    private formationService: FormationService,
    private dialogService: DialogService
  ) {}

  ngOnInit(): void {
    if (this.employeId) {
      this.loadFormations();
    }
  }

  private mapApiDataToResponse(data: any[]): ApiResponse[] {
    return data.map(item => ({
      id: item.id,
      employe: item.employe,
      formation: {
        ...item.formation,
        responsableEvaluation: item.formation.responsableEvaluation || item.formation.responsableEvaluation,
        responsableEvaluationExterne: item.formation.responsableEvaluationExterne,
        sousTypeFormation: item.formation.sousTypeFormation,
        typeFormation: item.formation.typeFormation,
        dateDebutPrevue: item.formation.dateDebutPrevue,
        dateFinPrevue: item.formation.dateFinPrevue,
        titrePoste: item.formation.titrePoste,
        valide: item.formation.valide,
        commentaire: item.formation.commentaire,
        commente: item.formation.commente,
        dateDebutReelle: item.formation.dateDebutReelle,
        dateFinReelle: item.formation.dateFinReelle,
        emailEnvoye: item.formation.emailEnvoye,
        fichierPdfUrl: item.formation.fichierPdfUrl,
        employes: item.formation.employes,
        id: item.formation.id,
        titre: item.formation.titre,
        description: item.formation.description
        
      },
      document: item.document,
      evalue: item.evalue,
      resultat: item.resultat,
      res: item.res,
      capabilite: item.capabilite ?? false
    }));
  }

  loadFormations(): void {
    this.loading = true;
    this.error = null;
    
    this.formationService.getFormationsWithDetailsByEmploye(this.employeId).subscribe({
      next: (data) => {
        console.log('Données reçues:', data);
        this.formations = this.mapApiDataToResponse(data);
        this.prepareAnalysisData();
      
        const reussiCapabiliteTrue = this.formations.filter(f => 
          f.resultat === 'REUSSI' && f.capabilite === true
        );
        
        const reussiCapabiliteFalse = this.formations.filter(f => 
          f.resultat === 'REUSSI' && f.capabilite === false
        );
        
        console.log('Formations réussies avec capabilité true:', reussiCapabiliteTrue);
        console.log('Formations réussies avec capabilité false:', reussiCapabiliteFalse);
        this.updateStats();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des formations';
        this.loading = false;
        console.error(err);
      }
    });
  }


  refreshFormations(): void {
    this.loadFormations();
    this.formationsUpdated.emit();
  }

  // Méthodes pour les statistiques
  getTotalCount(): number {
    return this.formations.length;
  }

  searchTerm: string = '';

// Correction de la propriété filteredFormations
get filteredFormations(): ApiResponse[] {
  let filtered = this.formations;
  
  // Filtre par recherche textuelle
  if (this.searchTerm) {
    const term = this.searchTerm.toLowerCase();
    filtered = filtered.filter(f => 
      f.formation.titre.toLowerCase().includes(term) ||
      (f.formation.description && f.formation.description.toLowerCase().includes(term)) ||
      (f.formation.typeFormation && f.formation.typeFormation.toLowerCase().includes(term)) ||
      (f.resultat && f.resultat.toLowerCase().includes(term)) ||
      (f.formation.responsableEvaluation?.nom && f.formation.responsableEvaluation.nom.toLowerCase().includes(term)) ||
      (f.formation.responsableEvaluation?.prenom && f.formation.responsableEvaluation.prenom.toLowerCase().includes(term))
    );
  }

  // Filtre par statut si un filtre est actif
  if (this.activeFilter) {
    switch (this.activeFilter) {
      case 'total':
        // Pas de filtre supplémentaire, on garde tout
        break;
      case 'success':
        filtered = filtered.filter(f => f.resultat && f.resultat.toUpperCase() === 'REUSSI');
        break;
      case 'danger':
        filtered = filtered.filter(f => f.resultat && f.resultat.toUpperCase() === 'ECHEC');
        break;
      case 'warning':
        filtered = filtered.filter(f => {
          const debut = new Date(f.formation.dateDebutPrevue);
          const fin = new Date(f.formation.dateFinPrevue);
          const now = new Date();
          return debut <= now && fin >= now;
        });
        break;
      case 'info':
        filtered = filtered.filter(f => !f.resultat);
        break;
    }
  }
  
  return filtered;
}






getInProgressCount(): number {
  return this.formations.filter(f => {
    const debut = new Date(f.formation.dateDebutPrevue);
    const fin = new Date(f.formation.dateFinPrevue);
    const now = new Date();
    return debut <= now && fin >= now;
  }).length;
}

  getStatusText(formation: ApiResponse): string {
    if (!formation.resultat) return 'En attente de validation';
    
    switch(formation.resultat.toUpperCase()) {
      case 'REUSSI':
        return 'Réussi';
      case 'ECHEC':
        return 'Échec';
      case 'PROGRAMME_COMPLEMENTAIRE':
        return 'Programme complémentaire';
      default:
        return 'En attente de validation';
    }
  }

  getStatusClass(formation: ApiResponse): string {
    if (!formation.resultat) return 'status-pending';
    
    switch(formation.resultat.toUpperCase()) {
      case 'REUSSI':
        return 'status-success';
      case 'ECHEC':
        return 'status-danger';
      case 'PROGRAMME COMPLEMENTAIRE':
        return 'status-warning';
      default:
        return 'status-pending';
    }
  }
  getStatusIcon(item: ApiResponse): string {
    if (!item.resultat) return 'pi pi-hourglass';
    
    switch(item.resultat.toUpperCase()) {
      case 'REUSSI':
        return 'pi pi-check-circle';
      case 'ECHEC':
        return 'pi pi-times-circle';
      case 'PROGRAMME COMPLEMENTAIRE':
        return 'pi pi-exclamation-circle';
      default:
        return 'pi pi-hourglass';
    }
  }
  getStatusSeverity(item: ApiResponse): Severity {
    if (!item.resultat) return 'info';
    
    switch(item.resultat.toUpperCase()) {
      case 'REUSSI':
        return 'success';
      case 'ECHEC':
        return 'danger';
      case 'PROGRAMME COMPLEMENTAIRE':
        return 'warn';
      default:
        return 'info';
    }
  }

  getResultText(item: ApiResponse): string {
    if (item.res === true) return 'Réussi';
    if (item.res === false) {
      return item.resultat?.includes('COMPLEMENT') 
        ? 'Programme complémentaire' 
        : 'Échec';
    }
    return 'Non évalué';
  }

  showProgressChart(item: ApiResponse): boolean {
    return item.formation.valide === true && item.res !== null;
  }

  getProgressChartData(item: ApiResponse): any {
    return {
      labels: ['Progression'],
      datasets: [
        {
          data: [100],
          backgroundColor: [this.getStatusColor(item)],
          borderWidth: 0
        }
      ]
    };
  }
  getStatusIconColor(item: ApiResponse): string {
    if (!item.resultat) return '#F59E0B'; // Orange pour en attente
    
    switch(item.resultat.toUpperCase()) {
      case 'REUSSI':
        return '#10B981'; // Vert
      case 'ECHEC':
        return '#EF4444'; // Rouge
      case 'PROGRAMME COMPLEMENTAIRE':
        return '#F59E0B'; // Orange
      default:
        return '#F59E0B';
    }
  }
  

  getStatusColor(item: ApiResponse): string {
    if (item.formation.valide && item.res === true) return '#10B981';
    if (item.formation.valide && item.res === false) return '#EF4444';
    return '#3B82F6';
  }

  canEvaluate(item: ApiResponse): boolean {
    return item.formation.valide === true && item.res === null;
  }

  openEvaluationDialog(item: ApiResponse): void {
    console.log('Évaluation de la formation:', item);
    // Implémentez la logique d'évaluation ici
  }

  showDetails(item: ApiResponse): void {
    this.selectedFormation = item;
    this.displayDetailsDialog = true;
  }

  openDocument(documentUrl: string): void {
    if (documentUrl) {
      window.open(documentUrl, '_blank');
    }
  }

  getAvatarLabel(item: ApiResponse): string {
    const prenom = item.employe.prenom || '';
    const nom = item.employe.nom || '';
    return (prenom.charAt(0) + nom.charAt(0)).toUpperCase();
  }








  getSuccessCount(): number {
    return this.formations.filter(f => 
      f.resultat && f.resultat.toUpperCase() === 'REUSSI'
    ).length;
  }
  
  getFailedCount(): number {
    return this.formations.filter(f => 
      f.resultat && f.resultat.toUpperCase() === 'ECHEC'
    ).length;
  }
  
  getComplementaryProgramCount(): number {
    return this.formations.filter(f => 
      f.resultat && f.resultat.toUpperCase() === 'PROGRAMME_COMPLEMENTAIRE'
    ).length;
  }
  
  get successfulTrainings(): ApiResponse[] {
    return this.formations.filter(f =>
      f.resultat?.toUpperCase() === 'REUSSI'
    );
  }
  
  get potentialPositions(): ApiResponse[] {
    return this.successfulTrainings.filter(f => f.capabilite === true);
  }
  
  get exercisedPositions(): ApiResponse[] {
    return this.successfulTrainings.filter(f => f.capabilite === false);
  }
  




  getPendingValidationCount(): number {
    return this.formations.filter(f => 
      !f.resultat
    ).length;
  }
  private updateStats(): void {
    this.stats = [
      { type: 'total', value: this.getTotalCount(), label: 'Total formations', icon: 'pi pi-book' },
      { type: 'success', value: this.getSuccessCount(), label: 'Réussies', icon: 'pi pi-check-circle' },
      { type: 'danger', value: this.getFailedCount(), label: 'Échecs', icon: 'pi pi-times-circle' },
      { type: 'warning', value: this.getInProgressCount(), label: 'En cours', icon: 'pi pi-clock' },
      { type: 'info', value: this.getPendingValidationCount(), label: 'En attente', icon: 'pi pi-hourglass' }
    ];
  }


  getProgressValue(item: ApiResponse): number {
    if (!item.formation.valide) return 0;
    if (item.res === true) return 100;
    if (item.res === false) return 30; // Échec partiel
    return 70; // En cours
  }
  getStatusColorClass(item: ApiResponse): any {
    return {
      'background-color': this.getStatusColor(item),
      'color': 'white',
      'display': 'flex',
      'align-items': 'center',
      'justify-content': 'center',
      'width': '40px',
      'height': '40px',
      'border-radius': '50%',
      'font-size': '1.2rem'
    };
  }
  
  getProgressLabel(item: ApiResponse): string {
    const progress = this.getProgressValue(item);
    return `${progress}% complété`;
  }
  
  getFormationSkills(item: ApiResponse): string[] {
    // Implémentez cette méthode selon vos besoins
    return ['Compétence 1', 'Compétence 2'];
  }


  // Dans votre composant principal
displayAnalysisDialog: boolean = false;
analysisData: any;

showAnalysisDialog(): void {
  if (!this.formations || this.formations.length === 0) {
    this.loadFormations(); // Recharge les données si nécessaire
    return;
  }
  
  this.prepareAnalysisData();
  
  if (!this.analysisData) {
    console.error('Les données d analyse n ont pas pu être préparées');
    return;
  }
  
  this.displayAnalysisDialog = true;
  console.log('Dialogue devrait être visible maintenant', this.displayAnalysisDialog);
}

prepareAnalysisData(): void {
  const capableFormations = this.formations.filter(f => 
    f.resultat === 'REUSSI' && f.capabilite === true
  );
  
  const experiencedFormations = this.formations.filter(f => 
    f.resultat === 'REUSSI' && f.capabilite === false
  );

  this.analysisData = {
    capableFormations,
    experiencedFormations,
   
  };
}

getInitials(nom: string, prenom: string): string {
  return (prenom?.charAt(0) || '') + (nom?.charAt(0) || '');
}

exportAnalysisToPdf(): void {
  // Implémentez l'export PDF ici
  console.log('Export PDF functionality to be implemented');
}
  
  


}