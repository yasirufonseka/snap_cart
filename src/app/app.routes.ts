import { Routes } from '@angular/router';
import { NavBarComponent } from './components/nav-bar/nav-bar.component';
import { CarousalComponent } from './components/carousal/carousal.component';
import { AdCardComponent } from './components/ad-card/ad-card.component';
import { SignInComponent } from './components/sign/sign-in/sign-in.component';
import { SignUpComponent } from './components/sign/sign-up/sign-up.component';
import { HomeComponent } from './components/home/home.component';
import { ProductComponent } from './components/product/product.component';
import { SellerComponent } from './components/seller/seller.component';

export const routes: Routes = [
  
  {path:'home' , component:HomeComponent,pathMatch:'full' , children:[
    { path: "navbar", component: NavBarComponent },
    { path: "carousal", component: CarousalComponent },
    
  ]},
    { path: "SignIn", component: SignInComponent },
    { path: "SignUp", component: SignUpComponent },
     { path: "product", component: ProductComponent },
     { path: "seller", component: SellerComponent },
    {path:'**' , redirectTo:'home'}
];
