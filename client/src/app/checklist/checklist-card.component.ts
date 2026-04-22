// Angular and Material Imports
import { Component, inject, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';

// Checklist Interface Import
import { Checklist } from './checklist';
import { SupplyList } from '../supplylist/supplylist';
import { supplyToLabel } from './checklist-label';
import { ChecklistService } from './checklist.service';

// PDF generation
import jsPDF from 'jspdf';

@Component({
  selector: 'app-checklist-card',
  templateUrl: './checklist-card.component.html',
  styleUrls: ['./checklist-card.component.scss'],
  imports: [
    MatCardModule,
    MatButtonModule,
    MatDividerModule,
    MatListModule,
    CommonModule,
    MatIconModule
  ]
})

// Component for displaying a card with checklist information and their requested supplies.
// The component takes a Checklist object as input and renders the details in a user-friendly format.
export class ChecklistCardComponent {
  private checklistService = inject(ChecklistService);
  private snackBar = inject(MatSnackBar);
  //private route = inject(ActivatedRoute);
  checklist = input.required<Checklist>();

  toLabel(s: SupplyList): string {
    return supplyToLabel(s);
  }

  downloadPDFforIndividualChecklist() {
    console.log('Checklist ID being sent:', this.checklist()._id);
    this.checklistService.printIndividualChecklist(this.checklist()._id).subscribe({
      error: (err) => {
        this.snackBar.open(`Failed to load checklist: ${err.message}`, 'OK', { duration: 6000 });
      },
      next: (checklist) => {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 14;
        const checkSize = 4;
        const lineHeight = 7;

        // Header block
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('Supply Checklist', margin, 18);

        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.text(`Student: ${checklist.studentName}`, margin, 28);
        doc.text(`Guardian: ${checklist.guardianName}`, margin, 36);
        doc.text(`Alt Pickup: ${checklist.altPickUp}`, margin, 44);
        doc.text(`School:  ${checklist.school}`, margin, 51);
        doc.text(`Grade:   ${checklist.grade}`, margin, 58);

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

        doc.save('checklist.pdf');
      }
    });
  }
}
