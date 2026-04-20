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

  // Emit the updated family object to the parent component
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

}
