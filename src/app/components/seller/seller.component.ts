import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';
import { HttpClient } from '@angular/common/http';


@Component({
  selector: 'app-seller',
  imports: [ReactiveFormsModule,NgIf,NgFor],
  templateUrl: './seller.component.html',
  styleUrls: ['./seller.component.scss'],
  standalone: true
})
export class SellerComponent implements OnInit {
  addProduct: FormGroup;

  constructor(private fb:FormBuilder,private http:HttpClient ) { 
    this.addProduct = this.fb.group({
      images: [''],
      description: [''],
      collection: [''],
      items: [''],
      condition: [''],
      brand: [''],
      serialNo: [''],
      colour: [''],
      Occasion: [''],
      size: [''],
      age: [''],
      city: [''],
      price: [''],
      discount: ['']
    });
  }

  ngOnInit(): void {
    // Subscribe to productFor control changes so subcategories update automatically
    const ctrl = this.addProduct.get('productFor');
    if (ctrl) {
      ctrl.valueChanges.subscribe((val) => {
        this.updateSubcategories(val);
      });
    }
  }




  

  photos = [
    { label: '+ Add Photo', preview: '' },
    { label: 'Cover Photo', preview: '' },
    { label: 'Front View', preview: '' },
    { label: 'Right Side', preview: '' },
    { label: 'Left Side', preview: '' },
    { label: 'Rear', preview: '' }
  ];

 mainCategory: any[] = ['women', 'men', 'kids', 'sports'];

subCategory: any[] = [
  {maincat: 'women', category: ['Top', 'Dresses', 'Skirts', 'Jeans', 'Sweaters', 'Coat & Jackets', 'Shoes', 'Bags', 'Hats', 'Jewelry', 'Watches', 'Sunglasses', 'Other']},
  {maincat: 'men', category: ['T shirt', 'Shirt', 'Hoodies', 'Jeans', 'Sweaters', 'Coat & Jackets', 'Shoes', 'Bags', 'Hats', 'Jewelry', 'Watches', 'Sunglasses', 'Other']},
  {maincat: 'kids', category: ['Top', 'Dresses', 'Bottoms', 'Jeans', 'Sweaters', 'Coat & Jackets', 'Shoes', 'Bags', 'Hats', 'Jewelry', 'Watches', 'Sunglasses', 'Other']},
  {maincat: 'sports', category: ['Jerseys', 'Shorts', 'Tracksuits', 'Jeans', 'Sweaters', 'Coat & Jackets', 'Shoes', 'Bags', 'Hats', 'Watches', 'Sunglasses', 'Other']}
];

subcat: any[] = [];

onSelectCategory(event: Event) {
  const selectedValue = (event.target as HTMLSelectElement).value;
  this.updateSubcategories(selectedValue);
}

updateSubcategories(selectedValue: string | null) {
  const foundCategory = this.subCategory.find(sub => sub.maincat === selectedValue);
  if (foundCategory) {
    this.subcat = foundCategory.category;
  } else {
    this.subcat = [];
  }

  // Reset selected item when main category changes
  const itemsCtrl = this.addProduct.get('items');
  if (itemsCtrl) itemsCtrl.setValue('');

  console.log('Selected:', selectedValue);
  console.log('Subcategories:', this.subcat);
}
 



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
    if (this.addProduct.valid) {
      const productData = this.addProduct.value;
      console.log('Form value:', productData);
      //check cookies for loginStatus
      const cookies = document.cookie.split(';').reduce((acc: any, cookie) => {
        const [key, value] = cookie.split('=').map(c => c.trim());
        acc[key] = value;
        console.log('Cookie:', key, value);
        return acc;
      }, {});

      if(!cookies['loginStatus'] || cookies['loginStatus'] === 'undefined'){
        window.alert('Please login to add product');
        return;
      }else{
      // Here you can send productData to your backend server
      // along with the photos array if needed
      console.log('Uploaded photos:', this.photos);
      // Build payload matching backend ProductDto
      const payload: any = {
        id: "",
        images: this.photos.map(p => p.preview).filter(Boolean),
        description: productData.description || null,
        collection: productData.collection || null,
        items: productData.items || null,
        brand: productData.brand || null,
        condition: productData.condition || null,
        serialNo: productData.serialNo || null,
        age: productData.age ? Number(productData.age) : null,
        colour: productData.colour || null,
        size: productData.size || null,
        city: productData.city || null,
        price: productData.price ? Number(productData.price) : 0.0,
        discount: productData.discount ? Number(productData.discount) : 0.0
      };

      this.http.post('http://localhost:8080/api/SaveProduct', payload, { responseType: "text" }).subscribe({
        next: (response) => {
          console.log(response);},
        error: (error) => { console.log("Failed to add product", error); }

      });
    }
    }
  }
}

