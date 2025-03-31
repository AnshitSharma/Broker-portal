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
  selector: 'app-coverage-details',
  standalone: true,
  templateUrl: './coverage-details.component.html',
  styleUrls: ['./coverage-details.component.css'],
  imports: [CommonModule, FormsModule]
})
export class CoverageDetailsComponent implements OnInit {
  currentStep = 4;
  
  // Coverage information with prices
  coverages: Coverage[] = [
    {
      title: 'Bodily Injury and Property Damage',
      description: 'Covers physical injuries and damage caused to third parties.',
      image: 'assets/images/bodily_injury.jpg',
      price: 450,
      selected: false
    },
    {
      title: 'Products and Completed Operations',
      description: 'Protects against liability from sold products and completed services.',
      image: 'assets/images/products_operations.jpg',
      price: 375,
      selected: false
    },
    {
      title: 'Advertising Injury',
      description: 'Covers claims related to misleading advertisements and copyright issues.',
      image: 'assets/images/advertising_injury.jpg',
      price: 225,
      selected: false
    },
    {
      title: 'Reputational Harm',
      description: 'Protects against defamation, slander, or libel claims.',
      image: 'assets/images/reputational_harm.jpg',
      price: 300,
      selected: false
    },
    {
      title: 'Independent Contractors',
      description: 'Covers liabilities associated with third-party contractors working for you.',
      image: 'assets/images/independent_contractors.jpg',
      price: 275,
      selected: false
    }
  ];
  
  // Fallback images in case the actual images don't load
  fallbackImageUrl = 'assets/images/default_coverage.jpg';
  
  constructor(
    private router: Router,
    private storageService: StorageService
  ) {}
  
  ngOnInit(): void {
    // Load previously stored data if available
    this.loadStoredData();
    
    // If no coverage was previously selected, set the first one as default
    if (this.getSelectedCount() === 0 && this.coverages.length > 0) {
      this.coverages[0].selected = true;
    }
  }
  
  // Load any previously stored coverage data
  loadStoredData(): void {
    const storedData = this.storageService.getItem('quoteCoverageDetails');
    if (storedData) {
      // Apply the saved selection state to our coverages
      this.coverages.forEach((coverage, index) => {
        if (storedData[index] && storedData[index].selected) {
          coverage.selected = true;
        }
      });
    }
  }
  
  /**
   * Toggle selection state of a coverage option
   */
  toggleSelection(coverage: Coverage): void {
    coverage.selected = !coverage.selected;
  }
  
  /**
   * Get the count of selected coverages
   */
  getSelectedCount(): number {
    return this.coverages.filter(c => c.selected).length;
  }
  
  /**
   * Get only the selected coverages
   */
  getSelectedCoverages(): Coverage[] {
    return this.coverages.filter(c => c.selected);
  }
  
  /**
   * Calculate total price of selected coverages
   */
  getTotalPrice(): number {
    return this.getSelectedCoverages().reduce((total, coverage) => total + coverage.price, 0);
  }
  
  /**
   * Handle image load errors by providing a fallback
   */
  handleImageError(event: any): void {
    // Only set fallback if not already using the fallback
    if (event.target.src.indexOf('default_coverage.jpg') === -1) {
      event.target.src = this.fallbackImageUrl;
    } else {
      // If fallback also fails, use an inline SVG or data URL
      event.target.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22200%22%20height%3D%22150%22%20viewBox%3D%220%200%20200%20150%22%3E%3Crect%20fill%3D%22%23ddd%22%20width%3D%22200%22%20height%3D%22150%22%2F%3E%3Ctext%20fill%3D%22rgba%280%2C0%2C0%2C0.5%29%22%20font-family%3D%22sans-serif%22%20font-size%3D%2220%22%20dy%3D%220.35em%22%20text-anchor%3D%22middle%22%20x%3D%22100%22%20y%3D%2275%22%3EImage%3C%2Ftext%3E%3C%2Fsvg%3E';
    }
  }
  
  // Save data to storage
  saveDataToStorage(): void {
    this.storageService.setItem('quoteCoverageDetails', this.coverages);
    this.storageService.setItem('quoteTotalPrice', this.getTotalPrice().toString());
  }
  
  /**
   * Navigate to the previous step
   */
  previousStep(): void {
    this.router.navigate(['/final-page']);
  }
  
  /**
   * Navigate to the next step and pass selected coverage data
   */
  nextStep(): void {
    // Make sure at least one coverage is selected
    if (this.getSelectedCount() === 0) {
      return;
    }
    
    // Save selected coverage data and total price to storage
    this.saveDataToStorage();
    
    this.router.navigate(['/quote-summary']);
  }
}