import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
  
  constructor(private router: Router) {}
  
  ngOnInit(): void {
    this.loadQuoteData();
  }
  
  /**
   * Load data from previous steps
   */
  loadQuoteData(): void {
    // Generate a random quote ID
    this.quoteId = 'BIZ-' + Math.floor(100000 + Math.random() * 900000);
    
    // Load coverage data from session storage
    const coverageData = sessionStorage.getItem('selectedCoverages');
    if (coverageData) {
      this.selectedCoverages = JSON.parse(coverageData);
    }
    
    const totalPriceStr = sessionStorage.getItem('totalPrice');
    if (totalPriceStr) {
      this.totalPrice = parseFloat(totalPriceStr);
    }
    
    // In a real application, you would retrieve this data from a service or API
    // For demo purposes, we're using mock data that would represent the information
    // collected in previous steps
    
    // Mock data for business information (Step 1 & 3)
    this.businessInfo = {
      ownerName: 'John Smith',
      businessName: 'Smith Consulting LLC',
      businessStructure: 'Limited Liability Corporation (LLC)',
      businessYear: '2018',
      employeeCount: 5,
      executiveOfficers: 2,
      businessDescription: 'IT Consulting Services',
      isNonProfit: 'No',
      additionalServices: 'Yes'
    };
    
    // Mock data for location information (Step 2)
    this.locationInfo = {
      businessLocation: 'Commercial Building',
      businessStreetAddress: '123 Business Ave, Suite 101',
      zipCode: '10001',
      ownOrRent: 'Rent',
      hasOtherLocations: 'No'
    };
    
    // In a real application, you would retrieve the actual data that was entered
    // during the previous steps of the form, using a service, state management, or API
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
    
    // Clear the session storage
    sessionStorage.removeItem('selectedCoverages');
    sessionStorage.removeItem('totalPrice');
    
    // Navigate to a confirmation page or home
    // this.router.navigate(['/confirmation']);
    this.router.navigate(['/']);
  }
}