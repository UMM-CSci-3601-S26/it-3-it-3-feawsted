// Angular and Material Imports
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
import { CommonModule } from '@angular/common';

// Family Service Import
import { FamilyService } from './family.service';

@Component({
  selector: 'app-add-family',
  templateUrl: './add-family.component.html',
  styleUrls: ['./add-family.component.scss'],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    MatButtonModule,
    RouterLink,
    CommonModule
  ]
})

// Component for adding a new family, including form validation and submission logic
export class AddFamilyComponent {
  private familyService = inject(FamilyService);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);

  // Add Family Form with validation rules
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

  // Getter for the students FormArray to manage dynamic student entries
  get students(): FormArray {
    return this.addFamilyForm.get('students') as FormArray;
  }

  // Method to add a new student entry to the students FormArray
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

  // Method to remove a student entry from the students FormArray by index
  removeStudent(index: number) {
    this.students.removeAt(index);
  }

  // Validation messages for form controls
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

  // Method to check if a form control has an error and has been interacted with (dirty or touched)
  formControlHasError(controlName: string): boolean {
    return this.addFamilyForm.get(controlName).invalid &&
      (this.addFamilyForm.get(controlName).dirty || this.addFamilyForm.get(controlName).touched);
  }

  // Method to get the appropriate error message for a form control based on its validation errors
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

  // Method to submit the form and add a new family, with error handling for different response statuses
  submitForm() {
    // Prepare the form data for submission, including parsing the requested supplies for each student
    const rawForm = this.addFamilyForm.value;
    const payload = {
      ...rawForm,
      students: rawForm.students?.map(student => ({
        ...student,
        requestedSupplies:
        // Handle the case where requestedSupplies might be a comma-separated string instead of an array
          typeof student.requestedSupplies === 'string'
            ? student.requestedSupplies
              .split(',')
              .map(s => s.trim())
              .filter(s => s.length > 0)
            : student.requestedSupplies ?? []
      })) ?? []
    };

    this.familyService.addFamily(payload).subscribe({
      // On success, show a confirmation message and navigate to the new family's detail page
      next: (newId) => {
        this.snackBar.open(
          `Added family ${rawForm.guardianName}`,
          null,
          { duration: 2000 }
        );
        this.router.navigate(['/families', newId]);
      },
      // On error, show an appropriate error message based on the status code
      error: err => {
        // Handle 400 Bad Request errors, which indicate invalid input
        if (err.status === 400) {
          this.snackBar.open(
            `Tried to add an illegal new family – Error Code: ${err.status}\nMessage: ${err.message}`,
            'OK',
            { duration: 5000 }
          );
          // Handle 500 Internal Server Error, which indicates a server-side issue
        } else if (err.status === 500) {
          this.snackBar.open(
            `The server failed to process your request to add a new family. Is the server up? – Error Code: ${err.status}\nMessage: ${err.message}`,
            'OK',
            { duration: 5000 }
          );
          // Handle any other unexpected errors
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
