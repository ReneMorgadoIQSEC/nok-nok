import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AntispoofingComponent } from './antispoofing';

describe('AntispoofingComponent', () => {
  let component: AntispoofingComponent;
  let fixture: ComponentFixture<AntispoofingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AntispoofingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AntispoofingComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
