import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductKidsComponent } from './product-kids.component';

describe('ProductKidsComponent', () => {
  let component: ProductKidsComponent;
  let fixture: ComponentFixture<ProductKidsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductKidsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductKidsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
