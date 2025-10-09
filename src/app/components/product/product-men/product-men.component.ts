import { Component } from '@angular/core';
import { ProductShowcaseComponent } from "../../product showcase/product-showcase.component";
import { NgFor } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';



export interface product{
  id:String;
  images:string[];
  description:string;
  collection:string;
  items:string;
  condition:string;
  brand:string;
  serialNo:string;
  colour:string;
  size:string;
  age:number;
  city:string;
  price:number;
  discount:number;
}


@Component({
  selector: 'app-product-men',
  imports: [ NgFor],
  templateUrl: './product-men.component.html',
  styleUrl: './product-men.component.scss'
})

export class ProductMenComponent {

  constructor(private http:HttpClient) { 
    this.http=http;
  }

Category_Name: String="Mens Shirts";
search_result: String="10K";
Popular_brands: String[] = ['Polo', 'H&M', 'Zara', 'Levis'];


 products= [
  {imgUrl: '/images/men.jpg', title: 'T-shirt', price: 2999, rating: 4.3, reviews: '1,23,456'},
  {imgUrl: '/images/men.jpg', title: 'T-shirt', price: 2999, rating: 4.3, reviews: '1,23,456'},
  {imgUrl: '/images/men.jpg', title: 'T-shrit', price: 2999, rating: 4.3, reviews: '1,23,456'},
  {imgUrl: '/images/men.jpg', title: 'T-shrit', price: 2999, rating: 4.3, reviews: '1,23,456'},
]

//get items from backend
getProducts(): Observable<product[]> {
  
  return this.http.get<product[]>('http://localHost:8080/api/GetProducts/ByItems/men');


}
}