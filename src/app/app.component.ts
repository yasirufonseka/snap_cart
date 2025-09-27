import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CarousalComponent } from "./components/carousal/carousal.component";
import { NavBarComponent } from "./components/nav-bar/nav-bar.component";
import { AdCardComponent } from "./components/ad-card/ad-card.component";
import { ProductComponent } from "./components/product/product.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CarousalComponent, NavBarComponent, AdCardComponent, ProductComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'snap_cart';
}
