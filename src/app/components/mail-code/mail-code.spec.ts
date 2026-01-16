import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MailCode } from './mail-code';

describe('MailCode', () => {
  let component: MailCode;
  let fixture: ComponentFixture<MailCode>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MailCode]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MailCode);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
