import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class QuoteService {
  
  private mockQuotes = [
    {
      id: 1,
      createdDate: new Date('2024-03-15'),
      provider: { name: 'ICICI Prudential' },
      businessDetails: { coverageAmount: 1000000 },
      calculatedPremium: 598,
      status: 'pending'
    },
    {
      id: 2,
      createdDate: new Date('2024-02-28'),
      provider: { name: 'HDFC Life' },
      businessDetails: { coverageAmount: 2500000 },
      calculatedPremium: 749,
      status: 'revised'
    },
    {
      id: 3,
      createdDate: new Date('2024-01-10'),
      provider: { name: 'TATA AIA' },
      businessDetails: { coverageAmount: 5000000 },
      calculatedPremium: 1250,
      status: 'bound'
    }
  ];

  constructor() { }

  getQuotes(): Observable<any[]> {
    return of(this.mockQuotes);
  }

  calculateRate(formData: any): Observable<any> {
    return of({ success: true });
  }

  submitQuote(quoteData: any): Observable<any> {
    return of({ success: true, id: Math.floor(Math.random() * 1000) + 100 });
  }

  reviseQuote(revisionData: any): Observable<any> {
    return of({ success: true });
  }

  bindQuote(bindData: any): Observable<any> {
    return of({ success: true });
  }

  deleteQuote(quoteId: number): Observable<any> {
    return of({ success: true });
  }
}