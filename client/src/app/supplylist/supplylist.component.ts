// Angular Imports
import { Component, computed, effect, inject, signal, viewChild, ChangeDetectionStrategy } from '@angular/core';
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
import { CommonModule } from '@angular/common';

// RxJS Imports
import { catchError, combineLatest, debounceTime, of, switchMap } from 'rxjs';

// Supply List Imports
import { SupplyList } from './supplylist';
import { SupplyListService } from './supplylist.service';

@Component({
  selector: 'app-supplylist-component',
  standalone: true,
  templateUrl: './supplylist.component.html',
  styleUrls: ['./supplylist.component.scss'],
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
    MatIconModule,
    MatButtonModule,
    CommonModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class SupplyListComponent {
  // Define the columns to be displayed in the table, including an 'actions' column for the menu
  displayedColumns: string[] = [
    'school',
    'grade',
    'item',
    'description',
    'brand',
    'color',
    'size',
    'type',
    'material',
    'count',
    'quantity',
    'notes'
  ];

  // Initialize the data source for the table with an empty array, and set up view child references for sorting and pagination
  dataSource = new MatTableDataSource<SupplyList>([]);
  readonly sort = viewChild<MatSort>(MatSort);

  // Inject the MatSnackBar for displaying error messages and the InventoryService for fetching inventory data
  private snackBar = inject(MatSnackBar);
  private supplylistService = inject(SupplyListService);

  // Constructor sets up an effect to update the table data whenever the serverFilteredInventory signal changes, and assigns the sorting and pagination components to the data source
  constructor() {
    effect(() => {
      this.dataSource.data = this.serverFilteredSupplyList();
    });
  }

  // Define signals for each filterable field in the inventory, and create observables from these signals to be used in the serverFilteredInventory effect
  school = signal<string | undefined>(undefined);
  grade = signal<string | undefined>(undefined);
  item = signal<string | undefined>(undefined);
  brand = signal<string | undefined>(undefined);
  color = signal<string | undefined>(undefined);
  size = signal<string | undefined>(undefined);
  type = signal<string | undefined>(undefined);
  material = signal<string | undefined>(undefined);
  description = signal<string | undefined>(undefined);
  quantity = signal<number | undefined>(undefined);

  errMsg = signal<string | undefined>(undefined);

  // Create observables from the filter signals to be used in the serverFilteredInventory effect, which combines the latest values of the filters and fetches the filtered inventory data from the server
  private school$ = toObservable(this.school);
  private grade$ = toObservable(this.grade);
  private item$ = toObservable(this.item);
  private brand$ = toObservable(this.brand);
  private color$ = toObservable(this.color);
  private size$ = toObservable(this.size);
  private type$ = toObservable(this.type);
  private material$ = toObservable(this.material);
  private description$ = toObservable(this.description);
  private quantity$ = toObservable(this.quantity);

  serverFilteredSupplyList = toSignal(
    combineLatest([this.school$, this.grade$, this.item$, this.brand$, this.color$, this.size$, this.type$, this.material$, this.description$, this.quantity$]).pipe(
      debounceTime(300),
      switchMap(([ school, grade, item, brand, color, size, type, material]) =>
        this.supplylistService.getSupplyList({ school, grade, item, brand, color, size, type, material})
      ),
      catchError((err) => {
        const msg = `Problem contacting the server - Error Code: ${err.status}\nMessage: ${err.message}`;
        this.errMsg.set(msg);
        this.snackBar.open(msg, 'OK', { duration: 6000 });
        return of<SupplyList[]>([]);
      })
    ),
    { initialValue: [] }
  );

  /* This function computes a new grouping structure for the supply list every time serverFilteredSupplyList changes
  * It groups by School, then Grade, then Teacher (if no teacher, it groups them under "N/A"), and then makes an individual "chunk" for each item
  */
  groupedSupplyList = computed(() => {
    // Types for the grouping structure
    type TeacherGroup = { teacher: string; items: SupplyList[] };
    type GradeGroup = { grade: string; teachers: TeacherGroup[] };
    type SchoolGroup = { school: string; grades: GradeGroup[] };
    const byName = (a: string, b: string) => a.localeCompare(b);

    // Nested map for grouping: school -> grade -> teacher -> items
    const schoolMap = new Map<string, Map<string, Map<string, SupplyList[]>>>();
    const getOrCreate = <T>(map: Map<string, T>, key: string, init: () => T) => {
      if (!map.has(key)) map.set(key, init());
      return map.get(key)!;
    };

    // Group supplies by school, grade, and teacher
    for (const supply of this.serverFilteredSupplyList()) {
      const school = supply.school || 'Unknown School';
      const grade = supply.grade || 'Unknown Grade';
      const teacher = supply.teacher || 'N/A';

      // Make maps for each level of grouping
      const gradeMap = getOrCreate(schoolMap, school, () => new Map<string, Map<string, SupplyList[]>>());
      const teacherMap = getOrCreate(gradeMap, grade, () => new Map<string, SupplyList[]>());
      const items = getOrCreate(teacherMap, teacher, () => []);

      items.push(supply);
    }

    // Sort schools, grades, and teachers alphabetically
    const sortedSchools = Array.from(schoolMap.keys()).sort(byName);

    // Turn maps into the proper array structure
    return sortedSchools.map((school): SchoolGroup => {
      const gradeMap = schoolMap.get(school)!;
      const sortedGrades = Array.from(gradeMap.keys()).sort(byName);

      // For each grade, sort teachers and their items
      return {
        school,
        grades: sortedGrades.map((grade): GradeGroup => {
          const teacherMap = gradeMap.get(grade)!;
          const sortedTeachers = Array.from(teacherMap.keys()).sort(byName);

          // For each teacher, sort their items by item name
          return {
            grade,
            teachers: sortedTeachers.map((teacher): TeacherGroup => ({
              teacher,
              items: teacherMap.get(teacher)!
            }))
          };
        })
      };
    });
  });

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
    this.material.set(undefined);
    this.school.set(undefined);
    this.grade.set(undefined);
  }
}
export { SupplyListService };
