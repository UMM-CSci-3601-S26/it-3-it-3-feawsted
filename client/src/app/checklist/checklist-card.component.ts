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
    const parts: string[] = [];
    parts.push(`${s.quantity}x`);
    if (s.count > 0) parts.push(`${s.count}ct.`);
    if (s.size && s.size !== 'N/A') {
      parts.push(`${s.size}${s.quantity > 1 ? 's' : ''} of`);
    }
    if (s.item) {
      parts.push(s.quantity > 1 && !s.item.endsWith('s') ? `${s.item}s` : s.item);
    }
    if (s.brand) parts.push(s.brand);
    if (s.color) parts.push(s.color);
    if (s.type) parts.push(s.type);
    if (s.material) parts.push(s.material);
    if (s.notes && s.notes !== 'N/A') {
      const cleanNotes = s.notes.replace(/\?|\(\?\)/g, '').trim();
      if (cleanNotes) parts.push(`(${cleanNotes})`);
    }
    return parts.join(' ');
  }
}
