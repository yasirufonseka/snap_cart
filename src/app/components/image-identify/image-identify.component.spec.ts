import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageIdentifyComponent } from './image-identify.component';

describe('ImageIdentifyComponent', () => {
  let component: ImageIdentifyComponent;
  let fixture: ComponentFixture<ImageIdentifyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImageIdentifyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImageIdentifyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
