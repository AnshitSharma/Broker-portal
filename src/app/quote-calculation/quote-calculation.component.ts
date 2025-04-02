// quote-calculation.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { 
  BaseFactor, 
  BaseFactorType, 
  BusinessInfo, 
  Coverage, 
  FactorTier,
  IndustryClassification,
  PremiumCalculationResult
} from '../models/premium-calculator.model';
import { PremiumCalculatorService } from '../services/premium-calculator.service';

@Component({
  selector: 'app-quote-calculation',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './quote-calculation.component.html',
  styleUrls: ['./quote-calculation.component.css']
})
export class QuoteCalculationComponent implements OnInit {
  // Data models
  baseFactors: BaseFactor[] = [];
  coverages: Coverage[] = [];
  industries: IndustryClassification[] = [];
  factorTiers: FactorTier[] = [];
  
  // Form controls
  businessInfoForm: FormGroup;
  
  // Custom factor values (overrides from default)
  appliedFactors: { [factorId: string]: number } = {};
  
  // Results
  calculationResult: PremiumCalculationResult | null = null;
  showResults = false;
  loading = false;
  
  // UI state
  activeSection = 'coverages'; // 'coverages', 'business', 'factors', 'results'
  
  constructor(
    private premiumService: PremiumCalculatorService,
    private fb: FormBuilder
  ) {
    // Initialize business info form
    this.businessInfoForm = this.fb.group({
      annualRevenue: [250000, [Validators.required, Validators.min(0)]],
      employeeCount: [5, [Validators.required, Validators.min(0)]],
      yearsInBusiness: [3, [Validators.required, Validators.min(0)]],
      industryCode: ['RETAIL001', Validators.required],
      zipCode: ['10001', [Validators.required, Validators.pattern(/^\d{5}$/)]],
      buildingType: ['Commercial', Validators.required],
      squareFootage: [2500, [Validators.required, Validators.min(0)]],
      hasClaimHistory: [false],
      claimCount: [0],
      claimAmount: [0]
    });
  }
  
  ngOnInit(): void {
    this.loading = true;
    
    // Load all required data
    this.premiumService.getBaseFactors().subscribe(factors => {
      this.baseFactors = factors;
      this.loading = false;
    });
    
    this.premiumService.getCoverages().subscribe(coverages => {
      this.coverages = coverages;
    });
    
    this.premiumService.getIndustryClassifications().subscribe(industries => {
      this.industries = industries;
    });
    
    this.premiumService.getFactorTiers().subscribe(tiers => {
      this.factorTiers = tiers;
    });
  }
  
  /**
   * Toggles selection of a coverage
   */
  toggleCoverage(coverage: Coverage): void {
    coverage.selected = !coverage.selected;
    
    // If any coverage is selected, proceed to next step
    if (this.coverages.some(c => c.selected) && this.activeSection === 'coverages') {
      this.nextSection();
    }
  }
  
  /**
   * Sets the coverage limit for a specific coverage
   */
  setCoverageLimit(coverage: Coverage, limitId: string): void {
    coverage.selectedLimit = limitId;
    this.recalculateIfResultsShown();
  }
  
  /**
   * Updates an applied factor value
   */
  updateFactorValue(factorId: string, value: number): void {
    this.appliedFactors[factorId] = value;
    this.recalculateIfResultsShown();
  }
  
  /**
   * Resets a factor to its default value
   */
  resetFactorToDefault(factorId: string): void {
    delete this.appliedFactors[factorId];
    this.recalculateIfResultsShown();
  }
  
  /**
   * Gets the display value for a factor
   */
  getFactorDisplayValue(factor: BaseFactor): string {
    const value = this.appliedFactors[factor.id] !== undefined 
      ? this.appliedFactors[factor.id] 
      : factor.value;
      
    switch (factor.type) {
      case BaseFactorType.PERCENTAGE:
        return `${value}%`;
      case BaseFactorType.RATE:
        return `$${value}`;
      case BaseFactorType.FIXED_AMOUNT:
        return `$${value}`;
      case BaseFactorType.MULTIPLIER:
        return value.toFixed(2);
      case BaseFactorType.TIER_BASED:
        const tierFactor = this.factorTiers.find(ft => ft.factorId === factor.id);
        if (!tierFactor) return 'N/A';
        
        let tierValue = 0;
        if (factor.id === 'employee_tier') {
          tierValue = this.businessInfoForm.get('employeeCount')?.value || 0;
        } else if (factor.id === 'revenue_tier') {
          tierValue = this.businessInfoForm.get('annualRevenue')?.value || 0;
        } else if (factor.id === 'years_in_business_tier') {
          tierValue = this.businessInfoForm.get('yearsInBusiness')?.value || 0;
        }
        
        const matchingTier = tierFactor.tiers.find(
          tier => tierValue >= tier.minValue && tierValue <= tier.maxValue
        );
        
        return matchingTier 
          ? `${matchingTier.name} (${matchingTier.factor.toFixed(2)})`
          : 'N/A';
      default:
        return value.toString();
    }
  }
  
  /**
   * Checks if a factor is applicable for any selected coverage
   */
  isFactorApplicable(factor: BaseFactor): boolean {
    const selectedCoverageIds = this.coverages
      .filter(c => c.selected)
      .map(c => c.id);
      
    return factor.applicableCoverages.some(id => selectedCoverageIds.includes(id));
  }
  
  /**
   * Gets applicable base factors for the current coverages
   */
  getApplicableFactors(): BaseFactor[] {
    return this.baseFactors.filter(factor => this.isFactorApplicable(factor));
  }
  
  /**
   * Navigates to the next section
   */
  nextSection(): void {
    switch (this.activeSection) {
      case 'coverages':
        this.activeSection = 'business';
        break;
      case 'business':
        this.activeSection = 'factors';
        break;
      case 'factors':
        this.calculatePremium();
        this.activeSection = 'results';
        break;
      case 'results':
        // Reset and start over
        this.resetCalculator();
        break;
    }
  }
  
  /**
   * Navigates to the previous section
   */
  previousSection(): void {
    switch (this.activeSection) {
      case 'business':
        this.activeSection = 'coverages';
        break;
      case 'factors':
        this.activeSection = 'business';
        break;
      case 'results':
        this.activeSection = 'factors';
        break;
    }
  }
  
  /**
   * Performs the premium calculation
   */
  calculatePremium(): void {
    if (!this.businessInfoForm.valid) {
      this.markFormGroupTouched(this.businessInfoForm);
      return;
    }
    
    this.loading = true;
    this.showResults = false;
    
    const businessInfo: BusinessInfo = this.businessInfoForm.value;
    
    this.premiumService.calculatePremium(
      this.coverages,
      businessInfo,
      this.appliedFactors
    ).subscribe(result => {
      this.calculationResult = result;
      this.showResults = true;
      this.loading = false;
    });
  }
  
  /**
   * Recalculates premium if results are already showing
   */
  public recalculateIfResultsShown(): void {
    if (this.showResults) {
      this.calculatePremium();
    }
  }
  
  /**
   * Resets the calculator to its initial state
   */
  resetCalculator(): void {
    this.activeSection = 'coverages';
    this.showResults = false;
    this.calculationResult = null;
    this.appliedFactors = {};
    
    // Reset coverages
    this.coverages.forEach(coverage => {
      coverage.selected = false;
      if (coverage.limits && coverage.limits.length > 0) {
        coverage.selectedLimit = coverage.limits[0].id;
      }
    });
    
    // Reset form
    this.businessInfoForm.reset({
      annualRevenue: 250000,
      employeeCount: 5,
      yearsInBusiness: 3,
      industryCode: 'RETAIL001',
      zipCode: '10001',
      buildingType: 'Commercial',
      squareFootage: 2500,
      hasClaimHistory: false,
      claimCount: 0,
      claimAmount: 0
    });
  }
  
  /**
   * Helper method to mark all fields in a form as touched
   */
  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      
      if ((control as any).controls) {
        this.markFormGroupTouched(control as FormGroup);
      }
    });
  }
  
  /**
   * Gets the tier description for a factor
   */
  getTierDescription(factorId: string): string {
    const tierFactor = this.factorTiers.find(ft => ft.factorId === factorId);
    if (!tierFactor) return '';
    
    return tierFactor.tiers.map(tier => 
      `${tier.name}: ${tier.factor.toFixed(2)}x`
    ).join(', ');
  }
  
  /**
   * Determines if a section is complete
   */
  isSectionComplete(section: string): boolean {
    switch (section) {
      case 'coverages':
        return this.coverages.some(c => c.selected);
      case 'business':
        return this.businessInfoForm.valid;
      case 'factors':
        return true; // Factors are optional
      default:
        return false;
    }
  }
  
  /**
   * Formats currency values
   */
  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  }
  
  /**
   * Checks if a value is custom (different from default)
   */
  isCustomValue(factorId: string): boolean {
    return this.appliedFactors[factorId] !== undefined;
  }
}