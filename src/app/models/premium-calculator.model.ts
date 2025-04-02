// premium-calculator.model.ts

/**
 * Represents a base factor used in premium calculations
 */
export interface BaseFactor {
    id: string;
    name: string;
    description: string;
    value: number;
    type: BaseFactorType;
    applicableCoverages: string[]; // IDs of coverages this factor applies to
    minValue?: number;  // Optional min value for adjustable factors
    maxValue?: number;  // Optional max value for adjustable factors
    step?: number;      // Optional step for adjustable factors
  }
  
  /**
   * Types of base factors
   */
  export enum BaseFactorType {
    MULTIPLIER = 'multiplier',     // Simple multiplier to the base premium
    RATE = 'rate',                 // Rate per unit (e.g., per $1,000 of revenue)
    FIXED_AMOUNT = 'fixed_amount', // Fixed amount added to the premium
    PERCENTAGE = 'percentage',     // Percentage adjustment to the premium
    TIER_BASED = 'tier_based'      // Tier based adjustment (e.g., based on employee count)
  }
  
  /**
   * Coverage options available for selection
   */
  export interface Coverage {
    id: string;
    name: string;
    description: string;
    baseAmount: number;   // Base amount for this coverage
    selected: boolean;    // Whether this coverage is selected
    requiredFactors: string[]; // IDs of factors required for this coverage
    optionalFactors: string[]; // IDs of factors optional for this coverage
    limits?: CoverageLimit[]; // Available limit options
    selectedLimit?: string;   // ID of the selected limit
  }
  
  /**
   * Coverage limit options
   */
  export interface CoverageLimit {
    id: string;
    name: string;
    amount: number;
    adjustmentFactor: number; // Factor applied to premium based on limit choice
  }
  
  /**
   * Risk tiers for tier-based factors
   */
  export interface RiskTier {
    id: string;
    name: string;
    minValue: number;
    maxValue: number;
    factor: number;
  }
  
  /**
   * Factor ranges for tier-based calculations
   */
  export interface FactorTier {
    id: string;
    factorId: string; // Reference to the base factor this tier belongs to
    tiers: RiskTier[];
  }
  
  /**
   * Business information used for premium calculation
   */
  export interface BusinessInfo {
    annualRevenue: number;
    employeeCount: number;
    yearsInBusiness: number;
    industryCode: string;
    zipCode: string;
    buildingType: string;
    squareFootage: number;
    hasClaimHistory: boolean;
    claimCount?: number;
    claimAmount?: number;
  }
  
  /**
   * Territory rating data
   */
  export interface TerritoryRating {
    zipCodePrefix: string;
    ratingFactor: number;
    state: string;
    riskLevel: 'low' | 'medium' | 'high';
  }
  
  /**
   * Industry classification with risk ratings
   */
  export interface IndustryClassification {
    code: string;
    name: string;
    riskCategory: string;
    baseRateFactor: number;
    eligibleCoverages: string[]; // IDs of coverages available for this industry
  }
  
  /**
   * Premium calculation result
   */
  export interface PremiumCalculationResult {
    basePremium: number;
    adjustments: PremiumAdjustment[];
    subtotal: number;
    fees: Fee[];
    taxes: Tax[];
    totalAnnualPremium: number;
    monthlyPremium: number;
    coverageDetails: CoveragePremiumDetail[];
  }
  
  /**
   * Individual premium adjustment
   */
  export interface PremiumAdjustment {
    name: string;
    description: string;
    amount: number;
    factorId: string;
    adjustmentType: BaseFactorType;
  }
  
  /**
   * Fee applied to premium
   */
  export interface Fee {
    name: string;
    amount: number;
    isPercentage: boolean;
  }
  
  /**
   * Tax applied to premium
   */
  export interface Tax {
    name: string;
    rate: number;
    amount: number;
  }
  
  /**
   * Premium detail for a specific coverage
   */
  export interface CoveragePremiumDetail {
    coverageId: string;
    coverageName: string;
    basePremium: number;
    adjustedPremium: number;
    selectedLimit?: {
      name: string;
      amount: number;
    };
    adjustments: PremiumAdjustment[];
  }