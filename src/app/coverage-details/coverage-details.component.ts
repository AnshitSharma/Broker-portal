import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface CoverageLimit {
  id: number;
  name: string;
  factor: number;
}

interface Coverage {
  id: number;
  name: string;
  description: string;
  image: string;
  baseAmount: number;
  selected: boolean;
  limits?: CoverageLimit[];
  selectedLimit?: number;
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
  activeSection = 'coverages';
  
  // Coverage information with prices and limits
  coverages: Coverage[] = [
    {
      id: 1,
      name: 'Bodily Injury and Property Damage',
      description: 'Covers physical injuries and damage caused to third parties.',
      image: 'assets/images/bodily_injury.jpg',
      baseAmount: 450,
      selected: false,
      limits: [
        { id: 1, name: '$500K', factor: 1.0 },
        { id: 2, name: '$1M', factor: 1.25 },
        { id: 3, name: '$2M', factor: 1.5 }
      ],
      selectedLimit: 1
    },
    {
      id: 2,
      name: 'Products and Completed Operations',
      description: 'Protects against liability from sold products and completed services.',
      image: 'assets/images/products_operations.jpg',
      baseAmount: 375,
      selected: false,
      limits: [
        { id: 1, name: '$500K', factor: 1.0 },
        { id: 2, name: '$1M', factor: 1.2 },
        { id: 3, name: '$2M', factor: 1.4 }
      ],
      selectedLimit: 1
    },
    {
      id: 3,
      name: 'Advertising Injury',
      description: 'Covers claims related to misleading advertisements and copyright issues.',
      image: 'assets/images/advertising_injury.jpg',
      baseAmount: 225,
      selected: false,
      limits: [
        { id: 1, name: '$250K', factor: 1.0 },
        { id: 2, name: '$500K', factor: 1.15 },
        { id: 3, name: '$1M', factor: 1.3 }
      ],
      selectedLimit: 1
    },
    {
      id: 4,
      name: 'Reputational Harm',
      description: 'Protects against defamation, slander, or libel claims.',
      image: 'assets/images/reputational_harm.jpg',
      baseAmount: 300,
      selected: false,
      limits: [
        { id: 1, name: '$250K', factor: 1.0 },
        { id: 2, name: '$500K', factor: 1.2 },
        { id: 3, name: '$1M', factor: 1.35 }
      ],
      selectedLimit: 1
    },
    {
      id: 5,
      name: 'Independent Contractors',
      description: 'Covers liabilities associated with third-party contractors working for you.',
      image: 'assets/images/independent_contractors.jpg',
      baseAmount: 275,
      selected: false,
      limits: [
        { id: 1, name: '$300K', factor: 1.0 },
        { id: 2, name: '$500K', factor: 1.15 },
        { id: 3, name: '$1M', factor: 1.25 }
      ],
      selectedLimit: 1
    }
  ];
  
  // Fallback images in case the actual images don't load
  fallbackImageUrl = 'assets/images/default_coverage.jpg';
  
  constructor(private router: Router) {}
  
  ngOnInit(): void {
    // Set the first coverage as selected by default
    if (this.coverages.length > 0) {
      this.coverages[0].selected = true;
    }
  }
  
  /**
   * Toggle selection state of a coverage option
   */
  toggleCoverage(coverage: Coverage): void {
    coverage.selected = !coverage.selected;
  }
  
  /**
   * Set the selected limit for a coverage
   */
  setCoverageLimit(coverage: Coverage, limitId: number): void {
    coverage.selectedLimit = limitId;
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
   * Get the price for a specific coverage including limit factor
   */
  getCoveragePrice(coverage: Coverage): number {
    const limit = coverage.limits?.find(l => l.id === coverage.selectedLimit);
    const factor = limit ? limit.factor : 1;
    return coverage.baseAmount * factor;
  }
  
  /**
   * Get the name of the selected limit for a coverage
   */
  getCoverageLimitName(coverage: Coverage): string {
    if (!coverage.limits) {
      return '';
    }
    const limit = coverage.limits.find(l => l.id === coverage.selectedLimit);
    return limit ? limit.name : '';
  }
  
  /**
   * Calculate total price of selected coverages including limit factors
   */
  getTotalPrice(): number {
    return this.getSelectedCoverages().reduce((total, coverage) => {
      return total + this.getCoveragePrice(coverage);
    }, 0);
  }
  
  /**
   * Format currency for display
   */
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
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
    
    // Prepare selected coverage data to pass to the next component
    const selectedCoverages = this.getSelectedCoverages().map(coverage => {
      const limit = coverage.limits?.find(l => l.id === coverage.selectedLimit);
      const factor = limit ? limit.factor : 1;
      const price = coverage.baseAmount * factor;
      
      return {
        title: coverage.name,
        description: coverage.description,
        image: coverage.image,
        price: price,
        selected: true,
        limit: limit ? limit.name : null
      };
    });
    
    const totalPrice = this.getTotalPrice();
    
    // Store in sessionStorage
    sessionStorage.setItem('selectedCoverages', JSON.stringify(selectedCoverages));
    sessionStorage.setItem('totalPrice', totalPrice.toString());
    
    this.router.navigate(['/quote-summary']);
  }
}