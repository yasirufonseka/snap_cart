import { Routes } from '@angular/router';
import { NavBarComponent } from './components/nav-bar/nav-bar.component';
import { CarousalComponent } from './components/carousal/carousal.component';
import { AdCardComponent } from './components/ad-card/ad-card.component';

export const routes: Routes = [
    { path: "navbar", component: NavBarComponent },
    { path: "carousal", component: CarousalComponent }
];
