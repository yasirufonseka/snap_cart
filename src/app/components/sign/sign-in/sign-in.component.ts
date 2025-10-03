import { NgStyle } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-sign-in',
  imports: [RouterLink, ReactiveFormsModule, NgStyle],
  templateUrl: './sign-in.component.html',
  styleUrl: './sign-in.component.scss',
  standalone: true
})
export class SignInComponent {

  loginForm: FormGroup;

  constructor(private fb: FormBuilder, private http: HttpClient) {

    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.pattern('^[A-Za-z0-9]+$')]],
      password: ['', [Validators.required, Validators.pattern('^[A-Za-z0-9@#!]{8,32}$')]]


    });
  }
   onSubmit() {
    if(this.loginForm.valid){
      const login = this.loginForm.value;
      console.log('Sending data:', login); // Check what's being sent

     this.http.post('http://localhost:8080/api/login', login,{responseType:"text"}).subscribe({
        next:(response) => {window.alert("login successful"), console.log(response);},
        error:(error) =>{ console.log("faild login", error);}
      })
    }
    
}

get f(){
  return this.loginForm.controls
}
}