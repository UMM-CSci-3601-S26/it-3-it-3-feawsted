//Angular Imports
import { Component, inject, signal, viewChild, ChangeDetectionStrategy } from '@angular/core';
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
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { MatTreeModule } from '@angular/material/tree';
import { MatExpansionModule } from '@angular/material/expansion';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

// RxJS Imports
import { catchError, combineLatest, debounceTime, map, of, switchMap } from 'rxjs';

// Purchase List Imports
import { PurchaseList } from './purchase_list';
import { PurchaseListService } from './purchase_list.service';
import { SettingsService } from '../settings/settings.service';

@Component({
  selector: 'app-purchaselist-component',
  standalone: true,
  templateUrl: './purchase_list.component.html',
  styleUrls: ['./purchase_list.component.scss'],
  imports: [
    MatTableModule,
    MatSortModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatSelectModule,
    MatOptionModule,
    MatRadioModule,
    MatListModule,
    MatButtonModule,
    MatTooltipModule,
    MatIconModule,
    MatTreeModule,
    MatExpansionModule,
    MatIconModule,
    MatButtonModule,
    CommonModule,
    RouterLink
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class PurchaseListComponent {
  // Define the columns to be displayed in the table, including an 'actions' column for the menu
  displayedColumns: string[] = [
    'school',
    'grade',
    'item',
    'brand',
    'color',
    'size',
    'type',
    'style',
    'material',
    'count',
    'quantity',
    'notes'
  ];

  // Initialize the data source for the table with an empty array, and set up view child references for sorting and pagination
  dataSource = new MatTableDataSource<PurchaseList>([]);
  readonly sort = viewChild<MatSort>(MatSort);

  // Inject the MatSnackBar for displaying error messages and the InventoryService for fetching inventory data
  private snackBar = inject(MatSnackBar);
  private purchaselistService = inject(PurchaseListService);
  private settingsService = inject(SettingsService);

  // Constructor sets up an effect to update the table data whenever the serverFilteredInventory signal changes, and assigns the sorting and pagination components to the data source

  // Define signals for each filterable field in the inventory, and create observables from these signals to be used in the serverFilteredInventory effect
  item = signal<string | undefined>(undefined);
  brand = signal<string | undefined>(undefined);
  color = signal<string | undefined>(undefined);
  size = signal<string | undefined>(undefined);


  errMsg = signal<string | undefined>(undefined);

  // Schools loaded from settings for the school dropdown
  availableSchools = toSignal(
    this.settingsService.getSettings().pipe(
      map(settings => settings.schools.map(s => s.name)),
      catchError(() => of([] as string[]))
    ),
    { initialValue: [] as string[] }
  );

  // Unique sorted grades derived from the currently visible grouped list

  // Incrementing this signal forces a re-fetch from the server (e.g. after a delete).
  private refreshTrigger = signal(0);

  // Create observables from the filter signals to be used in the serverFilteredInventory effect, which combines the latest values of the filters and fetches the filtered inventory data from the server
  private item$ = toObservable(this.item);
  private brand$ = toObservable(this.brand);
  private color$ = toObservable(this.color);
  private size$ = toObservable(this.size);
  private refresh$ = toObservable(this.refreshTrigger);

  serverFilteredPurchaseList = toSignal(
    combineLatest([this.item$, this.brand$, this.color$, this.size$]).pipe(
      debounceTime(300),
      switchMap(([item, brand, color, size]) =>
        this.purchaselistService.getPurchaseList({ item, brand, color, size})
      ),
      catchError((err) => {
        const msg = `Problem contacting the server - Error Code: ${err.status}\nMessage: ${err.message}`;
        this.errMsg.set(msg);
        this.snackBar.open(msg, 'OK', { duration: 6000 });
        return of<PurchaseList[]>([]);
      })
    ),
    { initialValue: [] }
  );

  /* This function computes a new grouping structure for the purchase list every time serverFilteredPurchaseList changes
  * It groups by School, then Grade, then Teacher (if no teacher, it groups them under "N/A"), and then makes an individual "chunk" for each item
  */




  /**
   * This was getting unwieldy in the HTML, so I moved it here.
   * It just resets all the filter signals to undefined,
   * which will trigger the effect to fetch unfiltered data from the server.
   */
  resetFilters() {
    this.item.set(undefined);
    this.brand.set(undefined);
    this.color.set(undefined);
    this.size.set(undefined);
  }

  parseStringArray(value: string): string[] {
    return value.split(',').map(s => s.trim()).filter(s => s.length > 0);
  }

  /** Builds a compact human-readable label for an item, mirroring the server-side toString(). */

  /** Prompts confirmation then deletes an item, removing it from the local grouped data. */

}
export { PurchaseListService };
