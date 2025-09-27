import { NgFor } from '@angular/common';
import { Component } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-product',
  imports: [NgFor],
  templateUrl: './product.component.html',
  styleUrl: './product.component.scss'
})
export class ProductComponent {

  products= [
  {imgUrl: '/images/men.jpg', title: 'T-shirt', price: 2999, rating: 4.3, reviews: '1,23,456'},
  {imgUrl: '/images/men.jpg', title: 'T-shirt', price: 2999, rating: 4.3, reviews: '1,23,456'},
  {imgUrl: '/images/men.jpg', title: 'T-shrit', price: 2999, rating: 4.3, reviews: '1,23,456'},
  ]

}
