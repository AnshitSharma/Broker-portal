import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { InsuranceCodeComponent } from './insurance-quote.component';

describe('InsuranceCodeComponent', () => {
  let component: InsuranceCodeComponent;
  let fixture: ComponentFixture<InsuranceCodeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations:[InsuranceCodeComponent],
      imports: [FormsModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InsuranceCodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
