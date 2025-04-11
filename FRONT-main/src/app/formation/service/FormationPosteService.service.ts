import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FormationPosteService {
  private apiUrl = 'http://localhost:9090/api/formation-poste'; // URL de l'API Spring Boot

  constructor(private http: HttpClient) {}

  // Ajouter une paire
  addPair(formationId: number, posteId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}?formationId=${formationId}&posteId=${posteId}`, {});
  }

  // Récupérer toutes les paires
  getAllPairs(): Observable<any> {
    return this.http.get(`${this.apiUrl}`);
  }

  // Supprimer une paire par ID
  deletePair(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // Récupérer une paire par ID
  getPairById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }
  updatePosteForFormation(formationId: number, newPosteId: number): Observable<any> {
    const url = `${this.apiUrl}/formation/${formationId}`; // URL de l'API
    return this.http.put(url, newPosteId); // Envoyer newPosteId dans le corps de la requête
  }
  getPosteIdByFormationId(formationId: number): Observable<number> {
    const url = `${this.apiUrl}/poste-by-formation/${formationId}`;
    return this.http.get<number>(url);
  }
  
  
}