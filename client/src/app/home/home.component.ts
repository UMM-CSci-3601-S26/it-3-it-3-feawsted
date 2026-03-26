import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-home-component',
  templateUrl: 'home.component.html',
  styleUrls: ['./home.component.scss'],
  providers: [],
  imports: [MatCardModule]
})
export class HomeComponent {
  /**
   * Things to add to the home page:
   * - A welcome message
   * - A brief description of the application and its purpose
   * - Links to important sections of the application (e.g., dashboard, family management, etc.)
   * - A call-to-action encouraging users to explore the application further
   * - Any relevant news or updates about the application
   * - Contact information for support or feedback
   */
}
