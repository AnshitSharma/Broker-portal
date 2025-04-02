
import { Routes } from '@angular/router';
import { QuoteFormComponent } from './features/quote/quote-form/quote-form.component';
import { QuoteListComponent } from './features/quote/quote-list/quote-list.component';
import { QuoteDetailsComponent } from './features/quote/quote-details/quote-details.component';
import { InsuranceCodeComponent } from './insurance-quote/insurance-quote.component';
import { NextPageComponent } from './next-page/next-page.component';
import { FinalPageComponent } from './final-page/final-page.component';
import { CoverageDetailsComponent } from './coverage-details/coverage-details.component';
import { HomeComponent } from './home/home.component';
import { QuoteSummaryComponent } from './quote-summary/quote-summary.component';
import { QuoteCalculationComponent } from './quote-calculation/quote-calculation.component';



export const routes: Routes = [
  { path: 'quotes-list', component: QuoteListComponent },
  { path: 'quote-form/new', component: QuoteFormComponent },
  { path: 'quote-details/:id', component: QuoteDetailsComponent },
  { path: 'insurance', component: InsuranceCodeComponent },
  { path: 'next-page', component: NextPageComponent },
  { path: 'final-page', component: FinalPageComponent },
  { path: 'coverage-details', component: CoverageDetailsComponent },
  { path: 'quote-summary', component: QuoteSummaryComponent },
  { path: 'home', component: HomeComponent },
  { path: 'quote-calculation', component: QuoteCalculationComponent },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: '**', redirectTo: '/home' }
];