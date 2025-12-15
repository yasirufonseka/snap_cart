import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductSportsComponent } from './product-sports.component';

describe('ProductSportsComponent', () => {
  let component: ProductSportsComponent;
  let fixture: ComponentFixture<ProductSportsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductSportsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductSportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
