import { NgStyle } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from "@angular/router";
import { AuthService } from '../../../services/auth.service';




@Component({
  selector: 'app-sign-in',
  imports: [RouterLink, ReactiveFormsModule, NgStyle],
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss'],
  standalone: true
})
export class SignInComponent {


  // private document: @inject(DOCUMENT);
  // private platformId: Inject(PLATFORM_ID);

  loginResponce: String | undefined

  loginForm: FormGroup;

  constructor(
    private fb: FormBuilder, 
    private http: HttpClient,
    private authService: AuthService,
    private router: Router
  ) {

    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.pattern('^[A-Za-z0-9]+$')]],
      password: ['', [Validators.required, Validators.pattern('^[A-Za-z0-9@#!]{8,32}$')]]

    });
  // document.cookie = "loginStatus=loginResponce; path=/; expires=${new Date(Date.now() + 864e5).toUTCString()}; secure`";
  // console.log(document.cookie);

  }




  onSubmit() {
    if (this.loginForm.valid) {
      const login = this.loginForm.value;
      console.log('Sending data:', login); // Check what's being sent

      this.http.post<any>('http://localhost:8080/api/login', login, {
         headers: { 'Content-Type': 'application/json' }
      }).subscribe({
        next: (response) => {
          console.log('Login response:', response);
          // response expected to be { id: string, username: string } on success
          const userId = response?.id || response;
          const role = 'seller'; // project currently does not track roles; default to seller if appropriate
          this.authService.setUserData(userId, role);
          this.router.navigate(['/home']);
        },
        error: (error) => { console.log('failed login', error); window.alert('Login failed: ' + (error?.error?.error || error.statusText)); }
      });

    }
  }



get f(){
      return this.loginForm.controls
    }

 


  }

