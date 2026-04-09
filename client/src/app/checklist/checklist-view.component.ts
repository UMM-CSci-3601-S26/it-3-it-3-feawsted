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

// PDF generation
import jsPDF from 'jspdf';

// Checklist Component and Service Import
import { Checklist } from './checklist';
import { ChecklistCardComponent } from './checklist-card.component';
import { ChecklistService } from './checklist.service';
import { supplyToLabel } from './checklist-label';

@Component({
  selector: 'app-checklist',
  standalone: true,
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
    MatIconModule
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

  downloadPDF() {
    this.checklistService.printAllChecklists().subscribe({
      error: (err) => {
        this.snackBar.open(`Failed to load checklists: ${err.message}`, 'OK', { duration: 6000 });
      },
      next: (checklists) => {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 14;
        const checkSize = 4;
        const lineHeight = 7;

        checklists.forEach((checklist, index) => {
          if (index > 0) {
            doc.addPage();
          }

          // Header block
          doc.setFontSize(16);
          doc.setFont('helvetica', 'bold');
          doc.text('Supply Checklist', margin, 18);

          doc.setFontSize(11);
          doc.setFont('helvetica', 'normal');
          doc.text(`Student: ${checklist.studentName}`, margin, 28);
          doc.text(`School:  ${checklist.school}`, margin, 35);
          doc.text(`Grade:   ${checklist.grade}`, margin, 42);

          doc.setLineWidth(0.4);
          doc.line(margin, 46, pageWidth - margin, 46);

          // Items with checkboxes
          let y = 54;
          checklist.checklist.forEach(item => {
            const label = supplyToLabel(item.supply);
            const lines = doc.splitTextToSize(label, pageWidth - margin - 20) as string[];
            const blockHeight = lines.length * lineHeight;

            if (y + blockHeight > doc.internal.pageSize.getHeight() - 14) {
              doc.addPage();
              y = 20;
            }

            // Checkbox square — centred vertically with the first line of text
            doc.rect(margin, y - checkSize + 1, checkSize, checkSize);

            // Label text starting after the checkbox
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text(lines, margin + checkSize + 3, y);

            y += blockHeight + 3;
          });
        });

        doc.save('checklists.pdf');
      }
    });
  }
}
