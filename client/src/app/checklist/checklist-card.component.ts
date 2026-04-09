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

  private attrLabel(attr: { allOf: string[]; anyOf: string[] } | undefined): string {
    if (!attr) return '';
    return [...(attr.allOf ?? []), ...(attr.anyOf ?? [])].filter(Boolean).join('/');
  }

  toLabel(s: SupplyList): string {
    let label = '';
    // Quantity
    if (s.quantity > 0) {
      label += s.quantity + ' ';
    }
    // Count (e.g., 24ct)
    if (s.count > 1) {
      label += s.count + 'ct ';
    }
    // Size
    if (s.size && s.size !== 'N/A') {
      label += s.size;
      if (s.quantity > 1) {
        label += 's';
      }
      label += ' of ';
    }
    // Item (pluralize if quantity > 1)
    if (s.item && s.item.length > 0) {
      label += s.item.join(' or ');
      if (s.quantity > 1 && s.item.length === 1 && !s.item[0].endsWith('s')) {
        label += 's';
      }
      label += ' ';
    }
    // Format allOf for each attribute
    const allOfStr = [
      this.formatAllOf(s.type, ''),
      this.formatAllOf(s.color, ''),
      this.formatAllOf(s.brand, ''),
      this.formatAllOf(s.material, ''),
      this.formatAllOf(s.style, '')
    ].filter(Boolean).join(', ');
    if (allOfStr) {
      label += allOfStr;
    }
    // Format anyOf for each attribute
    const anyOfStr = [
      this.formatAnyOf(s.type),
      this.formatAnyOf(s.color),
      this.formatAnyOf(s.brand),
      this.formatAnyOf(s.material),
      this.formatAnyOf(s.style)
    ].filter(Boolean).join('');
    if (anyOfStr) {
      label += anyOfStr;
    }
    // Notes
    if (s.notes && s.notes !== 'N/A') {
      label += ' (' + s.notes + ')';
    }
    return label.trim();
  }

  private formatAllOf(attr: { allOf: string[] } | undefined, prefix: string): string {
    if (!attr || !attr.allOf || attr.allOf.length === 0) return '';
    const n = attr.allOf.length;
    if (n === 1) return prefix + attr.allOf[0];
    return prefix + attr.allOf.slice(0, n - 1).join(', ') + (n > 1 ? ', and ' : '') + attr.allOf[n - 1];
  }

  private formatAnyOf(attr: { anyOf: string[] } | undefined): string {
    if (!attr || !attr.anyOf || attr.anyOf.length === 0) return '';
    const n = attr.anyOf.length;
    if (n === 1) return ' (' + attr.anyOf[0] + ')';
    return ' (' + attr.anyOf.slice(0, n - 1).join(', ') + (n > 1 ? ', or ' : '') + attr.anyOf[n - 1] + ')';
  }
}
