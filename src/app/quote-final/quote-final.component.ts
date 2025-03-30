// quote-final.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { QuoteService } from '../services/quote.service';
import { debounceTime } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-quote-final',
  templateUrl: './quote-final.component.html',
  styleUrls: ['./quote-final.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule
  ],
  providers: [QuoteService] 
})
export class QuoteFinalComponent implements OnInit {
  quoteForm: FormGroup = this.createForm(); // Initialize directly to fix TS2564 error
  quoteList: any[] = [];
  filteredQuoteList: any[] = [];
  
  // Pagination variables
  currentPage = 1;
  itemsPerPage = 5;
  totalItems = 0;
  
  // Filter and sort variables
  statusFilter = 'all';
  sortField = 'createdDate';
  sortOrder = 'desc';
  
  // View state variables
  isLoading = false;
  viewMode = 'list'; // 'list', 'new', 'revise', 'bind'
  selectedQuote: any = null;

  // Math property for template usage
  Math = Math; // Add this to fix Math.ceil error
  
  // Provider data (would typically come from an API)
  providers = [
    { 
      id: 1, 
      name: 'ICICI Prudential', 
      planName: 'iProtect Smart',
      coverAmount: '₹ 1 Cr',
      claimSettlement: '99.17%',
      price: '₹ 598/month',
      maxLimit: '99 yrs',
      benefits: [
        'Highest claims settled worth ₹1950 Crores in FY22',
        '100% payout on Terminal illness free',
        'Waiver of premium on permanent accidental disability free'
      ],
      discount: '₹3.5 K',
      calculatedPremium: 598 // Add this property to fix the error
    },
    { 
      id: 2, 
      name: 'HDFC Life', 
      planName: 'Click 2 Protect Super',
      coverAmount: '₹ 1 Cr',
      claimSettlement: '99.5%',
      price: '₹ 749/month',
      maxLimit: '85 yrs',
      benefits: [
        'Early Payout On Terminal Illness free',
        'Extend your policy at Maturity free'
      ],
      discount: '₹4.4 K',
      calculatedPremium: 749 // Add this property to fix the error
    },
    { 
      id: 3, 
      name: 'AXIS MAX', 
      planName: 'Smart Term Plan Plus',
      coverAmount: '₹ 1 Cr',
      claimSettlement: '99.7%',
      price: '₹ 659/month',
      maxLimit: '85 yrs',
      benefits: [
        'Early payout on Terminal Illness free',
        'Lifeline Plus(Option to increase life cover) free',
        'Option to delay 12 Months Premium free'
      ],
      discount: '',
      calculatedPremium: 659 // Add this property to fix the error
    },
    { 
      id: 4, 
      name: 'TATA AIA', 
      planName: 'Sampoorna Raksha Promise',
      coverAmount: '₹ 1 Cr',
      claimSettlement: '99.13%',
      price: '₹ 649/month',
      maxLimit: '100 yrs',
      benefits: [],
      discount: '₹8.8 K',
      calculatedPremium: 649 // Add this property to fix the error
    }
  ];

  constructor(
    private fb: FormBuilder,
    private quoteService: QuoteService
  ) { }

  ngOnInit(): void {
    this.initializeForm();
    this.loadQuotes();
    
    // Apply debounce to form changes to avoid excessive API calls
    this.quoteForm.valueChanges
      .pipe(debounceTime(500))
      .subscribe(() => {
        if (this.viewMode === 'new' || this.viewMode === 'revise') {
          this.calculateRate();
        }
      });
  }

  // Helper method to create the form - used for initialization
  private createForm(): FormGroup {
    return this.fb.group({
      personalDetails: this.fb.group({
        firstName: ['', Validators.required],
        lastName: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
        dob: ['', Validators.required],
        gender: ['', Validators.required],
        smoker: [false]
      }),
      businessDetails: this.fb.group({
        coverageType: ['term', Validators.required],
        coverageAmount: ['1000000', Validators.required],
        coverageTerm: ['20', Validators.required],
        occupation: ['', Validators.required],
        annualIncome: ['', [Validators.required, Validators.min(100000)]],
        existingMedicalConditions: [false]
      }),
      additionalInfo: this.fb.group({
        familyHistory: [''],
        hobbies: [''],
        travelPlans: ['']
      }),
      selectedProvider: ['']
    });
  }

  initializeForm(): void {
    this.quoteForm = this.createForm();
  }

  loadQuotes(): void {
    this.isLoading = true;
    
    // This would typically be an API call
    this.quoteService.getQuotes().subscribe({
      next: (quotes) => {
        this.quoteList = quotes;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading quotes', error);
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.quoteList];
    
    // Apply status filter
    if (this.statusFilter !== 'all') {
      filtered = filtered.filter(quote => quote.status === this.statusFilter);
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      const valueA = a[this.sortField];
      const valueB = b[this.sortField];
      
      if (typeof valueA === 'string') {
        return this.sortOrder === 'asc' 
          ? valueA.localeCompare(valueB) 
          : valueB.localeCompare(valueA);
      } else {
        return this.sortOrder === 'asc' 
          ? valueA - valueB 
          : valueB - valueA;
      }
    });
    
    this.totalItems = filtered.length;
    
    // Apply pagination
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    this.filteredQuoteList = filtered.slice(startIndex, startIndex + this.itemsPerPage);
  }

  calculateRate(): void {
    if (this.quoteForm.valid) {
      const formData = this.quoteForm.value;
      
      // This would typically be an API call
      this.quoteService.calculateRate(formData).subscribe({
        next: (rates) => {
          // In a real app, this would come from the API
          // For demo purposes, we're using our static providers data
          this.providers.forEach(provider => {
            // Update calculated premium
            provider.calculatedPremium = this.getRandomPremium(provider);
          });
        },
        error: (error) => {
          console.error('Error calculating rates', error);
        }
      });
    }
  }

  // Helper method to generate random premium amounts for demo
  getRandomPremium(provider: any): number {
    const basePrice = parseInt(provider.price.replace(/[^0-9]/g, ''));
    const variance = Math.random() * 100 - 50; // +/- 50
    return Math.round(basePrice + variance);
  }

  createNewQuote(): void {
    this.viewMode = 'new';
    this.initializeForm();
  }

  submitQuote(): void {
    if (this.quoteForm.valid) {
      this.isLoading = true;
      const quoteData = {
        ...this.quoteForm.value,
        status: 'pending',
        createdDate: new Date()
      };
      
      this.quoteService.submitQuote(quoteData).subscribe({
        next: (response) => {
          this.loadQuotes();
          this.viewMode = 'list';
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error submitting quote', error);
          this.isLoading = false;
        }
      });
    } else {
      // Mark all fields as touched to show validation errors
      this.markFormGroupTouched(this.quoteForm);
    }
  }

  reviseQuote(quote: any): void {
    this.selectedQuote = quote;
    this.viewMode = 'revise';
    
    // Populate form with existing quote data
    this.quoteForm.patchValue(quote);
  }

  submitRevision(): void {
    if (this.quoteForm.valid && this.selectedQuote) {
      this.isLoading = true;
      const revisionData = {
        ...this.selectedQuote,
        ...this.quoteForm.value,
        status: 'revised',
        revisedDate: new Date()
      };
      
      this.quoteService.reviseQuote(revisionData).subscribe({
        next: (response) => {
          this.loadQuotes();
          this.viewMode = 'list';
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error submitting revision', error);
          this.isLoading = false;
        }
      });
    } else {
      // Mark all fields as touched to show validation errors
      this.markFormGroupTouched(this.quoteForm);
    }
  }

  bindQuote(quote: any): void {
    this.selectedQuote = quote;
    this.viewMode = 'bind';
  }

  submitBindRequest(comments: string): void {
    if (this.selectedQuote) {
      this.isLoading = true;
      const bindData = {
        quoteId: this.selectedQuote.id,
        comments: comments,
        bindRequestDate: new Date()
      };
      
      this.quoteService.bindQuote(bindData).subscribe({
        next: (response) => {
          this.loadQuotes();
          this.viewMode = 'list';
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error binding quote', error);
          this.isLoading = false;
        }
      });
    }
  }

  deleteQuote(quoteId: number): void {
    if (confirm('Are you sure you want to delete this quote?')) {
      this.isLoading = true;
      
      this.quoteService.deleteQuote(quoteId).subscribe({
        next: (response) => {
          this.loadQuotes();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error deleting quote', error);
          this.isLoading = false;
        }
      });
    }
  }

  // Helper function to mark all form controls as touched
  markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  // Pagination methods
  changePage(page: number): void {
    this.currentPage = page;
    this.applyFilters();
  }

  // Filter and sort methods
  changeStatusFilter(status: string): void {
    this.statusFilter = status;
    this.currentPage = 1; // Reset to first page when filtering
    this.applyFilters();
  }

  changeSorting(field: string): void {
    if (this.sortField === field) {
      // Toggle sort order if clicking the same field
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortOrder = 'asc';
    }
    
    this.applyFilters();
  }

  cancelAction(): void {
    this.viewMode = 'list';
    this.selectedQuote = null;
  }
}