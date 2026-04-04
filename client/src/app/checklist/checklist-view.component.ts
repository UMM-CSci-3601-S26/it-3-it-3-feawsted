// Angular imports
import { Component, OnInit, inject, signal } from '@angular/core';
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
// RxJS imports
import { catchError, of } from 'rxjs';

// Checklist Component and Service Import
import { Checklist } from './checklist';
import { ChecklistCardComponent } from './checklist-card.component';
import { ChecklistService } from './checklist.service';

@Component({
  selector: 'app-checklist',
  templateUrl: './checklist-view.component.html',
  styleUrls: ['./checklist-view.component.scss'],
  providers: [],
  imports: [
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatSelectModule,
    MatOptionModule,
    MatRadioModule,
    ChecklistCardComponent,
    MatListModule,
    MatButtonModule,
    MatTooltipModule,
    MatIconModule,
    ChecklistCardComponent
  ],
})

/**
 * Component for displaying the list of checklists and their requested supplies.
 * - Fetches checklist data from the ChecklistService and handles errors gracefully.
 * - Provides a method to download the checklist data as a CSV file.
 * - Uses Angular Material components for styling and layout.
 */
export class ChecklistViewComponent implements OnInit {
  private checklistService = inject(ChecklistService);

  checklists = signal<Checklist[]>([]);
  errored = signal(false);

  ngOnInit() {
    this.checklistService.getChecklists().pipe(
      catchError(() => {
        this.errored.set(true); return of([]);
      })
    ).subscribe(data => this.checklists.set(data));
  }

  generateChecklists() {
    this.checklistService.generateChecklists().pipe(
      catchError(() => {
        this.errored.set(true); return of([]);
      })
    ).subscribe(data => this.checklists.set(data));
  }

  /**
   * Method to download the checklist data as a CSV file. It calls the exportChecklists() method from the ChecklistService, creates a Blob from the CSV data, and triggers a download in the browser.
   * Handles the CSV export functionality by creating a temporary anchor element and simulating a click to download the file, then revokes the object URL to free up memory.
   */
  //   downloadCSV() {
  //     this.checklistService.exportChecklists().subscribe(csvData => {
  //       const blob = new Blob([csvData], { type: 'text/csv' });
  //       const url = window.URL.createObjectURL(blob);

  //       const a = document.createElement('a');
  //       a.href = url;
  //       a.download = 'checklists.csv';
  //       a.click();

//       window.URL.revokeObjectURL(url);
//     });
//   }
}
