import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MockSupplyListService } from 'src/testing/supplylist.service.mock';
import { AddSupplyListComponent } from './add-supplylist.component';
import { SupplyListService } from './supplylist.service';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { of, throwError } from 'rxjs';
import { AbstractControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { provideRouter } from '@angular/router';
import { Location } from '@angular/common';

describe('AddSupplyListComponent', () => {
  let addSupplyListComponent: AddSupplyListComponent;
  let addSupplyListForm: FormGroup;
  let fixture: ComponentFixture<AddSupplyListComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        AddSupplyListComponent,
        MatSnackBarModule
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: SupplyListService, useClass: MockSupplyListService }
      ]
    }).compileComponents().catch(error => {
      expect(error).toBeNull();
    });
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddSupplyListComponent);
    addSupplyListComponent = fixture.componentInstance;
    fixture.detectChanges();
    addSupplyListForm = addSupplyListComponent.addSupplyListForm;
    expect(addSupplyListForm).toBeDefined();
    expect(addSupplyListForm.controls).toBeDefined();
  });

  it('should create the component and form', () => {
    expect(addSupplyListComponent).toBeTruthy();
    expect(addSupplyListForm).toBeTruthy();
  });

  it('form should be invalid when empty', () => {
    expect(addSupplyListForm.valid).toBeFalsy();
  });

  describe('The school field', () => {
    let schoolControl: AbstractControl;

    beforeEach(() => {
      schoolControl = addSupplyListForm.controls.school;
    });

    it('should not allow empty school', () => {
      schoolControl.setValue('');
      expect(schoolControl.valid).toBeFalsy();
    });

    it('should be valid with a school name', () => {
      schoolControl.setValue('MHS');
      expect(schoolControl.valid).toBeTruthy();
    });
  });

  describe('The grade field', () => {
    let gradeControl: AbstractControl;

    beforeEach(() => {
      gradeControl = addSupplyListForm.controls.grade;
    });

    it('should not allow empty grade', () => {
      gradeControl.setValue('');
      expect(gradeControl.valid).toBeFalsy();
    });

    it('should be valid with a grade value', () => {
      gradeControl.setValue('3rd');
      expect(gradeControl.valid).toBeTruthy();
    });
  });

  describe('The item field', () => {
    let itemControl: AbstractControl;

    beforeEach(() => {
      itemControl = addSupplyListForm.controls.item;
    });

    it('should not allow empty item', () => {
      itemControl.setValue('');
      expect(itemControl.valid).toBeFalsy();
    });

    it('should be valid with an item name', () => {
      itemControl.setValue('Markers');
      expect(itemControl.valid).toBeTruthy();
    });
  });

  describe('The brand field', () => {
    let brandControl: AbstractControl;

    beforeEach(() => {
      brandControl = addSupplyListForm.controls.brand;
    });

    it('should not allow empty brand', () => {
      brandControl.setValue('');
      expect(brandControl.valid).toBeFalsy();
    });

    it('should be valid with a brand name', () => {
      brandControl.setValue('Crayola');
      expect(brandControl.valid).toBeTruthy();
    });
  });

  describe('The color field', () => {
    let colorControl: AbstractControl;

    beforeEach(() => {
      colorControl = addSupplyListForm.controls.color;
    });

    it('should not allow empty color', () => {
      colorControl.setValue('');
      expect(colorControl.valid).toBeFalsy();
    });

    it('should be valid with a color value', () => {
      colorControl.setValue('Red');
      expect(colorControl.valid).toBeTruthy();
    });
  });

  describe('The count field', () => {
    let countControl: AbstractControl;

    beforeEach(() => {
      countControl = addSupplyListForm.controls.count;
    });

    it('should not allow empty count', () => {
      countControl.setValue('');
      expect(countControl.valid).toBeFalsy();
    });

    it('should be valid with a positive number', () => {
      countControl.setValue(5);
      expect(countControl.valid).toBeTruthy();
    });

    it('should not allow count less than 1', () => {
      countControl.setValue(0);
      expect(countControl.valid).toBeFalsy();
      expect(countControl.hasError('min')).toBeTruthy();
    });
  });

  describe('The size field', () => {
    let sizeControl: AbstractControl;

    beforeEach(() => {
      sizeControl = addSupplyListForm.controls.size;
    });

    it('should not allow empty size', () => {
      sizeControl.setValue('');
      expect(sizeControl.valid).toBeFalsy();
    });

    it('should be valid with a size value', () => {
      sizeControl.setValue('Wide');
      expect(sizeControl.valid).toBeTruthy();
    });
  });

  describe('The type field', () => {
    let typeControl: AbstractControl;

    beforeEach(() => {
      typeControl = addSupplyListForm.controls.type;
    });

    it('should not allow empty type', () => {
      typeControl.setValue('');
      expect(typeControl.valid).toBeFalsy();
    });

    it('should be valid with a type value', () => {
      typeControl.setValue('Washable');
      expect(typeControl.valid).toBeTruthy();
    });
  });

  describe('The material field', () => {
    let materialControl: AbstractControl;

    beforeEach(() => {
      materialControl = addSupplyListForm.controls.material;
    });

    it('should not allow empty material', () => {
      materialControl.setValue('');
      expect(materialControl.valid).toBeFalsy();
    });

    it('should be valid with a material value', () => {
      materialControl.setValue('Plastic');
      expect(materialControl.valid).toBeTruthy();
    });
  });

  describe('The description field', () => {
    let descriptionControl: AbstractControl;

    beforeEach(() => {
      descriptionControl = addSupplyListForm.controls.description;
    });

    it('should not allow empty description', () => {
      descriptionControl.setValue('');
      expect(descriptionControl.valid).toBeFalsy();
    });

    it('should be valid with a description', () => {
      descriptionControl.setValue('8 Pack of Washable Wide Markers');
      expect(descriptionControl.valid).toBeTruthy();
    });
  });

  describe('The quantity field', () => {
    let quantityControl: AbstractControl;

    beforeEach(() => {
      quantityControl = addSupplyListForm.controls.quantity;
    });

    it('should not allow empty quantity', () => {
      quantityControl.setValue('');
      expect(quantityControl.valid).toBeFalsy();
    });

    it('should be valid with a positive number', () => {
      quantityControl.setValue(4);
      expect(quantityControl.valid).toBeTruthy();
    });

    it('should not allow quantity less than 1', () => {
      quantityControl.setValue(0);
      expect(quantityControl.valid).toBeFalsy();
      expect(quantityControl.hasError('min')).toBeTruthy();
    });
  });

  describe('The notes field', () => {
    let notesControl: AbstractControl;

    beforeEach(() => {
      notesControl = addSupplyListForm.controls.notes;
    });

    it('should allow empty notes', () => {
      notesControl.setValue('');
      expect(notesControl.valid).toBeTruthy();
    });

    it('should be valid with notes text', () => {
      notesControl.setValue('Some extra notes');
      expect(notesControl.valid).toBeTruthy();
    });
  });

  describe('getErrorMessage()', () => {
    it('should return the correct error messages for required fields', () => {
      let controlName: keyof typeof addSupplyListComponent.validationMessages = 'school';
      addSupplyListComponent.addSupplyListForm.get(controlName)!.setErrors({ required: true });
      expect(addSupplyListComponent.getErrorMessage(controlName)).toEqual('School is required');

      controlName = 'item';
      addSupplyListComponent.addSupplyListForm.get(controlName)!.setErrors({ required: true });
      expect(addSupplyListComponent.getErrorMessage(controlName)).toEqual('Item is required');

      controlName = 'quantity';
      addSupplyListComponent.addSupplyListForm.get(controlName)!.setErrors({ required: true });
      expect(addSupplyListComponent.getErrorMessage(controlName)).toEqual('Quantity is required');

      controlName = 'quantity';
      addSupplyListComponent.addSupplyListForm.get(controlName)!.setErrors({ min: true });
      expect(addSupplyListComponent.getErrorMessage(controlName)).toEqual('Quantity must be at least 1');

      controlName = 'count';
      addSupplyListComponent.addSupplyListForm.get(controlName)!.setErrors({ min: true });
      expect(addSupplyListComponent.getErrorMessage(controlName)).toEqual('Count must be at least 1');
    });

    it('should return "Unknown error" if no error message is found', () => {
      // notes has an empty validationMessages array, so any error returns 'Unknown error'
      const controlName: keyof typeof addSupplyListComponent.validationMessages = 'notes';
      addSupplyListComponent.addSupplyListForm.get(controlName)!.setErrors({ unknown: true });
      expect(addSupplyListComponent.getErrorMessage(controlName)).toEqual('Unknown error');
    });
  });
});

// Tests for AddSupplyListComponent#submitForm()
// These mock the service using the approach described at:
// https://angular.dev/guide/testing/components-scenarios#more-async-tests

describe('AddSupplyListComponent#submitForm()', () => {
  let component: AddSupplyListComponent;
  let fixture: ComponentFixture<AddSupplyListComponent>;
  let supplyListService: SupplyListService;
  let location: Location;
  let router: Router;

  const validFormValues = {
    school: 'MHS',
    grade: 'PreK',
    item: 'Markers',
    brand: 'Crayola',
    color: 'N/A',
    count: '8',
    size: 'Wide',
    type: 'Washable',
    material: 'N/A',
    description: '8 Pack of Washable Wide Markers',
    quantity: '3',
    notes: ''
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        AddSupplyListComponent,
        MatSnackBarModule
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: SupplyListService, useClass: MockSupplyListService }
      ]
    }).compileComponents().catch(error => {
      expect(error).toBeNull();
    });
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddSupplyListComponent);
    component = fixture.componentInstance;
    supplyListService = TestBed.inject(SupplyListService);
    location = TestBed.inject(Location);
    router = TestBed.inject(Router);
    TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  beforeEach(() => {
    component.addSupplyListForm.setValue(validFormValues);
  });

  it('should call addSupplyList() and navigate to /supplylist on success', () => {
    const addSupplyListSpy = spyOn(supplyListService, 'addSupplyList').and.returnValue(of('new-id'));
    const navigateSpy = spyOn(router, 'navigate');
    component.submitForm();
    expect(addSupplyListSpy).toHaveBeenCalled();
    expect(navigateSpy).toHaveBeenCalledWith(['/supplylist']);
  });

  it('should call addSupplyList() and handle 500 error response', () => {
    const path = location.path();
    const errorResponse = { status: 500, message: 'Server error' };
    const addSupplyListSpy = spyOn(supplyListService, 'addSupplyList')
      .and.returnValue(throwError(() => errorResponse));
    component.submitForm();
    expect(addSupplyListSpy).toHaveBeenCalled();
    expect(location.path()).toBe(path);
  });

  it('should call addSupplyList() and handle 400 error response', () => {
    const path = location.path();
    const errorResponse = { status: 400, message: 'Bad request' };
    const addSupplyListSpy = spyOn(supplyListService, 'addSupplyList')
      .and.returnValue(throwError(() => errorResponse));
    component.submitForm();
    expect(addSupplyListSpy).toHaveBeenCalled();
    expect(location.path()).toBe(path);
  });

  it('should call addSupplyList() and handle 404 error response', () => {
    const path = location.path();
    const errorResponse = { status: 404, message: 'Not found' };
    const addSupplyListSpy = spyOn(supplyListService, 'addSupplyList')
      .and.returnValue(throwError(() => errorResponse));
    component.submitForm();
    expect(addSupplyListSpy).toHaveBeenCalled();
    expect(location.path()).toBe(path);
  });
});
