// Angular and Material Imports
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { AbstractControl, FormGroup, UntypedFormGroup } from '@angular/forms';
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
import { SettingsService } from '../settings/settings.service';
import { AppSettings } from '../settings/settings';


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
        },
        {
          provide: SettingsService,
          useValue: { getSettings: () => of({ schools: [{ name: 'Test School', abbreviation: 'TS' }] } as unknown as AppSettings) }
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
  // Tests Alternate Pick Up Person Input
  describe('The Alternate Pick Up Person field', () => {
    let altPickUpControl: AbstractControl;

    beforeEach(() => {
      altPickUpControl = addFamilyComponent.addFamilyForm.controls.guardianName;
    });

    /*
    it('should allow empty alternate pick up person', () => {
      altPickUpControl.setValue('');
      expect(altPickUpControl.valid).toBeTruthy();
    }); */

    it('should be fine with "Chris Smith"', () => {
      altPickUpControl.setValue('Chris Smith');
      expect(altPickUpControl.valid).toBeTruthy();
    });

    it('should fail on single character name for an alternate pick up person', () => {
      altPickUpControl.setValue('x');
      expect(altPickUpControl.valid).toBeFalsy();
      expect(altPickUpControl.hasError('minlength')).toBeTruthy();
    });

    it('should fail on really long alternate pick up person name', () => {
      altPickUpControl.setValue('x'.repeat(100));
      expect(altPickUpControl.valid).toBeFalsy();
      expect(altPickUpControl.hasError('maxlength')).toBeTruthy();
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
      addFamilyForm.controls.email.setValue('csmith@email.com');
      addFamilyForm.controls.timeAvailability.setValue({ earlyMorning: false, lateMorning: true, earlyAfternoon: false, lateAfternoon: false });

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
      addFamilyForm.controls.altPickUp.setValue('James Smith');
      addFamilyForm.controls.address.setValue('123 Avenue');
      addFamilyForm.controls.email.setValue('csmith@email.com');
      addFamilyForm.controls.timeAvailability.setValue({ earlyMorning: false, lateMorning: true, earlyAfternoon: false, lateAfternoon: false });
      addFamilyComponent.addStudent();
      const student = addFamilyComponent.students.at(0);
      student.get('name')!.setValue('Jimmy');
      student.get('grade')!.setValue('3');
      student.get('school')!.setValue('Morris Elementary');

      expect(addFamilyForm.valid).toBeTrue();
    });
    it('should be valid when alternate Pick Up Person is not filled out', () => {
      addFamilyForm.controls.guardianName.setValue('Chris Smith');
      addFamilyForm.controls.altPickUp.setValue('');
      addFamilyForm.controls.address.setValue('123 Avenue');
      addFamilyForm.controls.email.setValue('csmith@email.com');
      addFamilyForm.controls.timeAvailability.setValue({ earlyMorning: false, lateMorning: true, earlyAfternoon: false, lateAfternoon: false });
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
      addFamilyForm.controls.email.setValue('csmith@email.com');
      addFamilyForm.controls.timeAvailability.setValue({ earlyMorning: false, lateMorning: true, earlyAfternoon: false, lateAfternoon: false });
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
      addFamilyForm.controls.email.setValue('csmith@email.com');
      addFamilyForm.controls.timeAvailability.setValue({ earlyMorning: false, lateMorning: true, earlyAfternoon: false, lateAfternoon: false });
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
      addFamilyComponent.addFamilyForm.get(controlName)!.setValue('');
      addFamilyComponent.addFamilyForm.get(controlName)!.markAsTouched();
      expect(addFamilyComponent.getErrorMessage(controlName)).toEqual('Guardian name is required');
    });

    it('should return "Unknown error" if no error message is found', () => {
      const controlName: keyof typeof addFamilyComponent.addFamilyValidationMessages = 'guardianName';
      addFamilyComponent.addFamilyForm.get(controlName)!.setErrors({ 'unknown': true });
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

      addFamilyComponent.addStudent();
      (addFamilyComponent.addFamilyForm as unknown as UntypedFormGroup).setValue({
        guardianName: 'Chris Smith',
        altPickUp: 'James Smith',
        address: '123 Avenue',
        email: 'csmith@email.com',
        students: [{ name: 'Jimmy', grade: '3', school: 'Morris Elementary', requestedSupplies: ['pencil', 'eraser', 'notebook'] }],
        timeAvailability: { earlyMorning: false, lateMorning: true, earlyAfternoon: false, lateAfternoon: false },
        timeSlot: null
      });

      addFamilyComponent.submitForm();

      expect(addFamilySpy).toHaveBeenCalled();
      expect(navigateSpy).toHaveBeenCalledWith(['/families']);
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

      addFamilyComponent.addStudent();
      (addFamilyComponent.addFamilyForm as unknown as UntypedFormGroup).setValue({
        guardianName: 'Chris Smith',
        altPickUp: 'James Smith',
        address: '123 Avenue',
        email: 'csmith@email.com',
        students: [{ name: 'Jimmy', grade: '3', school: 'Morris Elementary', requestedSupplies: 'pencil, eraser , notebook ' }],
        timeAvailability: { earlyMorning: false, lateMorning: true, earlyAfternoon: false, lateAfternoon: false },
        timeSlot: null
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

    it('should show snackBar on unexpected error status', () => {
      const familyService = TestBed.inject(FamilyService);
      spyOn(familyService, 'addFamily').and.returnValue(throwError(() => ({ status: 409, message: 'Conflict' })));
      const snackBar = TestBed.inject(MatSnackBar);
      const snackBarSpy = spyOn(snackBar, 'open');

      addFamilyComponent.submitForm();

      expect(snackBarSpy).toHaveBeenCalledWith(
        jasmine.stringMatching(/unexpected error/i),
        'OK',
        { duration: 5000 }
      );
    });

    it('should handle null requestedSupplies with empty array fallback', () => {
      const familyService = TestBed.inject(FamilyService);
      const addFamilySpy = spyOn(familyService, 'addFamily').and.returnValue(of('1'));

      addFamilyComponent.addStudent();
      (addFamilyComponent.addFamilyForm as unknown as UntypedFormGroup).patchValue({
        guardianName: 'Chris Smith',
        altPickup: 'James Smith',
        address: '123 Avenue',
        email: 'csmith@email.com',
        students: [{ name: 'Jimmy', grade: '3', school: 'Morris Elementary', requestedSupplies: null }],
        timeAvailability: { earlyMorning: false, lateMorning: true, earlyAfternoon: false, lateAfternoon: false }
      });

      addFamilyComponent.submitForm();

      expect(addFamilySpy).toHaveBeenCalledWith(
        jasmine.objectContaining({
          students: [jasmine.objectContaining({ requestedSupplies: [] })]
        })
      );
    });

    it('should use undefined for null form fields via nullish coalescing', () => {
      const familyService = TestBed.inject(FamilyService);
      const addFamilySpy = spyOn(familyService, 'addFamily').and.returnValue(of('1'));

      addFamilyComponent.addStudent();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const setNull = (path: string) => (addFamilyComponent.addFamilyForm.get(path) as any).setValue(null);
      setNull('guardianName');
      setNull('email');
      setNull('address');
      setNull('students.0.name');
      setNull('students.0.grade');
      setNull('students.0.school');

      addFamilyComponent.submitForm();

      const call = addFamilySpy.calls.mostRecent().args[0];
      expect(call.guardianName).toBeUndefined();
      expect(call.email).toBeUndefined();
      expect(call.address).toBeUndefined();
    });
  });

  describe('formControlHasError edge cases', () => {
    it('should return false for a non-existent control name', () => {
      expect(addFamilyComponent.formControlHasError('nonExistentControl')).toBeFalse();
    });

    it('should return true if control is invalid and dirty (not touched)', () => {
      const nameControl = addFamilyForm.controls.guardianName;
      nameControl.setValue('');
      nameControl.markAsDirty();
      nameControl.markAsUntouched();

      expect(addFamilyComponent.formControlHasError('guardianName')).toBeTrue();
    });
  });

  describe('ngOnInit with settings', () => {
    it('should use empty array when settings.schools is null', () => {
      const settingsService = TestBed.inject(SettingsService);
      spyOn(settingsService, 'getSettings').and.returnValue(of({ schools: undefined } as unknown as AppSettings));

      addFamilyComponent.ngOnInit();

      expect(addFamilyComponent.schools).toEqual([]);
    });

    it('should populate schools from settings', () => {
      const settingsService = TestBed.inject(SettingsService);
      spyOn(settingsService, 'getSettings').and.returnValue(
        of({ schools: [{ name: 'Test School', abbreviation: 'TS' }] } as unknown as AppSettings)
      );

      addFamilyComponent.ngOnInit();

      expect(addFamilyComponent.schools.length).toBe(1);
      expect(addFamilyComponent.schools[0].name).toBe('Test School');
    });
  });
});
