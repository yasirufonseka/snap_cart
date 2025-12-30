import { Routes } from '@angular/router';
import { NavBarComponent } from './components/nav-bar/nav-bar.component';
import { CarousalComponent } from './components/carousal/carousal.component';

import { SignInComponent } from './components/sign/sign-in/sign-in.component';
import { SignUpComponent } from './components/sign/sign-up/sign-up.component';
import { HomeComponent } from './components/home/home.component';
import { ProductComponent } from './components/product/product.component';
import { SellerComponent } from './components/seller/seller.component';
import { ProductMenComponent } from './components/product/product-men/product-men.component';
import { ProductWomenComponent } from './components/product/product-women/product-women.component';
import { ProductSportsComponent } from './components/product/product-sports/product-sports.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ProductListingsComponent } from './dashboard/product-listings/product-listings.component';
import { DashboardHomeComponent } from './dashboard/dashboard-home/dashboard-home.component';
import { ProductEditComponent } from './shared/model/product-edit/product-edit.component';
import { ChatWidgetComponent } from './components/chat-widget/chat-widget.component';
import { CartComponent } from './components/cart/cart.component';
import { CheckoutComponent } from './components/checkout/checkout.component';
import { AiChatbotComponent } from './components/ai-chatbot/ai-chatbot.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { ProductUploadComponent } from './components/product-upload/product-upload.component';
import { ProductDetailComponent } from './components/product-detail/product-detail.component';


export const routes: Routes = [
  
  {path:'home' , component:HomeComponent,pathMatch:'full' , children:[
    { path: "navbar", component: NavBarComponent },
    { path: "carousal", component: CarousalComponent },
    
  ]},
    { path: "SignIn", component: SignInComponent },
    { path: "SignUp", component: SignUpComponent },
     { path: "product", loadComponent: () => import('./components/product/product.component').then(m => m.ProductComponent) },
     { path: "seller", loadComponent: () => import('./components/seller/seller.component').then(m => m.SellerComponent) },
      { path: "productMen", loadComponent: () => import('./components/product/product-men/product-men.component').then(m => m.ProductMenComponent) },
       { path: "productWomen", loadComponent: () => import('./components/product/product-women/product-women.component').then(m => m.ProductWomenComponent) },
       { path: "productSports", loadComponent: () => import('./components/product/product-sports/product-sports.component').then(m => m.ProductSportsComponent) },
       { path: "productBrands", loadComponent: () => import('./components/product/product.component').then(m => m.ProductComponent) },
      { path: "product-edit/:id", loadComponent: () => import('./shared/model/product-edit/product-edit.component').then(m => m.ProductEditComponent) },
      { path: "product-edit", loadComponent: () => import('./shared/model/product-edit/product-edit.component').then(m => m.ProductEditComponent) },
      {path:"chat", component:ChatWidgetComponent},
      {path:"cart", component:CartComponent},
      {path:"checkout", component:CheckoutComponent},
      {path:"aibot", component:AiChatbotComponent},
      {path:"admin-dashboard", loadComponent: () => import('./admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent)},
      {path:"product-upload", loadComponent: () => import('./components/product-upload/product-upload.component').then(m => m.ProductUploadComponent)},
      {path:"aichatbot", component:AiChatbotComponent},
      {path:"product-detail/:id", loadComponent: () => import('./components/product-detail/product-detail.component').then(m => m.ProductDetailComponent)},

     {
       path: "dashboard",
       component: DashboardComponent,
       children: [
         { path: "dashboard-home", loadComponent: () => import('./dashboard/dashboard-home/dashboard-home.component').then((m) => m.DashboardHomeComponent) },
         { path: "product-listings", loadComponent: () => import('./dashboard/product-listings/product-listings.component').then((m) => m.ProductListingsComponent) },
      
         { path: "", redirectTo: "dashboard-home", pathMatch: "full" },
       ]
     },
   
    {path:'**' , redirectTo:'home'}
];
