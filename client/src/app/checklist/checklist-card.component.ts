// Angular and Material Imports
import { Component, input} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { CommonModule } from '@angular/common';

// Checklist Interface Import
import { Checklist } from './checklist';
import { SupplyList } from '../supplylist/supplylist';
import { supplyToLabel } from './checklist-label';

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
  checklist = input.required<Checklist>();

  toLabel(s: SupplyList): string {
    return supplyToLabel(s);
  }
}
