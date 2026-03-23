import { Component, inject } from '@angular/core';
import { FormArray, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, RouterLink } from '@angular/router';
import { FamilyService } from './family.service';

@Component({
  selector: 'app-add-family',
  templateUrl: './add-family.component.html',
  styleUrls: ['./add-family.component.scss'],
  imports: [FormsModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatOptionModule, MatButtonModule, RouterLink]
})
export class AddFamilyComponent {
  private familyService = inject(FamilyService);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);


  addFamilyForm = new FormGroup({
    guardianName: new FormControl('', Validators.compose([
      Validators.required,
      Validators.minLength(2),
      Validators.maxLength(50),
    ])),

    email: new FormControl('', Validators.compose([
      Validators.required,
      Validators.email,
    ])),

    address: new FormControl('', Validators.required),

    timeSlot: new FormControl('', Validators.required),

    students: new FormArray([], Validators.required)
  });

  get students(): FormArray {
    return this.addFamilyForm.get('students') as FormArray;
  }

  addStudent() {
    this.students.push(new FormGroup({
      name: new FormControl('', Validators.compose([
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50),
      ])),
      grade: new FormControl('', Validators.compose([
        Validators.required,
        Validators.pattern(/^(?:[0-9]+|k)$/i)
      ])),
      school: new FormControl('', Validators.compose([
        Validators.required,
        Validators.minLength(2),
      ])),
      requestedSupplies: new FormControl<string[]>([])
    }));
  }

  removeStudent(index: number) {
    this.students.removeAt(index);
  }

  readonly addFamilyValidationMessages = {
    guardianName: [
      { type: 'required', message: 'Guardian name is required' },
      { type: 'minlength', message: 'Name must be at least 2 characters long' },
      { type: 'maxlength', message: 'Name cannot exceed 50 characters' }
    ],
    email: [
      { type: 'required', message: 'Email is required' },
      { type: 'email', message: 'Email must be formatted properly' },
      { type: 'minlength', message: 'School must be at least 2 characters long' }
    ],
    address: [
      { type: 'required', message: 'Address is required' },
      { type: 'minlength', message: 'School must be at least 2 characters long' }
    ],
    timeSlot: [
      { type: 'required', message: 'Time slot is required' }
    ],
    students: {
      name: [
        { type: 'required', message: 'Student name is required' },
        { type: 'minlength', message: 'Student name must be at least 2 characters long' },
        { type: 'maxlength', message: 'Student name cannot be more than 50 characters long' }
      ],
      grade: [
        { type: 'required', message: 'Grade is required' },
        { type: 'pattern', message: 'Grade must be a whole number' }
      ],
      school: [
        { type: 'required', message: 'School is required' },
        { type: 'minlength', message: 'School must be at least 2 characters long' }
      ]
    }
  };

  formControlHasError(controlName: string): boolean {
    return this.addFamilyForm.get(controlName).invalid &&
      (this.addFamilyForm.get(controlName).dirty || this.addFamilyForm.get(controlName).touched);
  }

  getErrorMessage(controlName: keyof typeof this.addFamilyValidationMessages): string {
    const messages = this.addFamilyValidationMessages[controlName];
    if (!Array.isArray(messages)) {
      return ''; // either throws or ignores
    }
    for (const { type, message } of messages) {
      if (this.addFamilyForm.get(controlName)?.hasError(type)) {
        return message;
      }
    }
    return 'Unknown error';
  }

  submitForm() {

    const rawForm = this.addFamilyForm.value;

    const payload = {
      ...rawForm,
      students: rawForm.students?.map(student => ({
        ...student,
        requestedSupplies:
          typeof student.requestedSupplies === 'string'
            ? student.requestedSupplies
              .split(',')
              .map(s => s.trim())
              .filter(s => s.length > 0)
            : student.requestedSupplies ?? []
      })) ?? []
    };

    console.log("Submitting:", JSON.stringify(payload, null, 2));

    this.familyService.addFamily(payload).subscribe({
      next: (newId) => {
        this.snackBar.open(
          `Added family ${rawForm.guardianName}`,
          null,
          { duration: 2000 }
        );
        this.router.navigate(['/families', newId]);
      },
      error: err => {
        if (err.status === 400) {
          this.snackBar.open(
            `Tried to add an illegal new family – Error Code: ${err.status}\nMessage: ${err.message}`,
            'OK',
            { duration: 5000 }
          );
        } else if (err.status === 500) {
          this.snackBar.open(
            `The server failed to process your request to add a new family. Is the server up? – Error Code: ${err.status}\nMessage: ${err.message}`,
            'OK',
            { duration: 5000 }
          );
        } else {
          this.snackBar.open(
            `An unexpected error occurred – Error Code: ${err.status}\nMessage: ${err.message}`,
            'OK',
            { duration: 5000 }
          );
        }
      },
    });
  }

}
