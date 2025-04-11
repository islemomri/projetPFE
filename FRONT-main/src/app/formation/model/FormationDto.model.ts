import { Employe } from "../../employe/model/employe";
import { SousTypeFormation } from "./SousTypeFormation.model";
import { TypeFormation } from "./type-formation.model";

export interface FormationDto {
   id?:number
    titre: string;
    description: string;
    typeFormation: TypeFormation;
    sousTypeFormation: SousTypeFormation;
    dateDebutPrevue: string; // Utilisation de string pour les dates (format ISO 8601)
    dateFinPrevue: string;
    responsableEvaluationId?: number; // Optionnel
    responsableEvaluationExterne?: string; // Optionnel
    employeIds: number[];
    responsableEvaluation?: any;
    employes?: Employe[];
    fichierPdf?: File; // Ajout du champ fichierPdf (correspond à MultipartFile en Java)
    organisateurId?: number; // Ajout du champ organisateurId (optionnel)
    titrePoste?: string; // Ajout du champ titrePoste (optionnel)
    valide?:boolean;
    dateRappel?: string;
}