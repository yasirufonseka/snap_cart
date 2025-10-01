import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CarousalComponent } from "./components/carousal/carousal.component";
import { NavBarComponent } from "./components/nav-bar/nav-bar.component";
import { AdCardComponent } from "./components/ad-card/ad-card.component";
import { ProductShowcaseComponent } from './components/product showcase/product-showcase.component';
import { HomeComponent } from "./components/home/home.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavBarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'snap_cart';
}
