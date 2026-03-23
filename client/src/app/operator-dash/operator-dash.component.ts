import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FamilyService } from '../family/family.service';
import { catchError, of } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { DashboardStats } from '../family/family';
import { MatCard, MatCardTitle, MatCardContent } from "@angular/material/card";

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
export class OperatorDashComponent  {
  private familyService = inject(FamilyService);

  dashboardStats = toSignal <DashboardStats | undefined>(
    this.familyService.getDashboardStats().pipe(
      catchError(() => of(undefined))
    )
  );
}
