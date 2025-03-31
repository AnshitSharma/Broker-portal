import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StorageService } from '../services/storage.ts.service';

@Component({
  selector: 'app-insurance-quote',
  standalone: true,
  templateUrl: './insurance-quote.component.html',
  styleUrls: ['./insurance-quote.component.css'],
  imports: [CommonModule, FormsModule]
})
export class InsuranceCodeComponent implements OnInit {
  // Step progress
  currentStep = 1;
  showErrors = false;
  
  // Business Status
  businessStatus = [
    { id: 'active-insured', label: 'I\'m in business and have insurance.', selected: false },
    { id: 'active-uninsured', label: 'I\'m in business but don\'t have insurance yet.', selected: false },
    { id: 'starting', label: 'I\'m starting a business and curious about insurance.', selected: false }
  ];
  
  // Business Structure
  businessStructure = '';
  businessStructures = [
    'Sole Proprietorship',
    'Limited Liability Corporation (LLC)',
    'S-Corporation',
    'C-Corporation',
    'Partnership',
    'Non-Profit Organization',
    'Other'
  ];
  
  // Owner Information
  ownerFirstName = '';
  ownerLastName = '';
  businessName = '';
  
  constructor(
    private router: Router,
    private storageService: StorageService
  ) {}
  
  ngOnInit(): void {
    // Check if we already have stored data (returning from a later step)
    this.loadStoredData();
  }
  
  // Load any previously stored data
  loadStoredData(): void {
    const storedData = this.storageService.getItem('quoteBasicInfo');
    if (storedData) {
      // Business Status
      if (storedData.businessStatus) {
        this.businessStatus = storedData.businessStatus;
      }
      
      // Business Structure
      if (storedData.businessStructure) {
        this.businessStructure = storedData.businessStructure;
      }
      
      // Owner Information
      if (storedData.ownerFirstName) {
        this.ownerFirstName = storedData.ownerFirstName;
      }
      
      if (storedData.ownerLastName) {
        this.ownerLastName = storedData.ownerLastName;
      }
      
      if (storedData.businessName) {
        this.businessName = storedData.businessName;
      }
    }
  }
  
  // Validate form before proceeding
  validateForm(): boolean {
    // Check if at least one business status is selected
    const hasBusinessStatus = this.businessStatus.some(status => status.selected);
    
    // Check if business structure is selected
    const hasBusinessStructure = !!this.businessStructure;
    
    // Check if owner information is provided
    const hasOwnerInfo = !!this.ownerFirstName && !!this.ownerLastName;
    
    return hasBusinessStatus && hasBusinessStructure && hasOwnerInfo;
  }
  
  // Validate name fields
  validateName(type: 'first' | 'last'): void {
    if (type === 'first' && this.ownerFirstName) {
      // Optional validation for first name
    } else if (type === 'last' && this.ownerLastName) {
      // Optional validation for last name
    }
  }
  
  // Navigate to the previous step
  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }
  
  // Navigate to the next step
  nextStep(): void {
    this.showErrors = true;
    
    if (this.validateForm()) {
      // Save data to storage before navigating
      this.saveDataToStorage();
      
      // Navigate to the next step
      this.router.navigate(['/next-page']);
    }
  }
  
  // Save data to storage
  saveDataToStorage(): void {
    const basicInfo = {
      businessStatus: this.businessStatus,
      businessStructure: this.businessStructure,
      ownerFirstName: this.ownerFirstName,
      ownerLastName: this.ownerLastName,
      businessName: this.businessName,
      ownerFullName: `${this.ownerFirstName} ${this.ownerLastName}`
    };
    
    this.storageService.setItem('quoteBasicInfo', basicInfo);
  }
}