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
    if (this.cookieHandler.isLoggedIn()) {
      const userId = this.cookieHandler.getUserId();
      const userRole = this.cookieHandler.getUserRole();
      
      console.log('User already logged in - ID:', userId, 'Role:', userRole);
      this.loginResponce = userId;
      
      // Redirect based on user role
      // if (userRole === 'admin') {
      //   window.location.href = '/admin-dashboard';
      // } else if (userRole === 'seller') {
      //   window.location.href = '/dashboard';
      // } else {
      //   window.location.href = '/home';
      // }
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

      this.http.post<any>('http://localhost:8080/api/login', login).subscribe({
        next: (response) => {
          console.log('✅ Login successful! Response:', response);
          
          // Handle new response structure
          if (response && typeof response === 'object') {
            // New structured response
            const userId = response.userId;
            const userRole = response.role || 'seller';
            const userEmail = response.email;
            const userName = response.name;
            
            console.log('User ID:', userId);
            console.log('User Role:', userRole);
            console.log('User Email:', userEmail);
            console.log('User Name:', userName);
            
            // Set cookies with user ID, role, email, and name
            this.cookieHandler.setLoginCookies(userId, userRole, userEmail, userName, 7);
            
            window.alert(`Login successful! Welcome ${userName || response.username}`);
            this.loginResponce = userId;
            
            // Redirect based on user role
            if (userRole === 'admin') {
              window.location.href = '/';
            } else if (userRole === 'seller') {
              window.location.href = '/';
            } else {
              window.location.href = '/';
            }
          } else {
            // Fallback for old response format (just user ID as string)
            const userId = typeof response === 'string' ? response : response.toString();
            this.cookieHandler.setLoginCookies(userId, 'customer', undefined, undefined, 7); // Default role
            
            window.alert('Login successful!');
            this.loginResponce = userId;
            window.location.href = '/home';
          }
          
          console.log('Cookies set:', document.cookie);
        },
        error: (error) => { 
          console.log('❌ Login failed!');
          console.log('Error details:', error);
          console.log('Status:', error.status);
          console.log('Error message:', error.error);
          window.alert('Login failed: ' + (error.error || 'Unknown error'));
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

