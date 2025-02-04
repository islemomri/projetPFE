import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from './auth/service/auth.service';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from './sidebar/sidebar.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet,CommonModule,SidebarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent  {
  title = 'RhAssad';
  constructor(private authService: AuthService, private router: Router) {}
  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  isExcludedRoute(): boolean {
    // Vérifie si l'utilisateur est sur les pages de login ou signup
    return this.router.url === '/login' || this.router.url === '/signup';
  }
}
