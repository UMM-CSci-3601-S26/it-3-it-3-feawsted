// Angular and Material Imports
import { Component, input, signal, output} from '@angular/core';

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
  family = input.required<Family>();


  familyUpdated = output<Family>();

  // State management
  isEditing = signal(false);

  // A writable signal to hold draft changes
  editForm = signal<Family | null>(null);

  startEditing() {
    // Create a deep copy so we don't accidentally mutate the input
    this.editForm.set(JSON.parse(JSON.stringify(this.family())));
    this.isEditing.set(true);
  }

  cancelEdit() {
    this.isEditing.set(false);
    this.editForm.set(null);
  }

  saveEdit() {
    const updated = this.editForm();
    if (updated) {
      this.familyUpdated.emit(updated);
    }
    this.isEditing.set(false);
  }


  /*  editingFamilyId: string | null = null;
  private editingBackup: Family | null = null;
  private readonly NEW_FAMILY_ID = '__new__';

  startEdit(family: Family) {
    this.editingFamilyId = family._id ?? null;
    this.editingBackup = JSON.parse(JSON.stringify(family));
  }

  /**
     * Saves the edited row by calling the PUT endpoint,
     * then exits edit mode.
     */
  /*  saveEdit(family: Family) {
    if (!family._id) {
      return;
    }
    if (family._id === this.NEW_FAMILY_ID) {
      // New row: POST to create it, then store the real _id assigned by the server
      const { _id: _discarded, ...newItem } = family; // eslint-disable-line @typescript-eslint/no-unused-vars
      this.familyService.addFamily(newItem).subscribe({
        next: (id) => {
          family._id = id;
          this.editingFamilyId = null;
          this.editingBackup = null;
        },
        error: (err) => {
          this.errMsg.set(`Problem adding item – Error Code: ${err.status}\nMessage: ${err.message}`);
        }
      });
    } else {
      this.familyService.editFamily(family._id, family).subscribe({
        next: () => {
          this.editingFamilyId = null;
          this.editingBackup = null;
        },
        error: (err) => {
          this.errMsg.set(`Problem saving item – Error Code: ${err.status}\nMessage: ${err.message}`);
        }
      });
    }
  }

  /**
     * Cancels editing, reverting the row to its original values.
     *//*
     // cancelEdit(family: Family) {
    if (family._id === this.NEW_FAMILY_ID) {
      // Discard the unsaved new row entirely
      this.dataSource.data = this.dataSource.data.filter(i => i._id !== this.NEW_FAMILY_ID);
    } else if (this.editingBackup) {
      Object.assign(family, this.editingBackup);
    }
    this.editingFamilyId = null;
    this.editingBackup = null;
  } */

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
