import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterLink,RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CartService } from '../../services/cart.service';
import { CookieHandlerService } from '../../services/cookie.handle';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-nav-bar',
  imports: [RouterLink, CommonModule,RouterLinkActive],
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss']
})
export class NavBarComponent implements OnInit, OnDestroy {

  // track which bottom nav item is active; use route names or simple keys
  active: string = '';
  cartItemCount: number = 0;
  private cartSubscription?: Subscription;

  constructor(
    private cartService: CartService,
    private cookieService: CookieHandlerService
  ) {}

  ngOnInit(): void {
    // Subscribe to cart updates to show item count
    this.cartSubscription = this.cartService.cart$.subscribe(cart => {
      this.cartItemCount = cart.totalItems || 0;
    });

    // Initialize cart for logged in user
    const userId = this.cookieService.getCookie('loginStatus');
    if (userId && userId !== 'undefined') {
      this.cartService.initializeCart(userId);
    }
  }

  ngOnDestroy(): void {
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
  }

  setActive(key: string) {
   this.active = key;
  }

}
