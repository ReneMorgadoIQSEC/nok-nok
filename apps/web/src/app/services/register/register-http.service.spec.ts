import { TestBed } from '@angular/core/testing';

import { RegisterHttpService } from './register-http.service';

describe('RegisterHttpService', () => {
  let service: RegisterHttpService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RegisterHttpService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
