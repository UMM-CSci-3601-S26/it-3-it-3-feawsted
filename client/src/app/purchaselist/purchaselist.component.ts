//Angular Imports
import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatTreeModule } from '@angular/material/tree';
import { MatExpansionModule } from '@angular/material/expansion';
import { CommonModule } from '@angular/common';
// import { RouterLink } from '@angular/router';

// RxJS Imports
import { of } from 'rxjs';

// Purchase List Imports
import { PurchaselistService } from './purchaselist.service';
import { catchError } from 'rxjs/internal/operators/catchError';

@Component({
  selector: 'app-purchaselist-component',
  standalone: true,
  templateUrl: './purchaselist.component.html',
  styleUrls: ['./purchaselist.component.scss'],
  imports: [
    MatTableModule,
    MatSortModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatSelectModule,
    MatOptionModule,
    MatRadioModule,
    MatListModule,
    MatButtonModule,
    MatTooltipModule,
    MatIconModule,
    MatTreeModule,
    MatExpansionModule,
    MatIconModule,
    MatButtonModule,
    CommonModule,
  ], //RouterLink
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class PurchaselistComponent {


  private checklistService = inject(ChecklistService);
  private snackBar = inject(MatSnackBar);

  ErrMsg = signal<string | undefined>(undefined);
  // Define the columns to be displayed in the table, including an 'actions' column for the menu
  generatePurchaselist() {
    this.purchaselistService.generatePurchaselist().pipe(
      catchError(() => {
        this.errMsg.set('Failed to generate purchaselist.');
        this.snackBar.open(this.errMsg() ?? '', 'OK', { duration: 6000 });
        return of([]);
      })
    ).subscribe(() => {
      this.refreshTrigger.update(v => v + 1);
    });
  }
}
export { PurchaselistService };
