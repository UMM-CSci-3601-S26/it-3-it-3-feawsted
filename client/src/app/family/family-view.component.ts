import { Component, inject } from '@angular/core';
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
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { catchError, of } from 'rxjs';
import { Family } from './family';
import { FamilyCardComponent } from './family-card.component';
import { FamilyService } from './family.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-family',
  templateUrl: './family-view.component.html',
  styleUrls: ['./family-view.component.scss'],
  providers: [],
  imports: [
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatSelectModule,
    MatOptionModule,
    MatRadioModule,
    FamilyCardComponent,
    MatListModule,
    RouterLink,
    MatButtonModule,
    MatTooltipModule,
    MatIconModule,
    FamilyCardComponent
  ],
})

export class FamilyViewComponent {
  private familyService = inject(FamilyService);

  families = toSignal<Family[]>(
    this.familyService.getFamilies().pipe(
      catchError(() => of([]))
    )
  );

  downloadCSV() {
    this.familyService.exportFamilies().subscribe(csvData => {
      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = 'families.csv';
      a.click();

      window.URL.revokeObjectURL(url);
    });
  }
}
