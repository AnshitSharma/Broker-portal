import { Component, OnInit, HostListener } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  isLoggedIn: boolean = false; // Simulating authentication state
  isScrolled: boolean = false;
  searchQuery: string = '';
  currentRoute: string = '';

  constructor(private router: Router) {
    // Subscribe to router events to highlight active route
    this.router.events.subscribe(() => {
      this.currentRoute = this.router.url;
    });
  }

  ngOnInit(): void {
    // Check if user is already logged in from localStorage
    const savedLoginState = localStorage.getItem('isLoggedIn');
    if (savedLoginState) {
      this.isLoggedIn = JSON.parse(savedLoginState);
    }
  }

  // Add scroll listener for navbar effects
  @HostListener('window:scroll')
  onWindowScroll(): void {
    const scrollPosition = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    this.isScrolled = scrollPosition > 50;
    
    // Add class to navbar for scroll effect
    const navbar = document.querySelector('.navbar');
    if (navbar) {
      if (this.isScrolled) {
        navbar.classList.add('navbar-scrolled');
      } else {
        navbar.classList.remove('navbar-scrolled');
      }
    }
  }

  toggleAuth(): void {
    this.isLoggedIn = !this.isLoggedIn;
    
    // Save login state to localStorage
    localStorage.setItem('isLoggedIn', JSON.stringify(this.isLoggedIn));
    
    if (!this.isLoggedIn) {
      this.router.navigate(['/home']);
    }
  }

  // Method to handle search
  searchQuotes(): void {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/quotes'], { 
        queryParams: { search: this.searchQuery }
      });
    }
  }

  // Determine if route is active for styling
  isRouteActive(route: string): boolean {
    return this.currentRoute.includes(route);
  }
}