import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { StorageService } from '../services/storage.ts.service';

@Component({
  selector: 'app-next-page',
  standalone: true,
  templateUrl: './next-page.component.html',
  styleUrls: ['./next-page.component.css'],
  imports: [CommonModule, FormsModule]
})
export class NextPageComponent implements OnInit {
  currentStep = 2;
  showErrors = false;

  // Step 2 Form Fields
  businessLocation = '';
  locationTypes = ['Commercial', 'Condominium', 'Commercial Building', 'Personal Residence'];
  businessStreetAddress = '';
  zipCode = '';
  zipCodeValid: boolean = true;
  zipCodeErrorMessage: string = '';
  ownOrRent = '';
  hasOtherLocations = '';

  constructor(
    private http: HttpClient, 
    private router: Router,
    private storageService: StorageService
  ) {}

  ngOnInit(): void {
    // Load previously stored data if available
    this.loadStoredData();
  }

  // Load any previously stored location data
  loadStoredData(): void {
    const storedData = this.storageService.getItem('quoteLocationInfo');
    if (storedData) {
      if (storedData.businessLocation) {
        this.businessLocation = storedData.businessLocation;
      }
      
      if (storedData.businessStreetAddress) {
        this.businessStreetAddress = storedData.businessStreetAddress;
      }
      
      if (storedData.zipCode) {
        this.zipCode = storedData.zipCode;
        // Validate the ZIP code right away
        this.validateZipCode();
      }
      
      if (storedData.ownOrRent) {
        this.ownOrRent = storedData.ownOrRent;
      }
      
      if (storedData.hasOtherLocations) {
        this.hasOtherLocations = storedData.hasOtherLocations;
      }
    }
  }

  validateZipCode() {
    // For simplicity, we'll just do basic validation without API calls in this example
    const usZipRegex = /^[0-9]{5}$/; // US ZIP Code format
    
    if (usZipRegex.test(this.zipCode)) {
      this.zipCodeValid = true;
      this.zipCodeErrorMessage = '';
    } else {
      this.zipCodeValid = false;
      this.zipCodeErrorMessage = 'Invalid ZIP Code. Enter a valid 5-digit ZIP Code.';
    }
    
    // In a production environment, you would want to use API calls
    // this.checkZipCodeAPI(`https://api.zippopotam.us/us/${this.zipCode}`);
  }

  checkZipCodeAPI(apiUrl: string) {
    this.http.get<any>(apiUrl).subscribe(
      (response) => {
        if (response && Object.keys(response).length > 0) {
          this.zipCodeValid = true;
          this.zipCodeErrorMessage = '';
        } else {
          this.zipCodeValid = false;
          this.zipCodeErrorMessage = 'Invalid ZIP Code. Please enter a correct ZIP Code.';
        }
      },
      (error) => {
        this.zipCodeValid = false;
        this.zipCodeErrorMessage = 'Invalid ZIP Code. Please enter a correct ZIP Code.';
      }
    );
  }

  // Save data to storage
  saveDataToStorage(): void {
    const locationInfo = {
      businessLocation: this.businessLocation,
      businessStreetAddress: this.businessStreetAddress,
      zipCode: this.zipCode,
      ownOrRent: this.ownOrRent,
      hasOtherLocations: this.hasOtherLocations
    };
    
    this.storageService.setItem('quoteLocationInfo', locationInfo);
  }

  previousStep() {
    this.router.navigate(['/insurance']);
  }

  nextStep() {
    this.showErrors = true;

    if (!this.businessLocation || !this.businessStreetAddress || !this.zipCode || !this.ownOrRent || !this.hasOtherLocations || !this.zipCodeValid) {
      return;
    }

    // Save the data before navigating
    this.saveDataToStorage();
    
    this.showErrors = false;
    this.router.navigate(['/final-page']);
  }
}