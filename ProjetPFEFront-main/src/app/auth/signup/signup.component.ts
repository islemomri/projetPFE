import { Component, OnInit } from '@angular/core';
import { AuthService } from '../service/auth.service';
import { FormBuilder, FormGroup, Validators , ReactiveFormsModule} from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { RouterModule } from '@angular/router';


@Component({
  selector: 'app-signup',
  standalone:true,
  imports: [ CommonModule,ReactiveFormsModule,CardModule, FloatLabelModule, InputTextModule, PasswordModule, RouterModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css'
})
export class SignupComponent implements OnInit{

  registerForm : any;

  registerRequest: any = {};
  password2='';
  errorMessage: string | undefined;

  constructor(private authService:AuthService, private route:Router, private fb:FormBuilder) {}
  ngOnInit(): void {
    this.registerForm= this.fb.group({
      nom: ['',[Validators.required]],
      prenom: ['',[Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['',[Validators.required,Validators.minLength(8)]],
      confirmPassword: ['',[Validators.required]],
    },{ validator: this.passwordMatchValidator });
  }

  passwordMatchValidator(formGroup:FormGroup){
    const password = formGroup.get('password')?.value;
    const confirmPassword = formGroup.get('confirmPassword')?.value;

    if (password != confirmPassword) {
      formGroup.get('confirmPassword')?.setErrors({ passwordMismatch: true });
    } else {
      formGroup.get('confirmPassword')?.setErrors(null);
    }
  }

  submitForm() {
    console.log(this.registerForm?.value);
    this.authService.registerRH(this.registerForm?.value).subscribe(
      (response) => {
        if (response.id != null) {
          alert("Hello " + response.nom);
        }
      }
    )
  }
  
  signupRDirecteur(){
    if (this.password2 !== this.registerRequest.password) {
      this.errorMessage = 'Passwords do not match';
      console.log(this.errorMessage);
      
    }
    else{
      console.log(this.registerRequest);
    this.authService.registerDirecteur(this.registerRequest).subscribe(
      response=>{
        console.log('Inscription Directeur:',response);
        this.route.navigate(['/login']);
       
      },
      error =>{
        console.error('Inscription failure:',error);
        
      }
    )
    }
  }

  signupAdmin(){
    if (this.password2 !== this.registerRequest.password) {
      this.errorMessage = 'Passwords do not match';
      console.log(this.errorMessage);
      
    }
    else{
      console.log(this.registerRequest);
    this.authService.registerAdmin(this.registerRequest).subscribe(
      response=>{
        console.log('Inscription RH:',response);
        this.route.navigate(['/login']);
       
      },
      error =>{
        console.error('Inscription failure:',error);
        
      }
    )
    }
  }

  oauthLogin() {
    this.authService.oauthLogin();
  }

  

}
