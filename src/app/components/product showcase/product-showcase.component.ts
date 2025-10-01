import { NgFor } from '@angular/common';
import { Component } from '@angular/core';


@Component({
  selector: 'app-product-showcase',
  imports: [NgFor],
  templateUrl: './product-showcase.component.html',
  styleUrl: './product-showcase.component.scss'
})
export class ProductShowcaseComponent {

  products= [
  {imgUrl: '/images/men.jpg', title: 'T-shirt', price: 2999, rating: 4.3, reviews: '1,23,456'},
  {imgUrl: '/images/men.jpg', title: 'T-shirt', price: 2999, rating: 4.3, reviews: '1,23,456'},
  {imgUrl: '/images/men.jpg', title: 'T-shrit', price: 2999, rating: 4.3, reviews: '1,23,456'},
  {imgUrl: '/images/men.jpg', title: 'T-shrit', price: 2999, rating: 4.3, reviews: '1,23,456'},
]


}

