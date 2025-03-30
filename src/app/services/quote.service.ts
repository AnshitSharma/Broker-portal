import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class QuoteService {
  // For demo purposes, we'll use in-memory data
  // In a real application, this would interact with a backend API
  private quotes: any[] = [
    {
      id: 1001,
      createdDate: new Date('2025-02-15'),
      status: 'pending',
      personalDetails: {
        firstName: 'Rahul',
        lastName: 'Sharma',
        email: 'rahul.sharma@example.com',
        phone: '9876543210',
        dob: new Date('1985-06-10'),
        gender: 'male',
        smoker: false
      },
      businessDetails: {
        coverageType: 'term',
        coverageAmount: '10000000',
        coverageTerm: '20',
        occupation: 'Software Engineer',
        annualIncome: '1500000',
        existingMedicalConditions: false
      },
      provider: {
        id: 1,
        name: 'ICICI Prudential'
      },
      calculatedPremium: 598
    },
    {
      id: 1002,
      createdDate: new Date('2025-03-01'),
      status: 'revised',
      personalDetails: {
        firstName: 'Priya',
        lastName: 'Patel',
        email: 'priya.patel@example.com',
        phone: '8765432109',
        dob: new Date('1990-01-15'),
        gender: 'female',
        smoker: false
      },
      businessDetails: {
        coverageType: 'term',
        coverageAmount: '5000000',
        coverageTerm: '15',
        occupation: 'Doctor',
        annualIncome: '2200000',
        existingMedicalConditions: false
      },
      provider: {
        id: 2,
        name: 'HDFC Life'
      },
      calculatedPremium: 749
    },
    {
      id: 1003,
      createdDate: new Date('2025-03-20'),
      status: 'bound',
      personalDetails: {
        firstName: 'Amit',
        lastName: 'Kumar',
        email: 'amit.kumar@example.com',
        phone: '7654321098',
        dob: new Date('1980-09-22'),
        gender: 'male',
        smoker: true
      },
      businessDetails: {
        coverageType: 'whole',
        coverageAmount: '20000000',
        coverageTerm: '30',
        occupation: 'Business Owner',
        annualIncome: '3500000',
        existingMedicalConditions: true
      },
      provider: {
        id: 4,
        name: 'TATA AIA'
      },
      calculatedPremium: 649,
      bindRequestDate: new Date('2025-03-22')
    }
  ];

  constructor(private http: HttpClient) { }

  // Get all quotes
  getQuotes(): Observable<any[]> {
    // Simulate API call
    return of(this.quotes).pipe(delay(500));
  }

  // Calculate rate for quote
  calculateRate(quoteData: any): Observable<any> {
    // Simulate rate calculation
    // In a real app, this would be a complex calculation based on user data
    return of({
      rates: [
        { providerId: 1, premium: 598 },
        { providerId: 2, premium: 749 },
        { providerId: 3, premium: 659 },
        { providerId: 4, premium: 649 }
      ]
    }).pipe(delay(800));
  }

  // Submit a new quote
  submitQuote(quoteData: any): Observable<any> {
    // Generate a new ID
    const newId = Math.max(...this.quotes.map(q => q.id)) + 1;
    
    // Create the new quote
    const newQuote = {
      ...quoteData,
      id: newId,
      createdDate: new Date()
    };
    
    // Add to our in-memory database
    this.quotes.push(newQuote);
    
    // Simulate API response
    return of({ success: true, quoteId: newId }).pipe(delay(1000));
  }

  // Revise an existing quote
  reviseQuote(quoteData: any): Observable<any> {
    // Find the quote to update
    const index = this.quotes.findIndex(q => q.id === quoteData.id);
    
    if (index !== -1) {
      // Update the quote
      this.quotes[index] = {
        ...quoteData,
        revisedDate: new Date()
      };
    }
    
    // Simulate API response
    return of({ success: true }).pipe(delay(1000));
  }

  // Bind a quote
  bindQuote(bindData: any): Observable<any> {
    // Find the quote to bind
    const index = this.quotes.findIndex(q => q.id === bindData.quoteId);
    
    if (index !== -1) {
      // Update the quote status
      this.quotes[index] = {
        ...this.quotes[index],
        status: 'bound',
        bindRequestDate: bindData.bindRequestDate,
        bindComments: bindData.comments
      };
    }
    
    // Simulate API response
    return of({ success: true }).pipe(delay(1000));
  }

  // Delete a quote
  deleteQuote(quoteId: number): Observable<any> {
    // Remove the quote from our in-memory database
    this.quotes = this.quotes.filter(q => q.id !== quoteId);
    
    // Simulate API response
    return of({ success: true }).pipe(delay(500));
  }
}