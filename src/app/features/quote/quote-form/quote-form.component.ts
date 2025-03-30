// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-quote-form',
//   imports: [],
//   templateUrl: './quote-form.component.html',
//   styleUrl: './quote-form.component.css'
// })
// export class QuoteFormComponent {

// }
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-quote-form',
  standalone: true, // Important for standalone components
  imports: [CommonModule, ReactiveFormsModule], // Import ReactiveFormsModule here
  templateUrl: './quote-form.component.html',
  styleUrls: ['./quote-form.component.scss']
})
export class QuoteFormComponent {
  quoteForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.quoteForm = this.fb.group({
      businessName: ['', Validators.required],
      businessType: ['', Validators.required],
      annualRevenue: ['', [Validators.required, Validators.min(10000)]],
      employees: ['', [Validators.required, Validators.min(1)]],
      coverageLimit: ['1000000', Validators.required],
      claimsHistory: ['no', Validators.required],
    });
  }

  submitQuote() {
    if (this.quoteForm.valid) {
      console.log("Quote Submitted", this.quoteForm.value);
    } else {
      console.log("Form is invalid");
    }
  }
}


