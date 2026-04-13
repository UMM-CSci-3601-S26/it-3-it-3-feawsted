import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SupplyListService } from './supplylist.service';

@Component({
  selector: 'app-add-supplylist',
  templateUrl: './add-supplylist.component.html',
  styleUrls: ['./add-supplylist.component.scss'],
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    RouterLink,
    CommonModule
  ]
})
export class AddSupplyListComponent implements OnInit {
  private supplyListService = inject(SupplyListService);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  addSupplyListForm = new FormGroup({
    school: new FormControl('', Validators.required),
    grade: new FormControl('', Validators.required),
    item: new FormControl('', Validators.required),
    brand: new FormControl('', Validators.required),
    color: new FormControl('', Validators.required),
    count: new FormControl('', [Validators.required, Validators.min(1)]),
    size: new FormControl('', Validators.required),
    type: new FormControl('', Validators.required),
    material: new FormControl('', Validators.required),
    description: new FormControl('', Validators.required),
    quantity: new FormControl('', [Validators.required, Validators.min(1)]),
    notes: new FormControl('')
  });

  readonly validationMessages = {
    school: [{ type: 'required', message: 'School is required' }],
    grade: [{ type: 'required', message: 'Grade is required' }],
    item: [{ type: 'required', message: 'Item is required' }],
    brand: [{ type: 'required', message: 'Brand is required' }],
    color: [{ type: 'required', message: 'Color is required' }],
    count: [
      { type: 'required', message: 'Count is required' },
      { type: 'min', message: 'Count must be at least 1' }
    ],
    size: [{ type: 'required', message: 'Size is required' }],
    type: [{ type: 'required', message: 'Type is required' }],
    material: [{ type: 'required', message: 'Material is required' }],
    description: [{ type: 'required', message: 'Description is required' }],
    quantity: [
      { type: 'required', message: 'Quantity is required' },
      { type: 'min', message: 'Quantity must be at least 1' }
    ],
    notes: []
  };

  ngOnInit() {
    // Pre-populate school and grade from query params (when navigating from the supply list view)
    const school = this.route.snapshot.queryParamMap.get('school');
    const grade = this.route.snapshot.queryParamMap.get('grade');
    if (school) this.addSupplyListForm.patchValue({ school });
    if (grade) this.addSupplyListForm.patchValue({ grade });
  }

  formControlHasError(controlName: string): boolean {
    const control = this.addSupplyListForm.get(controlName);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  getErrorMessage(controlName: keyof typeof this.validationMessages): string {
    const messages = this.validationMessages[controlName];
    for (const { type, message } of messages) {
      if (this.addSupplyListForm.get(controlName)?.hasError(type)) {
        return message;
      }
    }
    return 'Unknown error';
  }

  submitForm() {
    const raw = this.addSupplyListForm.value;
    const formData: Partial<import('./supplylist').SupplyList> = {
      school: raw.school ?? undefined,
      grade: raw.grade ?? undefined,
      item: raw.item ?? undefined,
      brand: raw.brand ?? undefined,
      color: raw.color ?? undefined,
      size: raw.size ?? undefined,
      type: raw.type ?? undefined,
      material: raw.material ?? undefined,
      description: raw.description ?? undefined,
      notes: raw.notes ?? undefined,
      count: raw.count ? parseInt(raw.count, 10) : undefined,
      quantity: raw.quantity ? parseInt(raw.quantity, 10) : undefined
    };

    this.supplyListService.addSupplyList(formData).subscribe({
      next: () => {
        this.snackBar.open('Added supply list item', undefined, { duration: 2000 });
        this.router.navigate(['/supplylist']);
      },
      error: (err) => {
        this.snackBar.open(
          `Failed to add item – Error Code: ${err.status}\nMessage: ${err.message}`,
          'OK',
          { duration: 6000 }
        );
      }
    });
  }
}
