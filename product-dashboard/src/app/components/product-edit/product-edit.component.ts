import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-product-edit',
  templateUrl: './product-edit.component.html',
  styleUrls: ['./product-edit.component.scss'],
  standalone: true,
})
export class ProductEditComponent implements OnInit {
  product: any; 

  constructor(private productService: ProductService) {}

  ngOnInit() {
    this.loadProduct();
  }

  loadProduct() {
    // Logic to load the product details for editing
  }

  updateProduct() {
    // Logic to update the product details
  }

  markAsSold() {
    // Logic to mark the product as sold
  }

  deleteProduct() {
    // Logic to delete the product
  }
}