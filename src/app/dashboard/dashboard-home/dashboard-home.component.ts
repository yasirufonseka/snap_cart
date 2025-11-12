import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-dashboard-home',
  imports: [],
  templateUrl: './dashboard-home.component.html',
  styleUrl: './dashboard-home.component.scss'
})
export class DashboardHomeComponent implements OnInit{
 stats = {
    totalSales: 24780,
    salesGrowth: 12.5,
    activeUsers: 1482,
    usersGrowth: 8.2,
    totalProducts: 384,
    productsGrowth: 23.1,
    totalReviews: 928,
    reviewsGrowth: -2.4
  };

  recentProducts = [
    {
      id: 1,
      name: 'Nike Air Max',
      image: 'assets/images/product1.jpg',
      category: 'Shoes',
      price: 129.99,
      status: 'in-stock'
    },
    {
      id: 2,
      name: "Levi's Jeans",
      image: 'assets/images/product2.jpg',
      category: 'Clothing',
      price: 89.99,
      status: 'low-stock'
    }
  ];

  constructor() {}

  ngOnInit(): void {
    // Here you would typically fetch real data from your backend
  }

  onSearch(event: any): void {
    // Implement search functionality
    console.log('Search:', event.target.value);
  }

  toggleNotifications(): void {
    // Implement notifications toggle
    console.log('Notifications clicked');
  }

  editProduct(productId: number): void {
    // Implement edit functionality
    console.log('Edit product:', productId);
  }

  deleteProduct(productId: number): void {
    // Implement delete functionality
    console.log('Delete product:', productId);
  }

}
