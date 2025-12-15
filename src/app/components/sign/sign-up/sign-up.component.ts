import { NgIf, NgFor, CommonModule } from '@angular/common';
import { HttpClient, provideHttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { EmailValidator, FormBuilder, FormGroup, ReactiveFormsModule, Validators, } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NgStyle } from "@angular/common";

@Component({
  selector: 'app-sign-up',
  imports: [RouterLink, ReactiveFormsModule, NgStyle, NgIf, NgFor, CommonModule],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.scss',
  standalone: true
})
export class SignUpComponent {

  registerForm: FormGroup;
  
  // Role options for radio buttons
  roleOptions = [
    { value: 'customer', label: 'Customer', description: 'Browse and purchase products' },
    { value: 'seller', label: 'Seller', description: 'Sell your products on SnapCart' },
    { value: 'admin', label: 'Administrator', description: 'Manage the platform (Admin access required)' }
  ];


  constructor(private fb: FormBuilder , private http: HttpClient) {
      
    this.registerForm = this.fb.group({
  name: ['', Validators.required],
  address: ['', [Validators.required, Validators.pattern('^[A-Za-z0-9\\s,.-/]{5,100}$')]],
  contact: ['', [Validators.required, Validators.pattern('^[0-8]{3}[0-9]{7}$')]],
  email: ['', [Validators.required, Validators.email]],
  username: ['', [Validators.required, Validators.pattern('^[A-Za-z0-9]+$')]],
  password: ['', [Validators.minLength(8), Validators.required, Validators.pattern('^[A-Za-z0-9@#!]{8,32}$')]],
  role: ['seller', Validators.required] // Default to customer role
});
  }

  get f(){
    return this.registerForm.controls
  }

 
  



  onSubmit() {
    if (this.registerForm.valid) {
      const register = this.registerForm.value;
      console.log('=== USER REGISTRATION ===');
      console.log('Registration data:', register);
      console.log('Selected role:', register.role);
      console.log('User type:', this.getRoleLabel(register.role));
      
      this.http.post('http://localhost:8080/api/CreateUser', register).subscribe({
        next: (response) => {
          console.log('Registration successful:', response);
          window.alert(`${this.getRoleLabel(register.role)} account created successfully! You can now login.`);
          this.registerForm.reset();
          // Reset to default role
          this.registerForm.patchValue({ role: 'customer' });
        },
        error: (error) => {
          console.log("Registration failed:", error);
          window.alert(error.error || 'Registration failed. Please try again.'); 
        }
      });
    } else {
      console.log('Form validation errors:');
      Object.keys(this.registerForm.controls).forEach(key => {
        const control = this.registerForm.get(key);
        if (control && control.errors) {
          console.log(`${key}:`, control.errors);
        }
      });
      window.alert('Please fill all required fields correctly');
    }
  }

  // Helper method to get role label
  getRoleLabel(roleValue: string): string {
    const role = this.roleOptions.find(r => r.value === roleValue);
    return role ? role.label : roleValue;
  }

}
