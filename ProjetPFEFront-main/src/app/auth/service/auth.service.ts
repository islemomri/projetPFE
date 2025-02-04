import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, map } from 'rxjs';
import { OAuthService } from 'angular-oauth2-oidc';
import { authConfig } from '../../../auth.config';
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private baseUrl = "http://localhost:9090/";

  constructor(private http: HttpClient, private router:Router, private oauthService: OAuthService) {
    this.oauthService.configure(authConfig);
   }

  registerRH(SignupRequest: any): Observable<any> {
    SignupRequest.role= 'RH';
    const url = this.baseUrl + 'signup/rh';
    return this.http.post(url, SignupRequest);
  }

  registerDirecteur(SignupRequest: any): Observable<any> {
    SignupRequest.role= 'DIRECTEUR';
    const url = this.baseUrl + 'signup/directeur';
    return this.http.post(url, SignupRequest);
  }

  registerAdmin(SignupRequest: any): Observable<any> {
    SignupRequest.role= 'ADMIN';  
    const url = this.baseUrl + 'signup/admin';
    return this.http.post(url, SignupRequest);
  }

  login(loginRequest: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + "login", loginRequest).pipe(
      map(response => {
      
        if (response && response.jwt) {
          localStorage.setItem('jwt', response.jwt);
          localStorage.setItem('userId', response.utilisateurId);
          localStorage.setItem('userRole', response.role);
        }
        return response;
      })
    );
  }
  oauthLogin() {
    this.oauthService.loadDiscoveryDocumentAndTryLogin().then(() => {
      if (!this.oauthService.hasValidAccessToken()) {
        this.oauthService.initImplicitFlow(); 
      }
    });
  }

  saveTokenAndRole(token: string, roles: string): void {
    localStorage.setItem('token', token);
    localStorage.setItem('userRole', roles);

  }
  

  getUserRole(): string | null | boolean {
    if (!this.isLoggedIn()) {
      return false;
    } else {
      return localStorage.getItem('userRole');
    }
  }

  createAuthorizationHeader(): HttpHeaders {
    const jwtToken = localStorage.getItem('jwt');
    if (jwtToken) {
      console.log("JWT token found in local storage", jwtToken);
      return new HttpHeaders().set("Authorization", "Bearer " + jwtToken);
    } else {
      console.log("JWT token not found in local storage");
      return new HttpHeaders();
    }
  }

  isAuthenticated(): boolean {
    return localStorage.getItem('jwt') != null;
  }
  logout(): void {
    localStorage.removeItem('jwt');
    this.router.navigate(['/acceuil']);
  }
  isLoggedIn(): boolean {
    const isLoggedIn = !!localStorage.getItem('jwt');
    if (isLoggedIn) {

    }
    return isLoggedIn;
  }
  
}
