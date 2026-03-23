import { Component, input} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { CommonModule } from '@angular/common';
import { Family } from './family';

@Component({
  selector: 'app-family-card',
  templateUrl: './family-card.component.html',
  styleUrls: ['./family-card.component.scss'],
  imports: [
    MatCardModule,
    MatButtonModule,
    MatListModule,
    CommonModule,
    MatIconModule]
})

export class FamilyCardComponent {
  family = input.required<Family>();
}
