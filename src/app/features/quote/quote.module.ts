import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { QuoteFormComponent } from './quote-form/quote-form.component';
import { QuoteListComponent } from './quote-list/quote-list.component';
import { QuoteDetailsComponent } from './quote-details/quote-details.component';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [
    QuoteFormComponent,
    QuoteListComponent,
    QuoteDetailsComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule
  ],
  exports: [
    QuoteFormComponent,
    QuoteListComponent,
    QuoteDetailsComponent
  ]
})
export class QuoteModule { }
