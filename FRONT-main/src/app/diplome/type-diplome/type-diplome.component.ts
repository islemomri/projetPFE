import { Component, OnInit, ViewChild } from '@angular/core';
import { MessageService } from 'primeng/api';
import { TypeDiplome } from '../model/type-diplome';
import { TypeDiplomeService } from '../service/type-diplome.service';
import { FormControl, FormGroup, FormsModule, NgForm, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { InputText, InputTextModule } from 'primeng/inputtext';
import { Table, TableModule } from 'primeng/table';
import { Toast, ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { BrowserModule } from '@angular/platform-browser';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';


@Component({
  selector: 'app-type-diplome',
  standalone:true,
  imports: [CommonModule,DialogModule,ButtonModule ,TableModule,ToastModule,ReactiveFormsModule,FormsModule, InputTextModule, ConfirmDialogModule],
  templateUrl: './type-diplome.component.html',
  styleUrl: './type-diplome.component.css',
  providers: [MessageService, ConfirmationService]
})
export class TypeDiplomeComponent implements OnInit {
  globalFilter: string = ''; 
  @ViewChild('dt') dt: Table | undefined; 
  typeDiplomes: any[] = [];
  selectedTypeDiplome: any | null = null;
  visibleAdd: boolean = false;
  visibleEdit: boolean = false;
  typeDiplomeForm: FormGroup;
  editTypeDiplomeForm: FormGroup;

  constructor(
    private typeDiplomeService: TypeDiplomeService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {
    this.typeDiplomeForm = new FormGroup({
      libelleTypeDiplome: new FormControl('', Validators.required),
    });

    this.editTypeDiplomeForm = new FormGroup({
      libelleTypeDiplome: new FormControl('', Validators.required),
    });
  }

  applyFilter(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.globalFilter = input.value;
    if (this.dt) {
      this.dt.filterGlobal(this.globalFilter, 'contains');
    }
  }
  ngOnInit(): void {
    this.getTypeDiplomes();
  }

  getTypeDiplomes(): void {
    this.typeDiplomeService.getAllTypeDiplomeNonArchives().subscribe(
      (data) => {
        this.typeDiplomes = data;
      },
      (err) => {
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Échec de chargement des types de diplômes' });
      }
    );
  }

  showAddDialog(): void {
    this.visibleAdd = true;
  }

  addTypeDiplome(): void {
    if (this.typeDiplomeForm.invalid) {
      console.log('Le libellé est requis');
      return;
    }

    const newTypeDiplome = this.typeDiplomeForm.value;

    this.typeDiplomeService.addTypeDiplome(newTypeDiplome).subscribe(() => {
      console.log('Type de diplôme ajouté avec succès');
      this.getTypeDiplomes();
      this.typeDiplomeForm.reset();
      this.visibleAdd = false; // Ferme la boîte de dialogue après l'ajout
    });
  }
  archiver(id: number): void {
    this.typeDiplomeService.archiverTypeDiplome(id).subscribe(
      (response) => {
        console.log('TypeDiplome archivé:', response);
        this.getTypeDiplomes();
      },
      (error) => {
        console.error('Erreur lors de l\'archivage:', error);
      }
    );
  }
  confirmArchiver(id: number): void {
    this.confirmationService.confirm({
      header: 'Confirmation d\'archivage',
      message: 'Êtes-vous sûr de vouloir archiver ce type de diplôme ? Cette action ne pourra pas être annulée.',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonProps: {
        label: 'Oui, archiver',
        icon: 'pi pi-check',
        severity: 'warn'
      },
      rejectButtonProps: {
        label: 'Annuler',
        icon: 'pi pi-times',
        severity: 'secondary'
      },
      accept: () => {
        this.archiver(id);
      },
      reject: () => {
        this.messageService.add({ severity: 'info', summary: 'Annulé', detail: 'Archivage annulé' });
      }
    });
  }
  

  showEditDialog(typeDiplome: any): void {
    this.selectedTypeDiplome = { ...typeDiplome };
    this.editTypeDiplomeForm.patchValue(this.selectedTypeDiplome);
    this.visibleEdit = true;
  }

  updateTypeDiplome(): void {
    if (!this.selectedTypeDiplome) return;

    const updatedTypeDiplome = this.editTypeDiplomeForm.value;
    this.typeDiplomeService.updateTypeDiplome(this.selectedTypeDiplome.id, updatedTypeDiplome).subscribe(() => {
      console.log('Type de diplôme mis à jour avec succès');
      this.getTypeDiplomes();
      this.visibleEdit = false;
    });
  }
}