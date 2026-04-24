// Angular and Material Imports
import { Component, input, signal, inject, output} from '@angular/core';
import { FamilyService } from './family.service';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';

// Family Interface Import
import { Family } from './family';

@Component({
  selector: 'app-family-card',
  templateUrl: './family-card.component.html',
  styleUrls: ['./family-card.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatListModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule
  ]
})

// Component for displaying a card with family information and their requested supplies.
// The component takes a Family object as input and renders the details in a user-friendly format.
export class FamilyCardComponent {
  private familyService = inject(FamilyService);

  familyUpdated = output<Family>();

  family = input.required<Family>();

  isEditing = signal(false);

  // A writable signal to hold draft changes
  editForm = signal<Family | null>(null);

  startEditing() {
    // Create a deep copy so we don't edit the original input directly
    this.editForm.set(JSON.parse(JSON.stringify(this.family())));
    this.isEditing.set(true);
  }

  cancelEdit() {
    this.isEditing.set(false);
    this.editForm.set(null);
  }

  saveEdit() {
    const updatedData = this.editForm();

    if (updatedData && updatedData._id) {
      this.familyUpdated.emit(updatedData);
      this.isEditing.set(false);
    }
  }




  getAvailableTimes(): string {
    const a = this.family().timeAvailability;
    if (!a) {
      return 'None';
    }
    const times: string[] = [];
    if (a.earlyMorning) {
      times.push('Early Morning');
    }
    if (a.lateMorning) {
      times.push('Late Morning');
    }
    if (a.earlyAfternoon) {
      times.push('Early Afternoon');
    }
    if (a.lateAfternoon) {
      times.push('Late Afternoon');
    }
    return times.length ? times.join(', ') : 'None';
  }

  // Add these inside your FamilyCardComponent class
  addStudent() {
    const current = this.editForm();
    if (current) {
    // We update the signal by creating a new array with a blank student
      this.editForm.set({
        ...current,
        students: [
          ...(current.students ?? []),
          { name: '', grade: '', school: '', requestedSupplies: [] }
        ]
      });
    }
  }

  removeStudent(index: number) {
    const current = this.editForm();
    if (current && current.students) {
      const updatedStudents = [...current.students];
      updatedStudents.splice(index, 1);
      this.editForm.set({
        ...current,
        students: updatedStudents
      });
    }
  }
}
