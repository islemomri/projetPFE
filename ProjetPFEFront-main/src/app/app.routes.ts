import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { SignupComponent } from './auth/signup/signup.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { AddEmployeComponent } from './employe/add-employe/add-employe.component';
import { EmployeListComponent } from './employe/getall-employeexistant/getall-employeexistant.component';


export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component : SignupComponent},
  { path: 'sidebar', component : SidebarComponent},
  { path: 'add-employe', component: AddEmployeComponent },
  { path: 'list-employe-existants', component: EmployeListComponent }

];
