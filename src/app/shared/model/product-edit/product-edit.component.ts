import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ProductEditModel, ProductPhotoModel, CategoryModel } from '../../models/product-edit.model';

interface Product {
  id: string;
  images: string[];
  description: string;
  collection: string;
  items: string;
  brand: string;
  condition: string;
  serialNo: string;
  age: number;
  colour: string;
  size: string;
  city: string;
  price: number;
  discount: number;
  status: 'available' | 'sold' | 'draft';
  sellerId: string;
}

@Component({
  selector: 'app-product-edit',
  imports: [ReactiveFormsModule, NgIf, NgFor],
  templateUrl: './product-edit.component.html',
  styleUrl: './product-edit.component.scss',
  standalone: true
})
export class ProductEditComponent implements OnInit {

  @Input() productId: string | null = null;

  editProductForm: FormGroup;
  isEditMode = false;
  isLoading = false;
  sellerId: string | null = null;
  private apiUrl = 'http://localhost:8080/api';

  photos: ProductPhotoModel[] = [
    { label: '+ Add Photo', preview: '' },
    { label: 'Cover Photo', preview: '' },
    { label: 'Front View', preview: '' },
    { label: 'Right Side', preview: '' },
    { label: 'Left Side', preview: '' },
    { label: 'Rear', preview: '' }
  ];

  mainCategory: string[] = ['women', 'men', 'kids', 'sports'];

  subCategoryList: CategoryModel[] = [
    { maincat: 'women', category: ['Top', 'Dresses', 'Skirts', 'Jeans', 'Sweaters', 'Coat & Jackets', 'Shoes', 'Bags', 'Hats', 'Jewelry', 'Watches', 'Sunglasses', 'Other'] },
    { maincat: 'men', category: ['T shirt', 'Shirt', 'Hoodies', 'Jeans', 'Sweaters', 'Coat & Jackets', 'Shoes', 'Bags', 'Hats', 'Jewelry', 'Watches', 'Sunglasses', 'Other'] },
    { maincat: 'kids', category: ['Top', 'Dresses', 'Bottoms', 'Jeans', 'Sweaters', 'Coat & Jackets', 'Shoes', 'Bags', 'Hats', 'Jewelry', 'Watches', 'Sunglasses', 'Other'] },
    { maincat: 'sports', category: ['Jerseys', 'Shorts', 'Tracksuits', 'Jeans', 'Sweaters', 'Coat & Jackets', 'Shoes', 'Bags', 'Hats', 'Watches', 'Sunglasses', 'Other'] }
  ];

  subcat: string[] = [];

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.editProductForm = this.fb.group({
      description: [''],
      collection: ['', Validators.required],
      items: ['', Validators.required],
      condition: ['', Validators.required],
      brand: ['', Validators.required],
      serialNo: [''],
      colour: ['', Validators.required],
      occasion: [''],
      size: ['', Validators.required],
      age: [''],
      city: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(0)]],
      discount: ['', [Validators.min(0), Validators.max(100)]]
    });
  }

  ngOnInit(): void {
    this.getSellerId();
    this.route.paramMap.subscribe(params => {
      this.productId = params.get('id');
      if (this.productId) {
        this.isEditMode = true;
        this.loadProduct(this.productId);
      }
    });

    // Listen to collection changes
    this.editProductForm.get('collection')?.valueChanges.subscribe((value) => {
      this.updateSubcategories(value);
    });
  }

  /**
   * Get seller ID from cookies
   */
  private getSellerId(): void {
    const cookies = document.cookie.split(';').reduce((acc: any, cookie) => {
      const [key, value] = cookie.split('=').map(c => c.trim());
      acc[key] = value;
      return acc;
    }, {});
    this.sellerId = cookies['loginStatus'];

    if (!this.sellerId || this.sellerId === 'undefined') {
      window.alert('Please login to edit products');
      this.router.navigate(['/sign-in']);
    }
  }

  /**
   * Load product data if in edit mode
   */
  private loadProduct(productId: string): void {
    this.isLoading = true;
    this.http.get<any>(`${this.apiUrl}/GetProduct/ById/${productId}`).subscribe({
      next: (product: any) => {
        this.populateForm(product);
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Failed to load product', error);
        window.alert('Failed to load product details');
        this.isLoading = false;
        this.router.navigate(['/seller']);
      }
    });
  }

  /**
   * Populate form with product data
   */
  private populateForm(product: any): void {
    this.editProductForm.patchValue({
      description: product.description,
      collection: product.collection,
      items: product.items,
      condition: product.condition,
      brand: product.brand,
      serialNo: product.serialNo,
      colour: product.colour,
      occasion: product.occasion,
      size: product.size,
      age: product.age,
      city: product.city,
      price: product.price,
      discount: product.discount
    });

    // Load images
    if (product.images && product.images.length > 0) {
      product.images.forEach((image: string, index: number) => {
        if (index < this.photos.length) {
          this.photos[index].preview = image;
        }
      });
    }

    // Update subcategories based on collection
    this.updateSubcategories(product.collection);
  }

  /**
   * Update subcategories based on selected main category
   */
  updateSubcategories(selectedValue: string): void {
    const foundCategory = this.subCategoryList.find(sub => sub.maincat === selectedValue);
    this.subcat = foundCategory ? foundCategory.category : [];
    this.editProductForm.get('items')?.setValue('');
  }

  /**
   * Handle category selection change
   */
  onSelectCategory(event: Event): void {
    const selectedValue = (event.target as HTMLSelectElement).value;
    this.updateSubcategories(selectedValue);
  }

  /**
   * Handle file change for photos
   */
  onFileChange(event: any, index: number): void {
    if (event.target.files && event.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.photos[index].preview = e.target.result;
        this.photos[index].file = event.target.files[0];
      };
      reader.readAsDataURL(event.target.files[0]);
    }
  }

  /**
   * Select photo for upload
   */
  selectPhoto(index: number): void {
    const fileInput = document.querySelectorAll<HTMLInputElement>('.photo-box input')[index];
    if (fileInput) fileInput.click();
  }

  /**
   * Handle form cancellation
   */
  onCancel(): void {
    if (confirm('Are you sure you want to discard changes?')) {
      this.router.navigate(['/seller']);
    }
  }

  /**
   * Handle form submission
   */
  onSubmit(): void {
    if (this.editProductForm.valid && this.sellerId) {
      this.isLoading = true;

      const payload: ProductEditModel = {
        id: this.productId || undefined,
        images: this.photos.map(p => p.preview).filter(Boolean),
        description: this.editProductForm.get('description')?.value,
        collection: this.editProductForm.get('collection')?.value,
        items: this.editProductForm.get('items')?.value,
        brand: this.editProductForm.get('brand')?.value,
        condition: this.editProductForm.get('condition')?.value,
        serialNo: this.editProductForm.get('serialNo')?.value,
        colour: this.editProductForm.get('colour')?.value,
        size: this.editProductForm.get('size')?.value,
        age: this.editProductForm.get('age')?.value ? Number(this.editProductForm.get('age')?.value) : undefined,
        city: this.editProductForm.get('city')?.value,
        price: Number(this.editProductForm.get('price')?.value),
        discount: this.editProductForm.get('discount')?.value ? Number(this.editProductForm.get('discount')?.value) : 0,
        status: 'available',
        sellerId: this.sellerId,
        occasion: this.editProductForm.get('occasion')?.value
      };

      this.http.put<Product>(`${this.apiUrl}/dashboard/UpdateProduct`, payload).subscribe({
        next: (response: any) => this.handleResponse(response),
        error: (error: any) => this.handleError(error)
      });
    } else {
      window.alert('Please fill all required fields');
    }
  }

  private handleResponse(response: any): void {
    window.alert(response);
    this.isLoading = false;
    this.router.navigate(['/product-listings']);
  }

  private handleError(error: any): void {
    console.error('Failed to save product', error);
    window.alert('Failed to save product. Please try again.');
    this.isLoading = false;
  }

  get f() {
    return this.editProductForm.controls;
  }
}
