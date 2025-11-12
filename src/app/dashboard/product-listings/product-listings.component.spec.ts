import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductListingsComponent } from './product-listings.component';

describe('ProductListingsComponent', () => {
  let component: ProductListingsComponent;
  let fixture: ComponentFixture<ProductListingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductListingsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductListingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
