import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuoteCalculationComponent } from './quote-calculation.component';

describe('QuoteCalculationComponent', () => {
  let component: QuoteCalculationComponent;
  let fixture: ComponentFixture<QuoteCalculationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuoteCalculationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuoteCalculationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
