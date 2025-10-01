import { Component } from '@angular/core';
import { NavBarComponent } from "../nav-bar/nav-bar.component";
import { CarousalComponent } from "../carousal/carousal.component";
import { ProductShowcaseComponent } from "../product showcase/product-showcase.component";
import { AdCardComponent } from "../ad-card/ad-card.component";

@Component({
  selector: 'app-home',
  imports: [ CarousalComponent, ProductShowcaseComponent, AdCardComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

}
