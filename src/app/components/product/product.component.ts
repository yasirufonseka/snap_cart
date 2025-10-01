import { Component } from '@angular/core';
import { ProductShowcaseComponent } from "../product showcase/product-showcase.component";

@Component({
  selector: 'app-product',
  imports: [ProductShowcaseComponent],
  templateUrl: './product.component.html',
  styleUrl: './product.component.scss'
})
export class ProductComponent {
Category_Name: String="Mens Shirts";
search_result: String="10K";
Popular_brands: String[] = ['Polo', 'H&M', 'Zara', 'Levis'];

}
