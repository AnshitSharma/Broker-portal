import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-next-page',
  standalone: true,
  templateUrl: './next-page.component.html',
  styleUrls: ['./next-page.component.css'],
  imports: [CommonModule, FormsModule]
})
export class NextPageComponent {
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

  constructor(private http: HttpClient, private router: Router) {}

  validateZipCode() {
    const usZipRegex = /^[0-9]{5}$/; // US ZIP Code format
    const indiaZipRegex = /^[1-9][0-9]{5}$/; // Indian PIN Code format

    if (usZipRegex.test(this.zipCode)) {
      this.checkZipCodeAPI(`https://api.zippopotam.us/us/${this.zipCode}`);
    } else if (indiaZipRegex.test(this.zipCode)) {
      this.checkZipCodeAPI(`https://api.postalpincode.in/pincode/${this.zipCode}`);
    } else {
      this.zipCodeValid = false;
      this.zipCodeErrorMessage = 'Invalid ZIP Code. Enter a valid US (5-digit) or Indian (6-digit) ZIP Code.';
    }
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

  previousStep() {
    this.router.navigate(['/insurance']);
  }

  nextStep() {
    this.showErrors = true;

    if (!this.businessLocation || !this.businessStreetAddress || !this.zipCode || !this.ownOrRent || !this.hasOtherLocations || !this.zipCodeValid) {
      return;
    }

    this.showErrors = false;
    this.router.navigate(['/final-page']);
  }
}