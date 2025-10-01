import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductShowcaseComponent } from './product-showcase.component';

describe('ProductComponent', () => {
  let component: ProductShowcaseComponent;
  let fixture: ComponentFixture<ProductShowcaseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductShowcaseComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductShowcaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
