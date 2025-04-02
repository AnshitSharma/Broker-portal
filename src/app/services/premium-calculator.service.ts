// premium-calculator.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, forkJoin } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import {
  BaseFactor,
  BaseFactorType,
  BusinessInfo,
  Coverage,
  FactorTier,
  IndustryClassification,
  PremiumCalculationResult,
  TerritoryRating,
  PremiumAdjustment,
  CoveragePremiumDetail,
  Fee,
  Tax
} from '../models/premium-calculator.model';

@Injectable({
  providedIn: 'root'
})
export class PremiumCalculatorService {
  private apiUrl = 'api/insurance'; // Base API URL - change as needed
  
  // Mock data toggle for development - set to false in production
  private useMockData = true;

  constructor(private http: HttpClient) {}

  /**
   * Retrieves all available base factors from the database
   */
  getBaseFactors(): Observable<BaseFactor[]> {
    if (this.useMockData) {
      return of(this.getMockBaseFactors());
    }
    return this.http.get<BaseFactor[]>(`${this.apiUrl}/factors`)
      .pipe(catchError(this.handleError<BaseFactor[]>('getBaseFactors', [])));
  }

  /**
   * Retrieves all available coverages from the database
   */
  getCoverages(): Observable<Coverage[]> {
    if (this.useMockData) {
      return of(this.getMockCoverages());
    }
    return this.http.get<Coverage[]>(`${this.apiUrl}/coverages`)
      .pipe(catchError(this.handleError<Coverage[]>('getCoverages', [])));
  }

  /**
   * Retrieves territory ratings from the database
   */
  getTerritoryRatings(): Observable<TerritoryRating[]> {
    if (this.useMockData) {
      return of(this.getMockTerritoryRatings());
    }
    return this.http.get<TerritoryRating[]>(`${this.apiUrl}/territories`)
      .pipe(catchError(this.handleError<TerritoryRating[]>('getTerritoryRatings', [])));
  }

  /**
   * Retrieves industry classifications from the database
   */
  getIndustryClassifications(): Observable<IndustryClassification[]> {
    if (this.useMockData) {
      return of(this.getMockIndustryClassifications());
    }
    return this.http.get<IndustryClassification[]>(`${this.apiUrl}/industries`)
      .pipe(catchError(this.handleError<IndustryClassification[]>('getIndustryClassifications', [])));
  }

  /**
   * Retrieves factor tiers for tier-based calculations
   */
  getFactorTiers(): Observable<FactorTier[]> {
    if (this.useMockData) {
      return of(this.getMockFactorTiers());
    }
    return this.http.get<FactorTier[]>(`${this.apiUrl}/factor-tiers`)
      .pipe(catchError(this.handleError<FactorTier[]>('getFactorTiers', [])));
  }

  /**
   * Calculates premium based on selected coverages and business info
   */
  calculatePremium(
    selectedCoverages: Coverage[],
    businessInfo: BusinessInfo,
    appliedFactors: { [factorId: string]: number } = {}
  ): Observable<PremiumCalculationResult> {
    // In a real application, you might want to send this to the server
    if (!this.useMockData) {
      return this.http.post<PremiumCalculationResult>(
        `${this.apiUrl}/calculate-premium`,
        { selectedCoverages, businessInfo, appliedFactors }
      ).pipe(catchError(this.handleError<PremiumCalculationResult>('calculatePremium')));
    }
    
    // For development, perform calculation locally
    return forkJoin({
      baseFactors: this.getBaseFactors(),
      territoryRatings: this.getTerritoryRatings(),
      industryClassifications: this.getIndustryClassifications(),
      factorTiers: this.getFactorTiers()
    }).pipe(
      map(({ baseFactors, territoryRatings, industryClassifications, factorTiers }) => {
        return this.performPremiumCalculation(
          selectedCoverages, 
          businessInfo, 
          baseFactors, 
          territoryRatings, 
          industryClassifications, 
          factorTiers,
          appliedFactors
        );
      })
    );
  }

  /**
   * Performs the actual premium calculation
   */
  private performPremiumCalculation(
    selectedCoverages: Coverage[],
    businessInfo: BusinessInfo,
    baseFactors: BaseFactor[],
    territoryRatings: TerritoryRating[],
    industryClassifications: IndustryClassification[],
    factorTiers: FactorTier[],
    appliedFactors: { [factorId: string]: number } = {}
  ): PremiumCalculationResult {
    // Filter to only selected coverages
    const activeCoverages = selectedCoverages.filter(c => c.selected);
    
    // Find the industry classification
    const industryClass = industryClassifications.find(
      i => i.code === businessInfo.industryCode
    ) || industryClassifications[0]; // Default to first if not found
    
    // Find territory rating for the ZIP code
    const zipPrefix = businessInfo.zipCode.substring(0, 3);
    const territory = territoryRatings.find(
      t => t.zipCodePrefix === zipPrefix
    ) || territoryRatings[0]; // Default to first if not found

    // Calculate premium for each coverage
    const coverageDetails: CoveragePremiumDetail[] = activeCoverages.map(coverage => {
      // Get base premium for this coverage
      let basePremium = coverage.baseAmount;
      
      // Apply industry base rate factor
      basePremium *= industryClass.baseRateFactor;
      
      // Apply territory rating factor
      basePremium *= territory.ratingFactor;
      
      // Get applicable factors for this coverage
      const applicableFactors = baseFactors.filter(factor => 
        factor.applicableCoverages.includes(coverage.id)
      );
      
      // Calculate adjustments
      const adjustments: PremiumAdjustment[] = [];
      
      for (const factor of applicableFactors) {
        // Get the factor value - either from applied factors or default
        const factorValue = appliedFactors[factor.id] !== undefined 
          ? appliedFactors[factor.id] 
          : factor.value;
        
        let adjustmentAmount = 0;
        
        switch (factor.type) {
          case BaseFactorType.MULTIPLIER:
            adjustmentAmount = basePremium * (factorValue - 1);
            break;
            
          case BaseFactorType.RATE:
            // Rate per unit (e.g., per $1,000 of revenue)
            if (factor.id === 'revenue_rate') {
              adjustmentAmount = (businessInfo.annualRevenue / 1000) * factorValue;
            } else if (factor.id === 'square_footage_rate') {
              adjustmentAmount = (businessInfo.squareFootage / 100) * factorValue;
            } else if (factor.id === 'employee_rate') {
              adjustmentAmount = businessInfo.employeeCount * factorValue;
            }
            break;
            
          case BaseFactorType.FIXED_AMOUNT:
            adjustmentAmount = factorValue;
            break;
            
          case BaseFactorType.PERCENTAGE:
            adjustmentAmount = basePremium * (factorValue / 100);
            break;
            
          case BaseFactorType.TIER_BASED:
            // Find the appropriate tier
            const factorTier = factorTiers.find(ft => ft.factorId === factor.id);
            if (factorTier) {
              let tierValue = 0;
              
              // Determine the value to check against tiers
              if (factor.id === 'employee_tier') {
                tierValue = businessInfo.employeeCount;
              } else if (factor.id === 'revenue_tier') {
                tierValue = businessInfo.annualRevenue;
              } else if (factor.id === 'years_in_business_tier') {
                tierValue = businessInfo.yearsInBusiness;
              }
              
              // Find the matching tier
              const matchingTier = factorTier.tiers.find(
                tier => tierValue >= tier.minValue && tierValue <= tier.maxValue
              );
              
              if (matchingTier) {
                adjustmentAmount = basePremium * (matchingTier.factor - 1);
              }
            }
            break;
        }
        
        adjustments.push({
          name: factor.name,
          description: factor.description,
          amount: adjustmentAmount,
          factorId: factor.id,
          adjustmentType: factor.type
        });
      }
      
      // Apply selected limit adjustment if any
      let limitAdjustment = 0;
      if (coverage.selectedLimit && coverage.limits) {
        const selectedLimit = coverage.limits.find(l => l.id === coverage.selectedLimit);
        if (selectedLimit) {
          limitAdjustment = basePremium * (selectedLimit.adjustmentFactor - 1);
          
          adjustments.push({
            name: `${coverage.name} Limit: ${selectedLimit.name}`,
            description: `Coverage limit adjustment for ${selectedLimit.amount.toLocaleString()}`,
            amount: limitAdjustment,
            factorId: 'coverage_limit',
            adjustmentType: BaseFactorType.MULTIPLIER
          });
        }
      }
      
      // Calculate adjusted premium
      const adjustedPremium = basePremium + adjustments.reduce((sum, adj) => sum + adj.amount, 0);
      
      return {
        coverageId: coverage.id,
        coverageName: coverage.name,
        basePremium,
        adjustedPremium,
        selectedLimit: coverage.selectedLimit && coverage.limits 
          ? {
              name: coverage.limits.find(l => l.id === coverage.selectedLimit)?.name || '',
              amount: coverage.limits.find(l => l.id === coverage.selectedLimit)?.amount || 0
            }
          : undefined,
        adjustments
      };
    });
    
    // Calculate total premium
    const subtotal = coverageDetails.reduce((sum, detail) => sum + detail.adjustedPremium, 0);
    
    // Apply fees
    const fees: Fee[] = [
      {
        name: 'Policy Fee',
        amount: 150,
        isPercentage: false
      },
      {
        name: 'Processing Fee',
        amount: 25,
        isPercentage: false
      }
    ];
    
    const feesTotal = fees.reduce((sum, fee) => sum + fee.amount, 0);
    
    // Apply taxes
    const taxRate = 0.03; // 3% tax rate
    const taxAmount = subtotal * taxRate;
    
    const taxes: Tax[] = [
      {
        name: 'State Insurance Tax',
        rate: taxRate * 100,
        amount: taxAmount
      }
    ];
    
    // Calculate final premium
    const totalAnnualPremium = subtotal + feesTotal + taxAmount;
    
    // Get list of all adjustments across all coverages
    const allAdjustments = coverageDetails.flatMap(detail => detail.adjustments);
    
    return {
      basePremium: activeCoverages.reduce((sum, coverage) => sum + coverage.baseAmount, 0),
      adjustments: allAdjustments,
      subtotal,
      fees,
      taxes,
      totalAnnualPremium,
      monthlyPremium: totalAnnualPremium / 12,
      coverageDetails
    };
  }
  
  /**
   * Error handler for HTTP requests
   */
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      return of(result as T);
    };
  }

  /**
   * Mock data for development and testing
   */

  private getMockBaseFactors(): BaseFactor[] {
    return [
      {
        id: 'revenue_rate',
        name: 'Revenue Rate',
        description: 'Rate per $1,000 of annual revenue',
        value: 0.5,
        type: BaseFactorType.RATE,
        applicableCoverages: ['bodily_injury', 'property_damage', 'products_completed_operations'],
        minValue: 0.1,
        maxValue: 2.0,
        step: 0.1
      },
      {
        id: 'employee_rate',
        name: 'Employee Rate',
        description: 'Rate per employee',
        value: 25,
        type: BaseFactorType.RATE,
        applicableCoverages: ['bodily_injury', 'personal_injury'],
        minValue: 10,
        maxValue: 100,
        step: 5
      },
      {
        id: 'square_footage_rate',
        name: 'Square Footage Rate',
        description: 'Rate per 100 square feet',
        value: 0.75,
        type: BaseFactorType.RATE,
        applicableCoverages: ['property_damage', 'premises_liability'],
        minValue: 0.25,
        maxValue: 5.0,
        step: 0.25
      },
      {
        id: 'claims_history',
        name: 'Claims History Surcharge',
        description: 'Surcharge for prior claims',
        value: 15,
        type: BaseFactorType.PERCENTAGE,
        applicableCoverages: ['bodily_injury', 'property_damage', 'products_completed_operations', 'personal_injury', 'advertising_injury', 'premises_liability'],
        minValue: 0,
        maxValue: 50,
        step: 5
      },
      {
        id: 'safety_program',
        name: 'Safety Program Discount',
        description: 'Discount for documented safety program',
        value: 5,
        type: BaseFactorType.PERCENTAGE,
        applicableCoverages: ['bodily_injury', 'property_damage', 'premises_liability'],
        minValue: 0,
        maxValue: 15,
        step: 1
      },
      {
        id: 'construction_type',
        name: 'Building Construction Type',
        description: 'Factor based on building construction type',
        value: 1.0,
        type: BaseFactorType.MULTIPLIER,
        applicableCoverages: ['property_damage', 'premises_liability'],
        minValue: 0.8,
        maxValue: 1.5,
        step: 0.1
      },
      {
        id: 'employee_tier',
        name: 'Employee Count Tier',
        description: 'Factor based on number of employees',
        value: 1.0,
        type: BaseFactorType.TIER_BASED,
        applicableCoverages: ['bodily_injury', 'personal_injury', 'employee_benefits_liability']
      },
      {
        id: 'years_in_business_tier',
        name: 'Years in Business',
        description: 'Discount based on years in business',
        value: 1.0,
        type: BaseFactorType.TIER_BASED,
        applicableCoverages: ['bodily_injury', 'property_damage', 'products_completed_operations', 'personal_injury', 'advertising_injury', 'premises_liability']
      },
      {
        id: 'deductible_credit',
        name: 'Deductible Credit',
        description: 'Premium credit for selected deductible',
        value: 0,
        type: BaseFactorType.FIXED_AMOUNT,
        applicableCoverages: ['bodily_injury', 'property_damage', 'products_completed_operations', 'premises_liability'],
        minValue: 0,
        maxValue: 2000,
        step: 100
      }
    ];
  }

  private getMockCoverages(): Coverage[] {
    return [
      {
        id: 'bodily_injury',
        name: 'Bodily Injury Liability',
        description: 'Covers bodily injury to third parties',
        baseAmount: 500,
        selected: true,
        requiredFactors: ['revenue_rate'],
        optionalFactors: ['employee_rate', 'claims_history', 'safety_program', 'employee_tier', 'years_in_business_tier', 'deductible_credit'],
        limits: [
          { id: 'bl_1m', name: '$1 Million', amount: 1000000, adjustmentFactor: 1.0 },
          { id: 'bl_2m', name: '$2 Million', amount: 2000000, adjustmentFactor: 1.25 },
          { id: 'bl_3m', name: '$3 Million', amount: 3000000, adjustmentFactor: 1.45 },
          { id: 'bl_5m', name: '$5 Million', amount: 5000000, adjustmentFactor: 1.75 }
        ],
        selectedLimit: 'bl_1m'
      },
      {
        id: 'property_damage',
        name: 'Property Damage Liability',
        description: 'Covers damage to third-party property',
        baseAmount: 450,
        selected: true,
        requiredFactors: ['revenue_rate'],
        optionalFactors: ['square_footage_rate', 'claims_history', 'safety_program', 'construction_type', 'years_in_business_tier', 'deductible_credit'],
        limits: [
          { id: 'pd_1m', name: '$1 Million', amount: 1000000, adjustmentFactor: 1.0 },
          { id: 'pd_2m', name: '$2 Million', amount: 2000000, adjustmentFactor: 1.2 },
          { id: 'pd_3m', name: '$3 Million', amount: 3000000, adjustmentFactor: 1.4 },
          { id: 'pd_5m', name: '$5 Million', amount: 5000000, adjustmentFactor: 1.7 }
        ],
        selectedLimit: 'pd_1m'
      },
      {
        id: 'products_completed_operations',
        name: 'Products & Completed Operations',
        description: 'Covers injury or damage from products or completed work',
        baseAmount: 400,
        selected: false,
        requiredFactors: ['revenue_rate'],
        optionalFactors: ['claims_history', 'years_in_business_tier', 'deductible_credit'],
        limits: [
          { id: 'pco_1m', name: '$1 Million', amount: 1000000, adjustmentFactor: 1.0 },
          { id: 'pco_2m', name: '$2 Million', amount: 2000000, adjustmentFactor: 1.3 },
          { id: 'pco_3m', name: '$3 Million', amount: 3000000, adjustmentFactor: 1.5 },
          { id: 'pco_5m', name: '$5 Million', amount: 5000000, adjustmentFactor: 1.8 }
        ],
        selectedLimit: 'pco_1m'
      },
      {
        id: 'personal_injury',
        name: 'Personal Injury',
        description: 'Covers slander, libel, false arrest, etc.',
        baseAmount: 150,
        selected: false,
        requiredFactors: [],
        optionalFactors: ['employee_rate', 'claims_history', 'employee_tier', 'years_in_business_tier'],
        limits: [
          { id: 'pi_1m', name: '$1 Million', amount: 1000000, adjustmentFactor: 1.0 },
          { id: 'pi_2m', name: '$2 Million', amount: 2000000, adjustmentFactor: 1.15 },
          { id: 'pi_3m', name: '$3 Million', amount: 3000000, adjustmentFactor: 1.35 }
        ],
        selectedLimit: 'pi_1m'
      },
      {
        id: 'advertising_injury',
        name: 'Advertising Injury',
        description: 'Covers injuries from advertising activities',
        baseAmount: 125,
        selected: false,
        requiredFactors: [],
        optionalFactors: ['claims_history', 'years_in_business_tier'],
        limits: [
          { id: 'ai_1m', name: '$1 Million', amount: 1000000, adjustmentFactor: 1.0 },
          { id: 'ai_2m', name: '$2 Million', amount: 2000000, adjustmentFactor: 1.15 },
          { id: 'ai_3m', name: '$3 Million', amount: 3000000, adjustmentFactor: 1.35 }
        ],
        selectedLimit: 'ai_1m'
      },
      {
        id: 'premises_liability',
        name: 'Premises Liability',
        description: 'Covers injuries that occur on your premises',
        baseAmount: 350,
        selected: true,
        requiredFactors: ['square_footage_rate'],
        optionalFactors: ['claims_history', 'safety_program', 'construction_type', 'years_in_business_tier', 'deductible_credit'],
        limits: [
          { id: 'pl_1m', name: '$1 Million', amount: 1000000, adjustmentFactor: 1.0 },
          { id: 'pl_2m', name: '$2 Million', amount: 2000000, adjustmentFactor: 1.25 },
          { id: 'pl_3m', name: '$3 Million', amount: 3000000, adjustmentFactor: 1.45 },
          { id: 'pl_5m', name: '$5 Million', amount: 5000000, adjustmentFactor: 1.75 }
        ],
        selectedLimit: 'pl_1m'
      },
      {
        id: 'employee_benefits_liability',
        name: 'Employee Benefits Liability',
        description: 'Covers errors in employee benefits administration',
        baseAmount: 200,
        selected: false,
        requiredFactors: [],
        optionalFactors: ['employee_tier', 'years_in_business_tier'],
        limits: [
          { id: 'ebl_1m', name: '$1 Million', amount: 1000000, adjustmentFactor: 1.0 },
          { id: 'ebl_2m', name: '$2 Million', amount: 2000000, adjustmentFactor: 1.2 }
        ],
        selectedLimit: 'ebl_1m'
      }
    ];
  }

  private getMockTerritoryRatings(): TerritoryRating[] {
    return [
      { zipCodePrefix: '100', ratingFactor: 1.5, state: 'NY', riskLevel: 'high' },
      { zipCodePrefix: '102', ratingFactor: 1.45, state: 'NY', riskLevel: 'high' },
      { zipCodePrefix: '104', ratingFactor: 1.4, state: 'NY', riskLevel: 'high' },
      { zipCodePrefix: '200', ratingFactor: 1.25, state: 'DC', riskLevel: 'high' },
      { zipCodePrefix: '300', ratingFactor: 1.15, state: 'GA', riskLevel: 'medium' },
      { zipCodePrefix: '400', ratingFactor: 1.1, state: 'KY', riskLevel: 'medium' },
      { zipCodePrefix: '500', ratingFactor: 1.0, state: 'IA', riskLevel: 'low' },
      { zipCodePrefix: '600', ratingFactor: 1.2, state: 'IL', riskLevel: 'medium' },
      { zipCodePrefix: '700', ratingFactor: 1.0, state: 'LA', riskLevel: 'medium' },
      { zipCodePrefix: '800', ratingFactor: 0.95, state: 'CO', riskLevel: 'low' },
      { zipCodePrefix: '900', ratingFactor: 1.3, state: 'CA', riskLevel: 'high' }
    ];
  }

  // Continuation of premium-calculator.service.ts
// Mock data for industry classifications
private getMockIndustryClassifications(): IndustryClassification[] {
  return [
    {
      code: 'RETAIL001',
      name: 'Retail - General Merchandise',
      riskCategory: 'medium',
      baseRateFactor: 1.0,
      eligibleCoverages: ['bodily_injury', 'property_damage', 'products_completed_operations', 'personal_injury', 'advertising_injury', 'premises_liability', 'employee_benefits_liability']
    },
    {
      code: 'RETAIL002',
      name: 'Retail - Clothing & Accessories',
      riskCategory: 'low',
      baseRateFactor: 0.9,
      eligibleCoverages: ['bodily_injury', 'property_damage', 'products_completed_operations', 'personal_injury', 'advertising_injury', 'premises_liability', 'employee_benefits_liability']
    },
    {
      code: 'FOOD001',
      name: 'Restaurant - Full Service',
      riskCategory: 'high',
      baseRateFactor: 1.5,
      eligibleCoverages: ['bodily_injury', 'property_damage', 'products_completed_operations', 'personal_injury', 'advertising_injury', 'premises_liability', 'employee_benefits_liability']
    },
    {
      code: 'FOOD002',
      name: 'Restaurant - Limited Service',
      riskCategory: 'medium',
      baseRateFactor: 1.3,
      eligibleCoverages: ['bodily_injury', 'property_damage', 'products_completed_operations', 'personal_injury', 'advertising_injury', 'premises_liability', 'employee_benefits_liability']
    },
    {
      code: 'OFFICE001',
      name: 'Office - Professional Services',
      riskCategory: 'low',
      baseRateFactor: 0.8,
      eligibleCoverages: ['bodily_injury', 'property_damage', 'personal_injury', 'advertising_injury', 'premises_liability', 'employee_benefits_liability']
    },
    {
      code: 'CONTR001',
      name: 'Contractor - General',
      riskCategory: 'high',
      baseRateFactor: 1.7,
      eligibleCoverages: ['bodily_injury', 'property_damage', 'products_completed_operations', 'premises_liability']
    },
    {
      code: 'CONTR002',
      name: 'Contractor - Electrical',
      riskCategory: 'medium',
      baseRateFactor: 1.4,
      eligibleCoverages: ['bodily_injury', 'property_damage', 'products_completed_operations', 'premises_liability']
    },
    {
      code: 'MANUF001',
      name: 'Manufacturing - Light',
      riskCategory: 'medium',
      baseRateFactor: 1.2,
      eligibleCoverages: ['bodily_injury', 'property_damage', 'products_completed_operations', 'premises_liability', 'employee_benefits_liability']
    },
    {
      code: 'MANUF002',
      name: 'Manufacturing - Heavy',
      riskCategory: 'high',
      baseRateFactor: 1.6,
      eligibleCoverages: ['bodily_injury', 'property_damage', 'products_completed_operations', 'premises_liability', 'employee_benefits_liability']
    }
  ];
}

private getMockFactorTiers(): FactorTier[] {
  return [
    {
      id: 'employee_tier_factors',
      factorId: 'employee_tier',
      tiers: [
        { id: 'emp_tier_1', name: '1-5 Employees', minValue: 1, maxValue: 5, factor: 0.9 },
        { id: 'emp_tier_2', name: '6-15 Employees', minValue: 6, maxValue: 15, factor: 1.0 },
        { id: 'emp_tier_3', name: '16-25 Employees', minValue: 16, maxValue: 25, factor: 1.15 },
        { id: 'emp_tier_4', name: '26-50 Employees', minValue: 26, maxValue: 50, factor: 1.3 },
        { id: 'emp_tier_5', name: '51-100 Employees', minValue: 51, maxValue: 100, factor: 1.5 },
        { id: 'emp_tier_6', name: '100+ Employees', minValue: 101, maxValue: 99999, factor: 1.75 }
      ]
    },
    {
      id: 'revenue_tier_factors',
      factorId: 'revenue_tier',
      tiers: [
        { id: 'rev_tier_1', name: 'Under $100K', minValue: 0, maxValue: 100000, factor: 0.85 },
        { id: 'rev_tier_2', name: '$100K-$500K', minValue: 100001, maxValue: 500000, factor: 1.0 },
        { id: 'rev_tier_3', name: '$500K-$1M', minValue: 500001, maxValue: 1000000, factor: 1.2 },
        { id: 'rev_tier_4', name: '$1M-$5M', minValue: 1000001, maxValue: 5000000, factor: 1.4 },
        { id: 'rev_tier_5', name: '$5M-$10M', minValue: 5000001, maxValue: 10000000, factor: 1.6 },
        { id: 'rev_tier_6', name: 'Over $10M', minValue: 10000001, maxValue: 9999999999, factor: 1.8 }
      ]
    },
    {
      id: 'years_in_business_tier_factors',
      factorId: 'years_in_business_tier',
      tiers: [
        { id: 'years_tier_1', name: 'Less than 1 year', minValue: 0, maxValue: 1, factor: 1.25 },
        { id: 'years_tier_2', name: '1-3 years', minValue: 1, maxValue: 3, factor: 1.15 },
        { id: 'years_tier_3', name: '3-5 years', minValue: 3, maxValue: 5, factor: 1.05 },
        { id: 'years_tier_4', name: '5-10 years', minValue: 5, maxValue: 10, factor: 0.95 },
        { id: 'years_tier_5', name: '10+ years', minValue: 10, maxValue: 999, factor: 0.85 }
      ]
    }
  ];
}
}