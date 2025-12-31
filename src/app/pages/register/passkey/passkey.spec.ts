import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PasskeyComponent } from './passkey';

describe('PasskeyComponent', () => {
  let component: PasskeyComponent;
  let fixture: ComponentFixture<PasskeyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PasskeyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PasskeyComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
