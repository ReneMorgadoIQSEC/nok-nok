import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppShellLayout } from './app-shell-layout';

describe('AppShellLayout', () => {
  let component: AppShellLayout;
  let fixture: ComponentFixture<AppShellLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppShellLayout]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppShellLayout);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
