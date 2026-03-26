// Angular and Material Imports
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { AbstractControl, FormGroup } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

// RxJS Imports
import { of, throwError } from 'rxjs';

// Inventory Service and Component Imports
import { MockInventoryService } from 'src/testing/inventory.service.mock';
import { AddInventoryComponent } from './add-inventory.component';
import { InventoryService } from './inventory.service';

// Tests for the AddInventoryComponent
describe('AddInventoryComponent', () => {
  let addInventoryComponent: AddInventoryComponent;
  let addInventoryForm: FormGroup;
  let fixture: ComponentFixture<AddInventoryComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        AddInventoryComponent,
        MatSnackBarModule
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {
          provide: InventoryService,
          useClass: MockInventoryService
        }
      ]
      // error handling for async compilation of components
    }).compileComponents().catch(error => {
      expect(error).toBeNull();
    });
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddInventoryComponent);
    addInventoryComponent = fixture.componentInstance;
    fixture.detectChanges();
    addInventoryForm = addInventoryComponent.addInventoryForm;
    expect(addInventoryForm).toBeDefined();
    expect(addInventoryForm.controls).toBeDefined();
  });

  // Tests that the component creates successfully
  it('should create the component and form', () => {
    expect(addInventoryComponent).toBeTruthy();
    expect(addInventoryForm).toBeTruthy();
  });

  // Tests that an initial, empty form is not valid
  it('form should be invalid when empty', () => {
    expect(addInventoryForm.valid).toBeFalsy();
  });

  // Tests For Item Input
  describe('The item field', () => {
    let itemControl: AbstractControl;

    beforeEach(() => {
      itemControl = addInventoryComponent.addInventoryForm.controls.item;
    });

    it('should not allow empty item names', () => {
      itemControl.setValue('');
      expect(itemControl.valid).toBeFalsy();
      expect(itemControl.hasError('required')).toBeTruthy();
    });

    it('should be fine with "T-Shirt"', () => {
      itemControl.setValue('T-Shirt');
      expect(itemControl.valid).toBeTruthy();
    });

    it('should accept items with numbers and special characters', () => {
      itemControl.setValue('Item #001-XL');
      expect(itemControl.valid).toBeTruthy();
    });
  });

  // Tests For Description Input
  describe('The description field', () => {
    let descriptionControl: AbstractControl;

    beforeEach(() => {
      descriptionControl = addInventoryComponent.addInventoryForm.controls.description;
    });

    it('should not allow empty descriptions', () => {
      descriptionControl.setValue('');
      expect(descriptionControl.valid).toBeFalsy();
      expect(descriptionControl.hasError('required')).toBeTruthy();
    });

    it('should allow detailed descriptions', () => {
      descriptionControl.setValue('Blue cotton t-shirt with crew neck');
      expect(descriptionControl.valid).toBeTruthy();
    });
  });

  // Tests For Brand Input
  describe('The brand field', () => {
    let brandControl: AbstractControl;

    beforeEach(() => {
      brandControl = addInventoryComponent.addInventoryForm.controls.brand;
    });

    it('should not allow empty brand', () => {
      brandControl.setValue('');
      expect(brandControl.valid).toBeFalsy();
      expect(brandControl.hasError('required')).toBeTruthy();
    });

    it('should accept brand names', () => {
      brandControl.setValue('Nike');
      expect(brandControl.valid).toBeTruthy();
    });
  });

  // Tests For Color Input
  describe('The color field', () => {
    let colorControl: AbstractControl;

    beforeEach(() => {
      colorControl = addInventoryComponent.addInventoryForm.controls.color;
    });

    it('should not allow empty color', () => {
      colorControl.setValue('');
      expect(colorControl.valid).toBeFalsy();
      expect(colorControl.hasError('required')).toBeTruthy();
    });

    it('should accept color values', () => {
      colorControl.setValue('Blue');
      expect(colorControl.valid).toBeTruthy();
    });

    it('should accept hex color codes', () => {
      colorControl.setValue('#0000FF');
      expect(colorControl.valid).toBeTruthy();
    });
  });

  // Tests For Size Input
  describe('The size field', () => {
    let sizeControl: AbstractControl;

    beforeEach(() => {
      sizeControl = addInventoryComponent.addInventoryForm.controls.size;
    });

    it('should not allow empty size', () => {
      sizeControl.setValue('');
      expect(sizeControl.valid).toBeFalsy();
      expect(sizeControl.hasError('required')).toBeTruthy();
    });

    it('should accept size values', () => {
      sizeControl.setValue('Large');
      expect(sizeControl.valid).toBeTruthy();
    });

    it('should accept numeric sizes', () => {
      sizeControl.setValue('42');
      expect(sizeControl.valid).toBeTruthy();
    });
  });

  // Tests For Type Input
  describe('The type field', () => {
    let typeControl: AbstractControl;

    beforeEach(() => {
      typeControl = addInventoryComponent.addInventoryForm.controls.type;
    });

    it('should not allow empty type', () => {
      typeControl.setValue('');
      expect(typeControl.valid).toBeFalsy();
      expect(typeControl.hasError('required')).toBeTruthy();
    });

    it('should accept type values', () => {
      typeControl.setValue('Clothing');
      expect(typeControl.valid).toBeTruthy();
    });
  });

  // Tests For Material Input
  describe('The material field', () => {
    let materialControl: AbstractControl;

    beforeEach(() => {
      materialControl = addInventoryComponent.addInventoryForm.controls.material;
    });

    it('should not allow empty material', () => {
      materialControl.setValue('');
      expect(materialControl.valid).toBeFalsy();
      expect(materialControl.hasError('required')).toBeTruthy();
    });

    it('should accept material values', () => {
      materialControl.setValue('Cotton');
      expect(materialControl.valid).toBeTruthy();
    });
  });

  // Tests For Count Input
  describe('The count field', () => {
    let countControl: AbstractControl;

    beforeEach(() => {
      countControl = addInventoryComponent.addInventoryForm.controls.count;
    });

    it('should not allow empty count', () => {
      countControl.setValue('');
      expect(countControl.valid).toBeFalsy();
      expect(countControl.hasError('required')).toBeTruthy();
    });

    it('should accept positive count values', () => {
      countControl.setValue('5');
      expect(countControl.valid).toBeTruthy();
    });

    it('should not allow zero count', () => {
      countControl.setValue('0');
      expect(countControl.valid).toBeFalsy();
      expect(countControl.hasError('min')).toBeTruthy();
    });

    it('should not allow negative count', () => {
      countControl.setValue('-1');
      expect(countControl.valid).toBeFalsy();
      expect(countControl.hasError('min')).toBeTruthy();
    });

    it('should accept high count values', () => {
      countControl.setValue('1000');
      expect(countControl.valid).toBeTruthy();
    });
  });

  // Tests For Quantity Input
  describe('The quantity field', () => {
    let quantityControl: AbstractControl;

    beforeEach(() => {
      quantityControl = addInventoryComponent.addInventoryForm.controls.quantity;
    });

    it('should not allow empty quantity', () => {
      quantityControl.setValue('');
      expect(quantityControl.valid).toBeFalsy();
      expect(quantityControl.hasError('required')).toBeTruthy();
    });

    it('should accept zero quantity', () => {
      quantityControl.setValue('0');
      expect(quantityControl.valid).toBeTruthy();
    });

    it('should accept positive quantity values', () => {
      quantityControl.setValue('10');
      expect(quantityControl.valid).toBeTruthy();
    });

    it('should not allow negative quantity', () => {
      quantityControl.setValue('-5');
      expect(quantityControl.valid).toBeFalsy();
      expect(quantityControl.hasError('min')).toBeTruthy();
    });
  });

  // Tests For Notes Input
  describe('The notes field', () => {
    let notesControl: AbstractControl;

    beforeEach(() => {
      notesControl = addInventoryComponent.addInventoryForm.controls.notes;
    });

    it('should allow empty notes', () => {
      notesControl.setValue('');
      expect(notesControl.valid).toBeTruthy();
    });

    it('should accept notes text', () => {
      notesControl.setValue('Store in cool, dry place');
      expect(notesControl.valid).toBeTruthy();
    });
  });

  // Tests for Form Validation
  describe('Form validity', () => {
    it('when all required fields are valid, the whole form should be valid', () => {
      addInventoryForm.controls.item.setValue('T-Shirt');
      addInventoryForm.controls.description.setValue('Blue cotton tee');
      addInventoryForm.controls.brand.setValue('Nike');
      addInventoryForm.controls.color.setValue('Blue');
      addInventoryForm.controls.size.setValue('Large');
      addInventoryForm.controls.type.setValue('Clothing');
      addInventoryForm.controls.material.setValue('Cotton');
      addInventoryForm.controls.count.setValue('10');
      addInventoryForm.controls.quantity.setValue('5');
      addInventoryForm.controls.notes.setValue('Some notes');

      expect(addInventoryForm.valid).toBeTrue();
    });

    it('form should be invalid if any required field is empty', () => {
      addInventoryForm.controls.item.setValue('T-Shirt');
      addInventoryForm.controls.description.setValue('Blue cotton tee');
      addInventoryForm.controls.brand.setValue('Nike');
      addInventoryForm.controls.color.setValue('Blue');
      addInventoryForm.controls.size.setValue('Large');
      addInventoryForm.controls.type.setValue('Clothing');
      addInventoryForm.controls.material.setValue('Cotton');
      addInventoryForm.controls.count.setValue('10');
      addInventoryForm.controls.quantity.setValue('5');
      // notes is optional, so we can leave it empty
      addInventoryForm.controls.notes.setValue('');

      expect(addInventoryForm.valid).toBeTrue();
    });

    it('form should be invalid if count is less than 1', () => {
      addInventoryForm.controls.item.setValue('T-Shirt');
      addInventoryForm.controls.description.setValue('Blue cotton tee');
      addInventoryForm.controls.brand.setValue('Nike');
      addInventoryForm.controls.color.setValue('Blue');
      addInventoryForm.controls.size.setValue('Large');
      addInventoryForm.controls.type.setValue('Clothing');
      addInventoryForm.controls.material.setValue('Cotton');
      addInventoryForm.controls.count.setValue('0');
      addInventoryForm.controls.quantity.setValue('5');

      expect(addInventoryForm.valid).toBeFalse();
    });

    it('form should be invalid if quantity is negative', () => {
      addInventoryForm.controls.item.setValue('T-Shirt');
      addInventoryForm.controls.description.setValue('Blue cotton tee');
      addInventoryForm.controls.brand.setValue('Nike');
      addInventoryForm.controls.color.setValue('Blue');
      addInventoryForm.controls.size.setValue('Large');
      addInventoryForm.controls.type.setValue('Clothing');
      addInventoryForm.controls.material.setValue('Cotton');
      addInventoryForm.controls.count.setValue('10');
      addInventoryForm.controls.quantity.setValue('-1');

      expect(addInventoryForm.valid).toBeFalse();
    });
  });

  // Tests for error messages
  describe('Error messages', () => {
    it('should return correct error message for required field', () => {
      const message = addInventoryComponent.getErrorMessage('item');
      expect(message).toContain('Item is required');
    });

    it('should return correct error message for count min validator', () => {
      const countControl = addInventoryComponent.addInventoryForm.controls.count;
      countControl.setValue('0');
      const message = addInventoryComponent.getErrorMessage('count');
      expect(message).toContain('Count must be a positive number');
    });

    it('should return correct error message for quantity min validator', () => {
      const quantityControl = addInventoryComponent.addInventoryForm.controls.quantity;
      quantityControl.setValue('-1');
      const message = addInventoryComponent.getErrorMessage('quantity');
      expect(message).toContain('Quantity cannot be negative');
    });
  });

  // Tests for form control error detection
  describe('Form control error detection', () => {
    it('formControlHasError should return true for invalid and touched controls', () => {
      const itemControl = addInventoryForm.controls.item;
      itemControl.setValue('');
      itemControl.markAsTouched();

      expect(addInventoryComponent.formControlHasError('item')).toBeTrue();
    });

    it('formControlHasError should return false for valid controls', () => {
      const itemControl = addInventoryForm.controls.item;
      itemControl.setValue('T-Shirt');
      itemControl.markAsTouched();

      expect(addInventoryComponent.formControlHasError('item')).toBeFalse();
    });

    it('formControlHasError should return false for invalid but untouched controls', () => {
      const itemControl = addInventoryForm.controls.item;
      itemControl.setValue('');

      expect(addInventoryComponent.formControlHasError('item')).toBeFalse();
    });
  });

  describe('Submit behavior', () => {
    it('should call addInventory and navigate on success', () => {
      const inventorySvc = TestBed.inject(InventoryService);
      const router = TestBed.inject(Router);
      const addSpy = spyOn(inventorySvc, 'addInventory').and.returnValue(of('new-id'));
      const navSpy = spyOn(router, 'navigate');

      addInventoryComponent.addInventoryForm.setValue({
        item: 'T-Shirt',
        description: 'Blue cotton tee',
        brand: 'Nike',
        color: 'Blue',
        count: '10',
        size: 'Large',
        type: 'Clothing',
        material: 'Cotton',
        quantity: '5',
        notes: 'Notes'
      });

      addInventoryComponent.submitForm();

      expect(addSpy).toHaveBeenCalled();
      expect(navSpy).toHaveBeenCalledWith(['/inventory', 'new-id']);
    });

    it('should show snackBar on 400 error', () => {
      const inventorySvc = TestBed.inject(InventoryService);
      const snackBar = TestBed.inject(MatSnackBar);
      spyOn(inventorySvc, 'addInventory').and.returnValue(throwError(() => ({ status: 400, message: 'Bad' })));
      const snackSpy = spyOn(snackBar, 'open');

      addInventoryComponent.submitForm();

      expect(snackSpy).toHaveBeenCalledWith(jasmine.stringMatching(/Tried to add an illegal new inventory item/), 'OK', { duration: 5000 });
    });

    it('should show snackBar on 500 error', () => {
      const inventorySvc = TestBed.inject(InventoryService);
      const snackBar = TestBed.inject(MatSnackBar);
      spyOn(inventorySvc, 'addInventory').and.returnValue(throwError(() => ({ status: 500, message: 'Error' })));
      const snackSpy = spyOn(snackBar, 'open');

      addInventoryComponent.submitForm();

      expect(snackSpy).toHaveBeenCalledWith(jasmine.stringMatching(/The server failed to process your request/), 'OK', { duration: 5000 });
    });
  });
});
