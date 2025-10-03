import { NgIf } from '@angular/common';
import { HttpClient, provideHttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { EmailValidator, FormBuilder, FormGroup, ReactiveFormsModule, Validators, } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NgStyle } from "@angular/common";

@Component({
  selector: 'app-sign-up',
  imports: [RouterLink, ReactiveFormsModule, NgStyle],
   // providers: [provideHttpClient()],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.scss',
  standalone: true
})
export class SignUpComponent {



  registerForm: FormGroup;


  constructor(private fb: FormBuilder , private http: HttpClient) {
      
    this.registerForm = this.fb.group({
  name: ['', Validators.required],
  address: ['', [Validators.required, Validators.pattern('^[A-Za-z0-9\\s,.-/]{5,100}$')]],
  contact: ['', [Validators.required, Validators.pattern('^[0-8]{3}[0-9]{7}$')]],
  email: ['', [Validators.required, Validators.email]], // Fixed
  username: ['', [Validators.required, Validators.pattern('^[A-Za-z0-9]+$')]], // Fixed
  password: ['', [Validators.minLength(8), Validators.required, Validators.pattern('^[A-Za-z0-9@#!]{8,32}$')]],
 

});
  }

  get f(){
    return this.registerForm.controls
  }

 
  



  onSubmit() {
    
      if (this.registerForm.valid) {
    const register = this.registerForm.value;
    console.log('Sending data:', register); // Check what's being sent
    
    this.http.post('http://localhost:8080/api/CreateUser', register).subscribe({
      next: (response) => window.alert( "User Created Successfully"),
      error: (error) => {
        console.log("failed", error);
        window.alert( error.error); 
      }
    });
    this.registerForm.reset()
  } else {
     window.alert('Form is invalid');
    window.alert(this.registerForm.errors);
  }
  }

}
