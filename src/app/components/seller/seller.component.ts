import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-seller',
  imports: [FormsModule, CommonModule],
  templateUrl: './seller.component.html',
  styleUrl: './seller.component.scss',
  standalone: true
})
export class SellerComponent {

   form = {
    description: '',
    category: '',
    condition: '',
    brand: '',
    serialNo: '',
    colour: '',
    size: '',
    age: null,
    city: '',
    price: null,
    discount: null
  };

  photos = [
    { label: '+ Add Photo', preview: '' },
    { label: 'Cover Photo', preview: '' },
    { label: 'Front View', preview: '' },
    { label: 'Right Side', preview: '' },
    { label: 'Left Side', preview: '' },
    { label: 'Rear', preview: '' }
  ];

  onFileChange(event: any, index: number) {
    if (event.target.files && event.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.photos[index].preview = e.target.result;
      };
      reader.readAsDataURL(event.target.files[0]);
    }
  }

  selectPhoto(index: number) {
    // Simulate click on the hidden input inside the photo-box
    const fileInput = document.querySelectorAll<HTMLInputElement>('.photo-box input')[index];
    if (fileInput) fileInput.click();
  }

  onCancel() {
    console.log('Form canceled');
  }

  onSubmit() {
    console.log('Form submitted:', this.form);
    console.log('Uploaded photos:', this.photos);
  }
}

