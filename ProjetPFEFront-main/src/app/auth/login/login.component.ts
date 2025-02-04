import { Component, OnInit } from '@angular/core';
import { AuthService } from '../service/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { FloatLabelModule } from 'primeng/floatlabel';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { DatePickerModule } from 'primeng/datepicker';
import { MessageService } from 'primeng/api';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { IftaLabelModule } from 'primeng/iftalabel';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FloatLabelModule, ButtonModule, ToastModule, DatePickerModule, FormsModule, InputIconModule, IconFieldModule, IftaLabelModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  providers: [MessageService] 
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  date2: Date | undefined;
  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private router: Router,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  login() {
    if (this.loginForm.valid) {
      this.authService.login(this.loginForm.value).subscribe(
        response => {
          console.log('Login successful:', response);
          localStorage.setItem('jwt', response.jwt);
          localStorage.setItem('userId', response.utilisateurId);
          const userRole = localStorage.getItem('userRole');
          const userId = localStorage.getItem('userId');
          console.log('User ID:', userId);
          console.log('User role:', userRole);
          if (this.authService.getUserRole() === 'RH') {
            this.router.navigate(['/add-employe']);
            
          } else if (this.authService.getUserRole() === 'DIRECTEUR') {
            this.router.navigate(['/directeur']);
          } else {
            this.router.navigate(['/admin']);
          }
          this.messageService.add({ severity: 'success', summary: 'Succès',detail: 'Authentification réussie' });
        },
        error => {
          console.error('Login error:', error);
          this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Email ou mot de passe incorrect' });
        }
      );
    }
  }
}
