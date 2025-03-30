import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-insurance-quote',
  standalone: true,
  templateUrl: './insurance-quote.component.html',
  styleUrls: ['./insurance-quote.component.css'],
  imports: [CommonModule, FormsModule]
})
export class InsuranceCodeComponent implements OnInit {
  currentStep = 1;
  showErrors = false;
  formValid = false;

  // Business status options
  businessStatus = [
    { label: "I'm in business and have insurance.", selected: false },
    { label: "I'm in business but don't have insurance yet.", selected: false },
    { label: "I'm starting a business and curious about insurance.", selected: false }
  ];

  // Business structure options
  businessStructures = [
    'Association', 
    'Corporation', 
    'Professional Corporation', 
    'S-Corporation', 
    'Individual / Sole Proprietor', 
    'Joint Venture', 
    'Limited Liability Corporation (LLC)', 
    'Limited Liability Partnership (LLP)', 
    'Partnership'
  ];

  // Form fields
  businessStructure = '';
  ownerFirstName = '';
  ownerLastName = '';
  businessName = '';
  
  // Location fields
  city = '';
  country = '';
  state = '';
  zipCode = '';
  address = '';
  
  // Sample data for dropdowns
  cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'];
  countries = ['United States', 'Canada', 'Mexico', 'United Kingdom', 'Australia','India'];
  states = ['California', 'New York', 'Texas', 'Florida', 'Illinois'];

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Initialize any required data
  }

  // Form validation methods
  validateBusinessStructure(): void {
    if (this.businessStructure) {
      // Clear any previous errors
      document.querySelector('.select-wrapper')?.classList.remove('error');
    }
  }


zipCodePattern = /^[0-9]{5}(-[0-9]{4})?$/;  // US format, adjust as needed
zipCodeRequired = true;
  validateZipCode(): void {
    // You can add specific logic here if needed
    // This will be called when the field loses focus
  }
  isValidZipCode(): boolean {
    if (!this.zipCode && !this.zipCodeRequired) {
      return true;  // Empty is OK if not required
    }
    
    if (!this.zipCode && this.zipCodeRequired) {
      return false;  // Empty is not OK if required
    }
    
    // Check if it matches the pattern (US zip code format by default)
    return this.zipCodePattern.test(this.zipCode);
  }

  validateName(type: 'first' | 'last'): void {
    if (type === 'first' && this.ownerFirstName) {
      document.getElementById('firstName')?.classList.remove('error');
    } else if (type === 'last' && this.ownerLastName) {
      document.getElementById('lastName')?.classList.remove('error');
    }
  }

  validateForm(): boolean {
    // Check if at least one business status is selected
    const hasBusinessStatus = this.businessStatus.some(status => status.selected);
    
    // Basic validation
    if (!this.businessStructure || !this.ownerFirstName || !this.ownerLastName) {
      this.showErrors = true;
      return false;
    }
    
    return true;
  }


  // Navigation methods
  nextStep(): void {
  this.showErrors = true;
  
  if (this.validateForm()) {
  
    if (this.currentStep === 1) {
      this.currentStep = 2;

      this.router.navigate(['/next-page']);
    }
  } else {
   
    const firstError = document.querySelector('.error');
    if (firstError) {
      firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }
}
  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  // Helper method to check if any business status is selected
  get isAnyBusinessStatusSelected(): boolean {
    return this.businessStatus.some(status => status.selected);
  }
}