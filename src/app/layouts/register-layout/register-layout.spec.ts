import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterLayout } from './register-layout';

describe('RegisterLayout', () => {
  let component: RegisterLayout;
  let fixture: ComponentFixture<RegisterLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterLayout]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegisterLayout);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
