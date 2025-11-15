import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CartService, Cart, CartItem } from '../../services/cart.service';
import { CookieHandlerService } from '../../services/cookie.handle';
import { CheckoutService } from '../../services/checkout.service';

declare var Stripe: any;

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, RouterModule, ReactiveFormsModule],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss'
})
export class CheckoutComponent implements OnInit {
  
  cart: Cart = {
    userId: '',
    items: [],
    totalAmount: 0,
    totalItems: 0
  };
  
  checkoutForm: FormGroup;
  loading = false;
  processing = false;
  userId: string | null = null;
  
  // Stripe
  stripe: any;
  elements: any;
  cardElement: any;
  
  // Order calculation
  subtotal = 0;
  tax = 0;
  shipping = 0;
  total = 0;

  constructor(
    private cartService: CartService,
    private cookieService: CookieHandlerService,
    private checkoutService: CheckoutService,
    private formBuilder: FormBuilder,
    private router: Router
  ) {
    this.checkoutForm = this.formBuilder.group({
      // Shipping address
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      addressLine1: ['', [Validators.required, Validators.minLength(5)]],
      addressLine2: [''],
      city: ['', [Validators.required]],
      state: ['', [Validators.required]],
      zipCode: ['', [Validators.required, Validators.pattern(/^\\d{5}(-\\d{4})?$/)]],
      country: ['United States', [Validators.required]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^[\\+]?[1-9][\\d]{0,15}$/)]],
      
      // Payment
      paymentMethod: ['stripe', [Validators.required]]
    });
  }

  ngOnInit(): void {
    console.log('=== CHECKOUT PAGE LOADED ===');
    
    // Get user ID from cookies
    this.userId = this.cookieService.getCookie('loginStatus') || null;
    
    if (!this.userId || this.userId === 'undefined') {
      console.log('User not logged in, redirecting to login');
      this.router.navigate(['/SignIn']);
      return;
    }
    
    this.loadCart();
    this.initializeStripe();
  }

  loadCart(): void {
    if (!this.userId) return;
    
    this.loading = true;
    console.log('Loading cart for checkout...');
    
    this.cartService.getCart(this.userId).subscribe({
      next: (cart) => {
        this.cart = cart;
        this.calculateTotals();
        this.loading = false;
        console.log('Cart loaded for checkout:', cart);
        
        if (!cart.items || cart.items.length === 0) {
          console.log('Cart is empty, redirecting to cart page');
          this.router.navigate(['/cart']);
        }
      },
      error: (error) => {
        console.error('Error loading cart:', error);
        this.loading = false;
        this.router.navigate(['/cart']);
      }
    });
  }

  calculateTotals(): void {
    this.subtotal = this.cart.totalAmount || 0;
    this.tax = this.subtotal * 0.085; // 8.5% tax
    this.shipping = this.subtotal > 50 ? 0 : 9.99; // Free shipping over $50
    this.total = this.subtotal + this.tax + this.shipping;
  }

  async initializeStripe(): Promise<void> {
    try {
      // Initialize Stripe (use your publishable key)
      this.stripe = Stripe('pk_test_your_stripe_publishable_key'); // Replace with your actual key
      
      // Create Elements instance
      this.elements = this.stripe.elements();
      
      // Create card element
      this.cardElement = this.elements.create('card', {
        style: {
          base: {
            fontSize: '16px',
            color: '#424770',
            '::placeholder': {
              color: '#aab7c4',
            },
          },
        },
      });
      
      // Mount card element
      setTimeout(() => {
        const cardContainer = document.getElementById('card-element');
        if (cardContainer) {
          this.cardElement.mount('#card-element');
        }
      }, 100);
      
      console.log('Stripe initialized successfully');
    } catch (error) {
      console.error('Error initializing Stripe:', error);
    }
  }

  async processCheckout(): Promise<void> {
    if (!this.checkoutForm.valid || !this.userId) {
      this.markFormGroupTouched(this.checkoutForm);
      return;
    }

    this.processing = true;
    console.log('=== PROCESSING CHECKOUT ===');

    try {
      // Prepare checkout request
      const checkoutRequest = {
        userId: this.userId,
        items: this.cart.items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          size: item.size,
          color: item.color
        })),
        shippingAddress: {
          fullName: this.checkoutForm.get('fullName')?.value,
          addressLine1: this.checkoutForm.get('addressLine1')?.value,
          addressLine2: this.checkoutForm.get('addressLine2')?.value,
          city: this.checkoutForm.get('city')?.value,
          state: this.checkoutForm.get('state')?.value,
          zipCode: this.checkoutForm.get('zipCode')?.value,
          country: this.checkoutForm.get('country')?.value,
          phoneNumber: this.checkoutForm.get('phoneNumber')?.value
        },
        paymentMethod: 'stripe'
      };

      console.log('Checkout request:', checkoutRequest);

      // Create order and get payment intent
      this.checkoutService.createOrder(checkoutRequest).subscribe({
        next: async (response) => {
          if (response.success && response.clientSecret) {
            console.log('Order created, processing payment...');
            await this.confirmPayment(response.clientSecret, response.orderId);
          } else {
            throw new Error(response.message || 'Order creation failed');
          }
        },
        error: (error) => {
          console.error('Checkout error:', error);
          alert('Checkout failed: ' + (error.error?.message || error.message || 'Unknown error'));
          this.processing = false;
        }
      });

    } catch (error) {
      console.error('Checkout error:', error);
      alert('Checkout failed: ' + error);
      this.processing = false;
    }
  }

  async confirmPayment(clientSecret: string, orderId: string): Promise<void> {
    try {
      const { error, paymentIntent } = await this.stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: this.cardElement,
          billing_details: {
            name: this.checkoutForm.get('fullName')?.value,
            address: {
              line1: this.checkoutForm.get('addressLine1')?.value,
              line2: this.checkoutForm.get('addressLine2')?.value,
              city: this.checkoutForm.get('city')?.value,
              state: this.checkoutForm.get('state')?.value,
              postal_code: this.checkoutForm.get('zipCode')?.value,
              country: 'US'
            }
          }
        }
      });

      if (error) {
        console.error('Payment failed:', error);
        alert('Payment failed: ' + error.message);
        this.processing = false;
      } else if (paymentIntent.status === 'succeeded') {
        console.log('Payment succeeded!');
        
        // Confirm payment on backend
        this.checkoutService.confirmPayment(paymentIntent.id).subscribe({
          next: (response) => {
            console.log('Payment confirmed on backend');
            this.processing = false;
            
            // Redirect to success page
            this.router.navigate(['/order-success', orderId]);
          },
          error: (error) => {
            console.error('Backend confirmation error:', error);
            // Payment succeeded but backend confirmation failed
            // Still redirect to success - the webhook should handle it
            this.processing = false;
            this.router.navigate(['/order-success', orderId]);
          }
        });
      }
    } catch (error) {
      console.error('Payment confirmation error:', error);
      alert('Payment processing failed: ' + error);
      this.processing = false;
    }
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.checkoutForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.checkoutForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return `${fieldName} is required`;
      if (field.errors['minlength']) return `${fieldName} is too short`;
      if (field.errors['pattern']) return `${fieldName} format is invalid`;
    }
    return '';
  }

  goBack(): void {
    this.router.navigate(['/cart']);
  }
}