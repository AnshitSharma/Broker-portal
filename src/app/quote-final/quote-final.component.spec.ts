import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuoteFinalComponent } from './quote-final.component';

describe('QuoteFinalComponent', () => {
  let component: QuoteFinalComponent;
  let fixture: ComponentFixture<QuoteFinalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuoteFinalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuoteFinalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
