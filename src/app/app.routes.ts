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
     { path: "product", component: ProductComponent },
     { path: "seller", component: SellerComponent },
      { path: "productMen", component: ProductMenComponent },
       { path: "productWomen", component: ProductWomenComponent },
       { path: "productSports", component: ProductSportsComponent },
       { path: "productBrands", component: ProductComponent },
      { path: "product-edit/:id", component: ProductEditComponent },
      { path: "product-edit", component: ProductEditComponent },
      {path:"chat", component:ChatWidgetComponent},
      {path:"cart", component:CartComponent},
      {path:"checkout", component:CheckoutComponent},
      {path:"aibot", component:AiChatbotComponent},
      {path:"admin-dashboard", component:AdminDashboardComponent},
      {path:"product-upload", component:ProductUploadComponent},
      {path:"aichatbot", component:AiChatbotComponent},
      {path:"product-detail/:id", component:ProductDetailComponent},

     {
       path: "dashboard",
       component: DashboardComponent,
       children: [
         { path: "dashboard-home", component: DashboardHomeComponent },
         { path: "product-listings", component: ProductListingsComponent },
      
         { path: "", redirectTo: "dashboard-home", pathMatch: "full" },
       ]
     },
   
    {path:'**' , redirectTo:'home'}
];
