import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StorageService } from '../services/storage.ts.service';

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
  
  constructor(
    private router: Router,
    private storageService: StorageService
  ) {}
  
  ngOnInit(): void {
    // Load previously stored data if available
    this.loadStoredData();
  }
  
  // Load any previously stored business details data
  loadStoredData(): void {
    const storedData = this.storageService.getItem('quoteBusinessDetails');
    if (storedData) {
      if (storedData.isNonProfit) {
        this.isNonProfit = storedData.isNonProfit;
      }
      
      if (storedData.businessDescription) {
        this.businessDescription = storedData.businessDescription;
      }
      
      if (storedData.additionalServices) {
        this.additionalServices = storedData.additionalServices;
      }
      
      if (storedData.businessYear) {
        this.businessYear = storedData.businessYear;
      }
      
      if (storedData.executiveOfficers !== undefined && storedData.executiveOfficers !== null) {
        this.executiveOfficers = storedData.executiveOfficers;
      }
      
      if (storedData.employeeCount !== undefined && storedData.employeeCount !== null) {
        this.employeeCount = storedData.employeeCount;
      }
    }
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
  
  // Save data to storage
  saveDataToStorage(): void {
    const businessDetails = {
      isNonProfit: this.isNonProfit,
      businessDescription: this.businessDescription,
      additionalServices: this.additionalServices,
      businessYear: this.businessYear,
      executiveOfficers: this.executiveOfficers,
      employeeCount: this.employeeCount
    };
    
    this.storageService.setItem('quoteBusinessDetails', businessDetails);
  }
  
  /**
   * Check if a step is active
   */
  isStepActive(step: number): boolean {
    return this.currentStep === step;
  }
  
  /**
   * Navigate to the next step
   */
  nextStep(): void {
    this.showErrors = true;
    
    if (this.validateForm()) {
      // Save the data before navigating
      this.saveDataToStorage();
      
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