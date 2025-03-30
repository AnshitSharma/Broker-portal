import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  imports:[CommonModule,FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  constructor(private router: Router) {
    // No FontAwesome loading needed here
  }
  
  // Method for quote request form submission
  requestQuote(): void {
    // This would handle the quote request form submission
    console.log('Quote requested');
    this.router.navigate(['/insurance']);
  }
  
  // Method to navigate to different sections
  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
}


