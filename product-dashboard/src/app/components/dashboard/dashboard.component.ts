import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  products: any[] = [];

  constructor(private productService: ProductService) {}

  ngOnInit() {
    this.initializeData();
  }

  initializeData() {
    this.productService.fetchProducts().subscribe((data) => {
      this.products = data;
    });
  }

  onUpdate(product: any) {
    this.productService.updateProduct(product).subscribe(() => {
      this.initializeData();
    });
  }

  onDelete(productId: string) {
    this.productService.deleteProduct(productId).subscribe(() => {
      this.initializeData();
    });
  }

  onMarkAsSold(productId: string) {
    this.productService.markAsSold(productId).subscribe(() => {
      this.initializeData();
    });
  }
}