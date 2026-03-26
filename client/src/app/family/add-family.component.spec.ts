// Angular and Material Imports
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { AbstractControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';

// RxJS Imports
import { of, throwError } from 'rxjs';

// Family Service and Component Imports
import { MockFamilyService } from 'src/testing/family-service.mock';
import { AddFamilyComponent } from './add-family.component';
import { FamilyService } from './family.service';

// Tests for the AddFamilyComponent
describe('AddFamilyComponent', () => {
  let addFamilyComponent: AddFamilyComponent;
  let addFamilyForm: FormGroup;
  let fixture: ComponentFixture<AddFamilyComponent>;

  // Set up the testing module and component before each test
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        AddFamilyComponent,
        MatSnackBarModule
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {
          provide: FamilyService,
          useClass: MockFamilyService
        }
      ]
      // error handling for async compilation of components
    }).compileComponents().catch(error => {
      expect(error).toBeNull();
    });
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddFamilyComponent);
    addFamilyComponent = fixture.componentInstance;
    fixture.detectChanges();
    addFamilyForm = addFamilyComponent.addFamilyForm;
    expect(addFamilyForm).toBeDefined();
    expect(addFamilyForm.controls).toBeDefined();
  });

  // Tests that the component creates successfully
  it('should create the component and form', () => {
    expect(addFamilyComponent).toBeTruthy();
    expect(addFamilyForm).toBeTruthy();
  });

  // Tests that an initial, empty form is not valid
  it('form should be invalid when empty', () => {
    expect(addFamilyForm.valid).toBeFalsy();
  });

  // Tests For Guardian Name Input
  describe('The guardian name field', () => {
    let guardianNameControl: AbstractControl;

    beforeEach(() => {
      guardianNameControl = addFamilyComponent.addFamilyForm.controls.guardianName;
    });

    it('should not allow empty guardian names', () => {
      guardianNameControl.setValue('');
      expect(guardianNameControl.valid).toBeFalsy();
    });

    it('should be fine with "Chris Smith"', () => {
      guardianNameControl.setValue('Chris Smith');
      expect(guardianNameControl.valid).toBeTruthy();
    });

    it('should fail on single character guardian names', () => {
      guardianNameControl.setValue('x');
      expect(guardianNameControl.valid).toBeFalsy();
      expect(guardianNameControl.hasError('minlength')).toBeTruthy();
    });

    it('should fail on really long guardian names', () => {
      guardianNameControl.setValue('x'.repeat(100));
      expect(guardianNameControl.valid).toBeFalsy();
      expect(guardianNameControl.hasError('maxlength')).toBeTruthy();
    });

  });

  // Tests For Address Input
  describe('The address field', () => {
    let addressControl: AbstractControl;

    beforeEach(() => {
      addressControl = addFamilyComponent.addFamilyForm.controls.address;
    });

    it('should not allow empty addresses', () => {
      addressControl.setValue('');
      expect(addressControl.valid).toBeFalsy();
    });

    it('should allow numbers and letters to input', () => {
      addressControl.setValue('123 Avenue');
      expect(addressControl.valid).toBeTruthy();
    });
  });

  // Tests For Email Input
  describe('The email field', () => {
    let emailControl: AbstractControl;

    beforeEach(() => {
      emailControl = addFamilyComponent.addFamilyForm.controls.email;
    });

    it('should not allow empty values', () => {
      emailControl.setValue(null);
      expect(emailControl.valid).toBeFalsy();
      expect(emailControl.hasError('required')).toBeTruthy();
    });

    it('should accept legal emails', () => {
      emailControl.setValue('conniestewart@ohmnet.com');
      expect(emailControl.valid).toBeTruthy();
    });

    it('should fail without @', () => {
      emailControl.setValue('conniestewart');
      expect(emailControl.valid).toBeFalsy();
      expect(emailControl.hasError('email')).toBeTruthy();
    });
  });

  // Tests For the Student Inputs
  describe('Students FormArray', () => {

    it('should start with an empty students array', () => {
      const students = addFamilyComponent.students;
      expect(students).toBeDefined();
      expect(students.length).toBe(0);
    });

    it('should add a student when addStudent() is called', () => {
      addFamilyComponent.addStudent();
      const students = addFamilyComponent.students;

      expect(students.length).toBe(1);
      expect(students.at(0)).toBeTruthy();
      expect(students.at(0) instanceof FormGroup).toBeTrue();
    });

    it('should remove a student when removeStudent() is called', () => {
      addFamilyComponent.removeStudent(0);
      const students = addFamilyComponent.students;

      expect(students.length).toBe(0);
      expect(students.at(0)).toBeFalsy();
      expect(students.at(0) instanceof FormGroup).toBeFalse();
    });

    it('when all required fields are valid, the the whole form should be valid', () => {
      addFamilyForm.controls.guardianName.setValue('Chris Smith');
      addFamilyForm.controls.address.setValue('123 Avenue');
      addFamilyForm.controls.timeSlot.setValue('9:00-10:00');
      addFamilyForm.controls.email.setValue('csmith@email.com');

      addFamilyComponent.addStudent();
      const student = addFamilyComponent.students.at(0);

      student.get('name')!.setValue('Jimmy');
      student.get('grade')!.setValue('3');
      student.get('school')!.setValue('Morris Elementary');

      expect(addFamilyForm.valid).toBeTrue();
    });

    // Tests the Student Name Input
    it('should validate student name', () => {
      addFamilyComponent.addStudent();
      const student = addFamilyComponent.students.at(0);

      // Name should not be valid if there is no input
      const name = student.get('name')!;
      name.setValue('');
      expect(name.valid).toBeFalse();
      expect(name.hasError('required')).toBeTrue();

      // Name should not be valid unless there is more than one character in input
      name.setValue('A');
      expect(name.valid).toBeFalse();
      expect(name.hasError('minlength')).toBeTrue();

      // When set to "Lilly" the code should recognize this name as a valid input
      name.setValue('Lilly');
      expect(name.valid).toBeTrue();
    });

    // Tests the Student Grade Input
    it('should validate student grade or integer and "K" or "k"', () => {
      addFamilyComponent.addStudent();
      const student = addFamilyComponent.students.at(0);

      // Should not be valid without input
      const grade = student.get('grade')!;
      grade.setValue('');
      expect(grade.valid).toBeFalse();
      expect(grade.hasError('required')).toBeTrue();

      // Should not be a valid input
      grade.setValue('abc');
      expect(grade.valid).toBeFalse();
      expect(grade.hasError('pattern')).toBeTrue();

      // Mixed values are invalid
      grade.setValue('k1');
      expect(grade.valid).toBeFalse();
      expect(grade.hasError('pattern')).toBeTrue();

      // Integers are valid inputs
      grade.setValue('5');
      expect(grade.valid).toBeTrue();

      // "k" should be a valid input
      grade.setValue('k');
      expect(grade.valid).toBeTrue();

      // "K" should be a valid input
      grade.setValue('K');
      expect(grade.valid).toBeTrue();
    });

    // Tests the Student School Input
    it('should validate student school', () => {
      addFamilyComponent.addStudent();
      const student = addFamilyComponent.students.at(0);

      // School should not be valid if there is no input
      const school = student.get('school')!;
      school.setValue('');
      expect(school.valid).toBeFalse();
      expect(school.hasError('required')).toBeTrue();

      // School should not be valid unless there is more than one character in input
      school.setValue('A');
      expect(school.valid).toBeFalse();
      expect(school.hasError('minlength')).toBeTrue();

      // "Lincoln Elementary" should be a valid input
      school.setValue('Lincoln Elementary');
      expect(school.valid).toBeTrue();
    });
  });

  // Tests for Form Validation
  describe('Form Validation', () => {
    it('should be valid when all required fields are filled out', () => {
      addFamilyForm.controls.guardianName.setValue('Chris Smith');
      addFamilyForm.controls.address.setValue('123 Avenue');
      addFamilyForm.controls.timeSlot.setValue('9:00-10:00');
      addFamilyForm.controls.email.setValue('csmith@email.com');
      addFamilyComponent.addStudent();
      const student = addFamilyComponent.students.at(0);
      student.get('name')!.setValue('Jimmy');
      student.get('grade')!.setValue('3');
      student.get('school')!.setValue('Morris Elementary');

      expect(addFamilyForm.valid).toBeTrue();
    });

    it('should be invalid when required fields are missing', () => {
      addFamilyForm.controls.guardianName.setValue('');
      addFamilyForm.controls.address.setValue('123 Avenue');
      addFamilyForm.controls.timeSlot.setValue('9:00-10:00');
      addFamilyForm.controls.email.setValue('csmith@email.com');
      addFamilyComponent.addStudent();
      const student = addFamilyComponent.students.at(0);
      student.get('name')!.setValue('Jimmy');
      student.get('grade')!.setValue('3');
      student.get('school')!.setValue('Morris Elementary');

      expect(addFamilyForm.valid).toBeFalse();
    });

    it('should be invalid when student fields are missing', () => {
      addFamilyForm.controls.guardianName.setValue('Chris Smith');
      addFamilyForm.controls.address.setValue('123 Avenue');
      addFamilyForm.controls.timeSlot.setValue('9:00-10:00');
      addFamilyForm.controls.email.setValue('csmith@email.com');
      addFamilyComponent.addStudent();
      const student = addFamilyComponent.students.at(0);
      student.get('name')!.setValue('');
      student.get('grade')!.setValue('');
      student.get('school')!.setValue('');

      expect(addFamilyForm.valid).toBeFalse();
    });
  });


  // Tests for error messages
  describe('Error messages', () => {
    it('should return the correct error message', () => {
      const controlName: keyof typeof addFamilyComponent.addFamilyValidationMessages = 'guardianName';
      addFamilyComponent.addFamilyForm.get(controlName).setValue('');
      addFamilyComponent.addFamilyForm.get(controlName).markAsTouched();
      expect(addFamilyComponent.getErrorMessage(controlName)).toEqual('Guardian name is required');
    });

    it('should return "Unknown error" if no error message is found', () => {
      const controlName: keyof typeof addFamilyComponent.addFamilyValidationMessages = 'guardianName';
      addFamilyComponent.addFamilyForm.get(controlName).setErrors({ 'unknown': true });
      expect(addFamilyComponent.getErrorMessage(controlName)).toEqual('Unknown error');
    });

    it('should return an empty string if the validation method is not an array', () => {
      const result = addFamilyComponent.getErrorMessage('students');
      expect(result).toBe('');
    })
  });

  // Tests for Submitting Form
  describe('Form control error detection', () => {
    it('formControlHasError should return true if control is invalid and touched', () => {
      const nameControl = addFamilyForm.controls.guardianName;
      nameControl.setValue('');
      nameControl.markAsTouched();

      expect(addFamilyComponent.formControlHasError('guardianName')).toBeTrue();
    });

    it('formControlHasError should return false if control is valid', () => {
      const nameControl = addFamilyForm.controls.guardianName;
      nameControl.setValue('Chris Smith');
      nameControl.markAsTouched();

      expect(addFamilyComponent.formControlHasError('guardianName')).toBeFalse();
    });

    it('formControlHasError should return false if control is invalid but not touched', () => {
      const nameControl = addFamilyForm.controls.guardianName;
      nameControl.setValue('');
      nameControl.markAsUntouched();
      expect(addFamilyComponent.formControlHasError('guardianName')).toBeFalse();
    });

  });

  // Tests for Submitting Form
  describe('Submit behavior', () => {
    it('should call addFamily and navigate to the family list on successful submission', () => {
      const familyService = TestBed.inject(FamilyService);
      const addFamilySpy = spyOn(familyService, 'addFamily').and.returnValue(of('1'));
      const router = TestBed.inject(Router);
      const navigateSpy = spyOn(router, 'navigate');

      addFamilyComponent.addStudent(); // <-- creates students[0], errors without this because submitForm() expects at least one student to be in the form
      addFamilyComponent.addFamilyForm.setValue({
        guardianName: 'Chris Smith',
        address: '123 Avenue',
        timeSlot: '9:00-10:00',
        email: 'csmith@email.com',
        students: [{
          name: 'Jimmy',
          grade: '3',
          school: 'Morris Elementary',
          requestedSupplies: ['pencil', 'eraser', 'notebook']
        }]
      });

      addFamilyComponent.submitForm();

      expect(addFamilySpy).toHaveBeenCalled();
      expect(navigateSpy).toHaveBeenCalledWith(['/families', '1']);
    });

    it('should show snackBar on 400 error', () => {
      const familyService = TestBed.inject(FamilyService);
      spyOn(familyService, 'addFamily').and.returnValue(throwError(() => ({ status: 400 })));
      const snackBar = TestBed.inject(MatSnackBar);
      const snackBarSpy = spyOn(snackBar, 'open');

      addFamilyComponent.submitForm();

      expect(snackBarSpy).toHaveBeenCalledWith(
        jasmine.stringMatching(/illegal new family/i),
        'OK',
        { duration: 5000 }
      );
    });

    it('should show snackBar on 500 error', () => {
      const familyService = TestBed.inject(FamilyService);
      spyOn(familyService, 'addFamily').and.returnValue(throwError(() => ({ status: 500 })));
      const snackBar = TestBed.inject(MatSnackBar);
      const snackBarSpy = spyOn(snackBar, 'open');

      addFamilyComponent.submitForm();

      expect(snackBarSpy).toHaveBeenCalledWith(
        jasmine.stringMatching(/server failed to process/i),
        'OK',
        { duration: 5000 }
      );
    });

    it('should transform requestedSupplies string into trimmed array', () => {
      const familyService = TestBed.inject(FamilyService);
      const addFamilySpy = spyOn(familyService, 'addFamily').and.returnValue(of('1'));

      addFamilyComponent.addStudent(); // <-- creates students[0], errors without this because submitForm() expects at least one student to be in the form
      addFamilyComponent.addFamilyForm.setValue({
        guardianName: 'Chris Smith',
        address: '123 Avenue',
        timeSlot: '9:00-10:00',
        email: 'csmith@email.com',
        students: [{
          name: 'Jimmy',
          grade: '3',
          school: 'Morris Elementary',
          requestedSupplies: 'pencil, eraser , notebook '
        }]
      });

      addFamilyComponent.submitForm();

      expect(addFamilySpy).toHaveBeenCalledWith(
        jasmine.objectContaining({
          students: [
            jasmine.objectContaining({
              requestedSupplies: ['pencil', 'eraser', 'notebook']
            })
          ]
        })
      );
    });
  });
});
