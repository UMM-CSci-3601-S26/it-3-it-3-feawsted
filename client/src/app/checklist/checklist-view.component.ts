// Angular imports
import { Component, inject, signal } from '@angular/core';
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
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
// RxJS imports
import { catchError, combineLatest, debounceTime, of, switchMap } from 'rxjs';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';

import { jsPDF } from 'jspdf';

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
  ],
})

/**
 * Component for displaying the list of checklists and their requested supplies.
 * - Uses reactive signals and combineLatest for server-side filtering by studentName, school, and grade.
 * - Provides a method to generate checklists from current family data and refresh the view.
 * - Uses Angular Material components for styling and layout.
 */
export class ChecklistViewComponent {
  private checklistService = inject(ChecklistService);
  private snackBar = inject(MatSnackBar);

  studentName = signal<string | undefined>(undefined);
  school = signal<string | undefined>(undefined);
  grade = signal<string | undefined>(undefined);
  refreshTrigger = signal(0);

  errMsg = signal<string | undefined>(undefined);

  private studentName$ = toObservable(this.studentName);
  private school$ = toObservable(this.school);
  private grade$ = toObservable(this.grade);
  private refresh$ = toObservable(this.refreshTrigger);

  serverFilteredChecklists = toSignal(
    combineLatest([this.studentName$, this.school$, this.grade$, this.refresh$]).pipe(
      debounceTime(300),
      switchMap(([studentName, school, grade]) =>
        this.checklistService.getChecklists({ studentName, school, grade })
      ),
      catchError((err) => {
        if (!(err.error instanceof ErrorEvent)) {
          this.errMsg.set(
            `Problem contacting the server – Error Code: ${err.status}\nMessage: ${err.message}`
          );
        }
        this.snackBar.open(this.errMsg() ?? '', 'OK', { duration: 6000 });
        return of<Checklist[]>([]);
      })
    ),
    { initialValue: [] as Checklist[] }
  );

  generateChecklists() {
    this.checklistService.generateChecklists().pipe(
      catchError(() => {
        this.errMsg.set('Failed to generate checklists.');
        this.snackBar.open(this.errMsg() ?? '', 'OK', { duration: 6000 });
        return of([]);
      })
    ).subscribe(() => {
      this.refreshTrigger.update(v => v + 1);
    });
  }

  resetFilters() {
    this.studentName.set(undefined);
    this.school.set(undefined);
    this.grade.set(undefined);
  }

  downloadCSV() {
    this.checklistService.printAllChecklists().subscribe(checklists => {
      const doc = new jsPDF();

      let y = 10;

      checklists.forEach(c => {
        doc.text(`Student: ${c.studentName} (${c.school}, Grade ${c.grade})`, 10, y);
        y += 8;

        c.checklist.forEach(item => {
          doc.text(
            ` - ${item.supply} | completed: ${item.completed} | unreceived: ${item.unreceived} | option: ${item.selectedOption}`,
            10,
            y
          );
          y += 6;
        });

        y += 10;
      });

      doc.save('checklists.pdf');
    });
  }
}
