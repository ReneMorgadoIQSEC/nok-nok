import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InputCode } from './input-code';

describe('InputCode', () => {
  let component: InputCode;
  let fixture: ComponentFixture<InputCode>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputCode]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InputCode);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
