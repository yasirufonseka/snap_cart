import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RouterLinkActive } from "../../../../node_modules/@angular/router/router_module.d-Bx9ArA6K";

@Component({
  selector: 'app-nav-bar',
  imports: [RouterLink],
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss']
})
export class NavBarComponent {

  // track which bottom nav item is active; use route names or simple keys
  active: string = '';

  setActive(key: string) {
   this.active = key;
  }

}
