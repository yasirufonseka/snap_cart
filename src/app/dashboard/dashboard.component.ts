import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent  {
  activeTab: string = 'overview';

  constructor(private http: HttpClient, private router: Router) {
    // Set initial active tab based on current route
    this.setInitialActiveTab();
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  private setInitialActiveTab() {
    const currentUrl = this.router.url;
    if (currentUrl.includes('product-listings')) {
      this.activeTab = 'products';
    } else if (currentUrl.includes('dashboard-home')) {
      this.activeTab = 'overview';
    } else {
      this.activeTab = 'overview'; // default
    }
  }
}
