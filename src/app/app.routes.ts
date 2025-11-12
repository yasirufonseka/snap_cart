import { Routes } from '@angular/router';
import { NavBarComponent } from './components/nav-bar/nav-bar.component';
import { CarousalComponent } from './components/carousal/carousal.component';
import { AdCardComponent } from './components/ad-card/ad-card.component';
import { SignInComponent } from './components/sign/sign-in/sign-in.component';
import { SignUpComponent } from './components/sign/sign-up/sign-up.component';
import { HomeComponent } from './components/home/home.component';
import { ProductComponent } from './components/product/product.component';
import { SellerComponent } from './components/seller/seller.component';
import { ProductMenComponent } from './components/product/product-men/product-men.component';
import { ProductWomenComponent } from './components/product/product-women/product-women.component';
import { ProductSportsComponent } from './components/product/product-sports/product-sports.component';
import { ProductKidsComponent } from './components/product/product-kids/product-kids.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ProductListingsComponent } from './dashboard/product-listings/product-listings.component';
import { DashboardHomeComponent } from './dashboard/dashboard-home/dashboard-home.component';

export const routes: Routes = [
  
  {path:'home' , component:HomeComponent,pathMatch:'full' , children:[
    { path: "navbar", component: NavBarComponent },
    { path: "carousal", component: CarousalComponent },
    
  ]},
    { path: "SignIn", component: SignInComponent },
    { path: "SignUp", component: SignUpComponent },
     { path: "product", component: ProductComponent },
     { path: "seller", component: SellerComponent },
     {
       path: "dashboard",
       component: DashboardComponent,
       children: [
         { path: "dashboard-home", component: DashboardHomeComponent },
         { path: "product-listings", component: ProductListingsComponent },
         { path: "", redirectTo: "dashboard-home", pathMatch: "full" },
       ]
     },
     { path: "productMen", component: ProductMenComponent },
       { path: "productWomen", component: ProductWomenComponent },
       { path: "productKids", component: ProductKidsComponent },
       { path: "productSports", component: ProductSportsComponent },
       { path: "productBrands", component: ProductComponent },
    {path:'**' , redirectTo:'home'}
];
