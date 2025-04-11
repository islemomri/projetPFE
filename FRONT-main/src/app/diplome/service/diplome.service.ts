import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Diplome } from '../model/diplome';
import { DiplomeRequest } from '../model/diplome-request';
import { AuthService } from '../../auth/service/auth.service';
import { TypeDiplome } from '../model/type-diplome';

@Injectable({
  providedIn: 'root'
})
export class DiplomeService {
  private apiUrl = 'http://localhost:9090/diplomes';
  private typeDiplomeUrl = 'http://localhost:9090/typediplomes';
  headers : any;
  constructor(private http: HttpClient, private authservice: AuthService) {
    this.headers = this.authservice.createAuthorizationHeader();
  }
  
  getDiplomesByEmploye(employeId: number): Observable<Diplome[]> {
    return this.http.get<Diplome[]>(`${this.apiUrl}/employe/${employeId}`, { headers: this.headers });
  }

  addDiplomeEmploye(employeId: number, libelle: string, typeDiplomeId: number): Observable<Diplome> {
    return this.http.post<Diplome>(`${this.apiUrl}/add`, { employeId, libelle, typeDiplomeId }, { headers: this.headers });
  }  

  updateDiplomeEmploye(diplomeId: number, employeId: number, libelle: string, typeDiplomeId: number): Observable<Diplome> {
    return this.http.put<Diplome>(`${this.apiUrl}/update/${diplomeId}`, { employeId, libelle, typeDiplomeId }, { headers: this.headers });
  }
  

  deleteDiplomeEmploye(diplomeId: number, employeId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete/${diplomeId}/${employeId}`, { headers: this.headers });
  }

  deleteDiplome(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers: this.headers });
  }
  

  getTypeDiplomes(): Observable<TypeDiplome[]> {
    return this.http.get<TypeDiplome[]>(`${this.typeDiplomeUrl}/all`, { headers: this.headers });
  }
  getAllDiplomes(): Observable<Diplome[]> {
    return this.http.get<Diplome[]>(`${this.apiUrl}/all`, { headers: this.headers });
  }

  addDiplome(diplome: Diplome): Observable<Diplome> {
    return this.http.post<Diplome>(`${this.apiUrl}/${diplome.typeDiplome.id}`, diplome , { headers: this.headers });
  }

  getDiplomeById(id: number): Observable<Diplome> {
    return this.http.get<Diplome>(`${this.apiUrl}/${id}`, { headers: this.headers });
  }

  updateDiplome(id: number, diplomeRequest: DiplomeRequest): Observable<Diplome> {
    return this.http.put<Diplome>(`${this.apiUrl}/${id}`, diplomeRequest, { headers: this.headers });
  }
  
}
