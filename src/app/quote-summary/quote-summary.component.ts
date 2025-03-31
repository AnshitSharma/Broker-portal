import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StorageService } from '../services/storage.ts.service';

interface Coverage {
  title: string;
  description: string;
  image: string;
  price: number;
  selected: boolean;
}

@Component({
  selector: 'app-quote-summary',
  standalone: true,
  templateUrl: './quote-summary.component.html',
  styleUrls: ['./quote-summary.component.css'],
  imports: [CommonModule, FormsModule]
})
export class QuoteSummaryComponent implements OnInit {
  // Quote information
  quoteId: string = '';
  quoteDate: Date = new Date();
  
  // Selected coverages from previous step
  selectedCoverages: Coverage[] = [];
  totalPrice: number = 0;
  
  // Business information from step 1
  businessInfo: any = {
    ownerName: '',
    businessName: '',
    businessStructure: '',
    businessYear: '',
    employeeCount: 0,
    executiveOfficers: 0,
    businessDescription: '',
    isNonProfit: 'No',
    additionalServices: 'No'
  };
  
  // Location information from step 2
  locationInfo: any = {
    businessLocation: '',
    businessStreetAddress: '',
    zipCode: '',
    ownOrRent: '',
    hasOtherLocations: 'No'
  };
  
  constructor(
    private router: Router,
    private storageService: StorageService
  ) {}
  
  ngOnInit(): void {
    this.loadQuoteData();
  }
  
  /**
   * Load data from previous steps using storage service
   */
  loadQuoteData(): void {
    // Generate a random quote ID
    this.quoteId = 'BIZ-' + Math.floor(100000 + Math.random() * 900000);
    
    // Load Basic Info (Step 1)
    const basicInfo = this.storageService.getItem('quoteBasicInfo');
    if (basicInfo) {
      this.businessInfo.ownerName = basicInfo.ownerFullName || `${basicInfo.ownerFirstName} ${basicInfo.ownerLastName}`;
      this.businessInfo.businessName = basicInfo.businessName || 'N/A';
      this.businessInfo.businessStructure = basicInfo.businessStructure || '';
    }
    
    // Load Location Info (Step 2)
    const locationInfo = this.storageService.getItem('quoteLocationInfo');
    if (locationInfo) {
      this.locationInfo.businessLocation = locationInfo.businessLocation || '';
      this.locationInfo.businessStreetAddress = locationInfo.businessStreetAddress || '';
      this.locationInfo.zipCode = locationInfo.zipCode || '';
      this.locationInfo.ownOrRent = locationInfo.ownOrRent || '';
      this.locationInfo.hasOtherLocations = locationInfo.hasOtherLocations || 'No';
    }
    
    // Load Business Details (Step 3)
    const businessDetails = this.storageService.getItem('quoteBusinessDetails');
    if (businessDetails) {
      this.businessInfo.businessYear = businessDetails.businessYear || '';
      this.businessInfo.employeeCount = businessDetails.employeeCount || 0;
      this.businessInfo.executiveOfficers = businessDetails.executiveOfficers || 0;
      this.businessInfo.businessDescription = businessDetails.businessDescription || '';
      this.businessInfo.isNonProfit = businessDetails.isNonProfit || 'No';
      this.businessInfo.additionalServices = businessDetails.additionalServices || 'No';
    }
    
    // Load Coverage Details (Step 4)
    const coverageData = this.storageService.getItem('quoteCoverageDetails');
    if (coverageData) {
      this.selectedCoverages = coverageData.filter((coverage: Coverage) => coverage.selected);
    }
    
    // Load Total Price
    const totalPriceStr = this.storageService.getItem('quoteTotalPrice');
    if (totalPriceStr) {
      this.totalPrice = parseFloat(totalPriceStr);
    } else {
      // Calculate total from selected coverages if not stored directly
      this.totalPrice = this.selectedCoverages.reduce((sum, coverage) => sum + coverage.price, 0);
    }
  }
  
  /**
   * Navigate back to the coverage selection page
   */
  previousStep(): void {
    this.router.navigate(['/coverage-details']);
  }
  
  /**
   * Proceed with the insurance application
   */
  proceedToApplication(): void {
    // In a real application, you would save all the collected data
    // and navigate to a confirmation or payment page
    
    // For demo purposes, we'll just show an alert
    alert('Your insurance application has been submitted! A representative will contact you shortly.');
    
    // Clear the storage data when application is complete
    this.clearStoredData();
    
    // Navigate to a confirmation page or home
    this.router.navigate(['/']);
  }
  
  /**
   * Clear all stored quote data from storage
   */
  clearStoredData(): void {
    this.storageService.removeItem('quoteBasicInfo');
    this.storageService.removeItem('quoteLocationInfo');
    this.storageService.removeItem('quoteBusinessDetails');
    this.storageService.removeItem('quoteCoverageDetails');
    this.storageService.removeItem('quoteTotalPrice');
  }
}