import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AskAntispoofingComponent } from './ask-antispoofing';

describe('AskAntispoofingComponent', () => {
  let component: AskAntispoofingComponent;
  let fixture: ComponentFixture<AskAntispoofingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AskAntispoofingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AskAntispoofingComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
