import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Employe } from '../model/employe';
import { Observable } from 'rxjs';
import { EmployeExistant } from '../model/EmployeExistant';
const headers = new HttpHeaders({
  'Authorization': 'Bearer ' + localStorage.getItem('jwt')
});
@Injectable({
  providedIn: 'root'
})
export class EmoloyeService {

  private apiUrl = 'http://localhost:9090/api/employes';
  private apiUrll = 'http://localhost:9092/api/employes'; 
  constructor(private http: HttpClient) {}

  addEmploye(employe: Employe): Observable<Employe> {
    return this.http.post<Employe>(this.apiUrl, employe, { headers });
  }

  getAllEmployes(): Observable<EmployeExistant[]> {
    return this.http.get<EmployeExistant[]>(`${this.apiUrll}/all`);
  }

}
