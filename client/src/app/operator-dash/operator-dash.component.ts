// Angular Imports
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatCard, MatCardTitle, MatCardContent } from "@angular/material/card";

// RxJS Imports
import { catchError, of } from 'rxjs';

// App Imports
import { FamilyService } from '../family/family.service';
import { DashboardStats } from '../family/family';

@Component({
  selector: 'app-operator-dash',
  imports: [
    CommonModule,
    MatCard,
    MatCardTitle,
    MatCardContent
  ],
  templateUrl: './operator-dash.component.html',
  styleUrl: './operator-dash.component.scss',
})

/**
 * The OperatorDashComponent is responsible for displaying key statistics related to the family dashboard.
 * It uses the FamilyService to fetch the dashboard statistics and displays them in a user-friendly format.
 * The component handles loading states and potential errors gracefully, ensuring a smooth user experience.
 * The use of Angular Material components enhances the visual appeal and consistency of the dashboard.
 */

export class OperatorDashComponent  {
  private familyService = inject(FamilyService);

  // Signal to hold the dashboard statistics, with error handling to return undefined in case of an error
  dashboardStats = toSignal<DashboardStats | undefined>(
    this.familyService.getDashboardStats().pipe(
      catchError(() => of(undefined))
    )
  );
}
