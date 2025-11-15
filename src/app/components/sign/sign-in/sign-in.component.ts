import { NgStyle } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from "@angular/router";
import { OnInit } from '@angular/core';
import { CookieHandlerService } from '../../../services/cookie.handle';




@Component({
  selector: 'app-sign-in',
  imports: [RouterLink, ReactiveFormsModule, NgStyle],
  templateUrl: './sign-in.component.html',
  styleUrl: './sign-in.component.scss',
  standalone: true
})
export class SignInComponent implements OnInit {


  // private document: @inject(DOCUMENT);
  // private platformId: Inject(PLATFORM_ID);

  loginResponce: String | undefined

  loginForm: FormGroup;

  constructor(private fb: FormBuilder, private http: HttpClient, private cookieHandler: CookieHandlerService) {

    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.pattern('^[A-Za-z0-9]+$')]],
      password: ['', [Validators.required, Validators.pattern('^[A-Za-z0-9@#!]{8,32}$')]]

    });
  // document.cookie = "loginStatus=loginResponce; path=/; expires=${new Date(Date.now() + 864e5).toUTCString()}; secure`";
  // console.log(document.cookie);

  }

  getCookie(name: string): string | undefined {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      const cookieValue = parts.pop();
      return cookieValue ? cookieValue.split(';').shift() : undefined;
    }
    return undefined;
  }

ngOnInit(): void {
    // Check if user is already logged in
    const loginStatus = this.getCookie('loginStatus');
    if (loginStatus) {
      this.loginResponce = loginStatus;
      // Optionally, redirect to home page if already logged in
      window.location.href = '/home';
    }
}


  onSubmit() {
    if (this.loginForm.valid) {
      const login = this.loginForm.value;
      console.log('=== FRONTEND LOGIN ATTEMPT ===');
      console.log('Form data:', login);
      console.log('Username:', login.username);
      console.log('Password:', login.password);
      console.log('Password length:', login.password ? login.password.length : 'null');

      this.http.post('http://localhost:8080/api/login', login, { responseType: "text" }).subscribe({
        next: (response) => {
          console.log('✅ Login successful! Response:', response);
          window.alert('Login successful!');
          this.loginResponce = response

          //set cookie with loginresponce value
          this.cookieHandler.setCookie('loginStatus', this.loginResponce ? this.loginResponce.toString() : '', 1);
          console.log('Cookie set:', document.cookie);
          //redirect to home page
          window.location.href = '/home';
        },
        error: (error) => { 
          console.log('❌ Login failed!');
          console.log('Error details:', error);
          console.log('Status:', error.status);
          console.log('Error message:', error.error);
          window.alert('Login failed: ' + error.error);
        }
      });
      
    } else {
      console.log('❌ Form is invalid!');
      console.log('Form errors:', this.loginForm.errors);
      console.log('Username errors:', this.loginForm.get('username')?.errors);
      console.log('Password errors:', this.loginForm.get('password')?.errors);
    }
  }



get f(){
      return this.loginForm.controls
    }

 


  }

