// Angular Imports
import { Component, effect, inject, signal, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
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
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatMenuModule } from '@angular/material/menu';

// RxJS Imports
import { catchError, combineLatest, debounceTime, of, switchMap } from 'rxjs';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';

// Inventory Imports
import { Inventory } from './inventory';
import { InventoryService } from './inventory.service';
import { MatMenu } from "@angular/material/menu";
import { TermsService } from '../terms/terms.service';
import { Terms } from '../terms/terms';

@Component({
  selector: 'app-inventory-component',
  standalone: true,
  templateUrl: './inventory-table.component.html',
  styleUrls: ['./inventory-table.component.scss'],
  imports: [
    CommonModule,
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
    MatPaginatorModule,
    MatMenu,
    MatMenuModule,
  ],
})

/**
 * Component for displaying the inventory table with sorting, pagination, and filtering capabilities.
 * - Uses Angular Material's MatTable for displaying inventory data.
 * - Integrates MatSort and MatPaginator for sorting and pagination functionality.
 */
export class InventoryTableComponent {
  // Define the columns to be displayed in the table, including an 'actions' column for the menu
  displayedColumns: string[] = [
    'item',
    'brand',
    'color',
    'size',
    'type',
    'style',
    'material',
    'bin',
    'count',
    'quantity',
    'notes',
    'actions' // Added 'actions' column for the menu
  ];

  // Track the currently selected row for actions, initialized to null
  currentRow: Inventory | null = null; // Track the currently selected row for actions

  // Initialize the data source for the table with an empty array, and set up view child references for sorting and pagination
  dataSource = new MatTableDataSource<Inventory>([]);
  readonly page = viewChild<MatPaginator>(MatPaginator)
  readonly sort = viewChild<MatSort>(MatSort);

  // Inject the MatSnackBar for displaying error messages and the InventoryService for fetching inventory data
  private snackBar = inject(MatSnackBar);
  private inventoryService = inject(InventoryService);
  private termsService = inject(TermsService);

  // Shared vocabulary loaded from /api/terms for autocomplete in inline edit
  terms: Terms = { item: [], brand: [], color: [], size: [], type: [], material: [], style: [] };

  // Constructor sets up an effect to update the table data whenever the serverFilteredInventory signal changes, and assigns the sorting and pagination components to the data source
  constructor() {
    effect(() => {
      this.dataSource.data = this.serverFilteredInventory();
      this.dataSource.sort = this.sort();
      this.dataSource.paginator = this.page();
    });
    this.termsService.getTerms().subscribe({ next: t => this.terms = t });
  }

  // Define signals for each filterable field in the inventory, and create observables from these signals to be used in the serverFilteredInventory effect
  item = signal<string | undefined>(undefined);
  brand = signal<string | undefined>(undefined);
  color = signal<string | undefined>(undefined);
  size = signal<string | undefined>(undefined);
  type = signal<string | undefined>(undefined);
  style = signal<string | undefined>(undefined);
  material = signal<string | undefined>(undefined);
  bin = signal<number | undefined>(undefined);
  quantity = signal<number | undefined>(undefined);

  errMsg = signal<string | undefined>(undefined);

  // Create observables from the filter signals to be used in the serverFilteredInventory effect, which combines the latest values of the filters and fetches the filtered inventory data from the server
  private item$ = toObservable(this.item);
  private brand$ = toObservable(this.brand);
  private color$ = toObservable(this.color);
  private size$ = toObservable(this.size);
  private type$ = toObservable(this.type);
  private style$ = toObservable(this.style);
  private material$ = toObservable(this.material);
  private bin$ = toObservable(this.bin);
  private quantity$ = toObservable(this.quantity);

  /**
   * Effect to fetch filtered inventory data from the server whenever any of the filter signals change.
   * It combines the latest values of the filters, applies a debounce time to avoid excessive server calls,
   * and uses switchMap to call the getInventory method of the InventoryService with the current filter values.
   * If an error occurs during the server call, it catches the error, sets an appropriate error message,
   * displays a snack bar with the error message, and returns an empty array to ensure the table does not break.
   */
  serverFilteredInventory = toSignal(
    combineLatest([this.item$, this.brand$, this.color$, this.size$, this.type$, this.style$, this.material$, this.bin$, this.quantity$]).pipe(
      debounceTime(300),
      switchMap(([item, brand, color, size, type, style, material, bin]) =>
        this.inventoryService.getInventory({ item, brand, color, size, type, style, material, bin })
      ),
      catchError((err) => {
        if (!(err.error instanceof ErrorEvent)) {
          this.errMsg.set(
            `Problem contacting the server – Error Code: ${err.status}\nMessage: ${err.message}`
          )
        };
        this.snackBar.open(this.errMsg() ?? '', 'OK', { duration: 6000 });
        return of<Inventory[]>([]);
      })
    ),
    { initialValue: [] }
  );

  /**
   * Delete a row with confirmation.
   * - if id missing -> set user error
   * - if confirmed -> call service and remove from local table data
   */
  confirmDelete(id: string | undefined) {
    if (!id) {
      this.errMsg.set('Cannot delete: missing item ID');
      return;
    }
    // Note: Try to show what is being deleted in the confirmation dialog - ${this.item()} ??
    const confirmed = confirm(`Are you sure you want to delete this item?`);
    if (confirmed) {
      this.inventoryService.deleteInventory(id).subscribe({
        next: () => {
          this.dataSource.data = this.dataSource.data.filter(item => item._id !== id);
        },
        error: (err) => {
          this.errMsg.set(`Problem deleting item – Error Code: ${err.status}\nMessage: ${err.message}`);
        }
      });
    }
  }

  // Tracks which row is currently being edited (by _id), and a backup for cancel
  editingRowId: string | null = null;
  private editingBackup: Inventory | null = null;
  private readonly NEW_ROW_ID = '__new__';

  /**
   * Inserts a blank row at the top of the table and enters edit mode on it.
   * Calling again while a new row is already pending is a no-op.
   */
  addRow() {
    if (this.editingRowId === this.NEW_ROW_ID) {
      return;
    }
    const blank: Inventory = {
      _id: this.NEW_ROW_ID,
      item: '', brand: '', color: '',
      count: 1, size: '', type: [], style: [], material: [], bin: [], quantity: 0, notes: ''
    };
    this.dataSource.data = [blank, ...this.dataSource.data];
    this.startEdit(blank);
  }

  /**
   * Enters edit mode for a row.
   * Stores a deep copy so changes can be reverted on cancel.
   */
  startEdit(row: Inventory) {
    this.editingRowId = row._id ?? null;
    this.editingBackup = JSON.parse(JSON.stringify(row));
  }

  /**
   * Saves the edited row by calling the PUT endpoint,
   * then exits edit mode.
   */
  saveEdit(row: Inventory) {
    if (!row._id) {
      return;
    }
    if (row._id === this.NEW_ROW_ID) {
      // New row: POST to create it, then store the real _id assigned by the server
      const { _id: _discarded, ...newItem } = row; // eslint-disable-line @typescript-eslint/no-unused-vars
      this.inventoryService.addInventory(newItem).subscribe({
        next: (id) => {
          row._id = id;
          this.editingRowId = null;
          this.editingBackup = null;
        },
        error: (err) => {
          this.errMsg.set(`Problem adding item – Error Code: ${err.status}\nMessage: ${err.message}`);
        }
      });
    } else {
      this.inventoryService.editInventory(row._id, row).subscribe({
        next: () => {
          this.editingRowId = null;
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
   */
  cancelEdit(row: Inventory) {
    if (row._id === this.NEW_ROW_ID) {
      // Discard the unsaved new row entirely
      this.dataSource.data = this.dataSource.data.filter(i => i._id !== this.NEW_ROW_ID);
    } else if (this.editingBackup) {
      Object.assign(row, this.editingBackup);
    }
    this.editingRowId = null;
    this.editingBackup = null;
  }

  parseStringArray(value: string): string[] {
    return value.split(',').map(s => s.trim()).filter(s => s.length > 0);
  }

  parseBin(value: string): number[] {
    return value.split(',').map(s => +s.trim()).filter(n => !isNaN(n) && n !== 0);
  }

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
    this.type.set(undefined);
    this.style.set(undefined);
    this.material.set(undefined);
    this.bin.set(undefined);
    this.quantity.set(undefined);
  }
}
