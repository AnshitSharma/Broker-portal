import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-final-page',
  standalone: true,
  templateUrl: './final-page.component.html',
  styleUrls: ['./final-page.component.css'],
  imports: [CommonModule, FormsModule]
})
export class FinalPageComponent implements OnInit {
  // Form fields
  isNonProfit: string = '';
  businessDescription: string = '';
  additionalServices: string = '';
  businessYear: string = '';
  executiveOfficers: number | null = null;
  employeeCount: number | null = null;
  
  // Form state
  showErrors = false;
  currentStep = 3;
  
  constructor(private router: Router) {}
  
  ngOnInit(): void {
    // Initialization logic if needed
  }
  
  /**
   * Validates the form before proceeding
   */
  validateForm(): boolean {
    // Required fields validation
    if (!this.businessDescription || !this.businessYear) {
      return false;
    }
    
    // Business year validation (must be a valid year)
    const yearPattern = /^\d{4}$/;
    if (!yearPattern.test(this.businessYear)) {
      return false;
    }
    
    // Validate year is not in the future
    const currentYear = new Date().getFullYear();
    const year = parseInt(this.businessYear);
    if (year > currentYear) {
      return false;
    }
    
    return true;
  }
  
  /**
   * Navigate to the next step
   */
  nextStep(): void {
    this.showErrors = true;
    
    if (this.validateForm()) {
      // Store form data if needed (could use a service)
      
      // Navigate to next page
      this.router.navigate(['/coverage-details']);
    } else {
      // Scroll to the first error
      const firstError = document.querySelector('.error');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }
  
  /**
   * Navigate back to the previous step
   */
  previousStep(): void {
    this.router.navigate(['/next-page']);
  }
}