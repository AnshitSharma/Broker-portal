import { TestBed } from '@angular/core/testing';

import { PremiumCalculatorService } from './premium-calculator.service';

describe('PremiumCalculatorService', () => {
  let service: PremiumCalculatorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PremiumCalculatorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
