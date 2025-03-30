import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/navbar/navbar.component';
import { InsuranceCodeComponent } from './insurance-quote/insurance-quote.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet,NavbarComponent,InsuranceCodeComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'broker-portal';
}
