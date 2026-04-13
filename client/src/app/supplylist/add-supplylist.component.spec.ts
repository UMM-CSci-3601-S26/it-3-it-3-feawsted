import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MockSupplyListService } from 'src/testing/supplylist.service.mock'
import { AddSupplyListComponent } from './add-supplylist.component';
import { SupplyListService } from './supplylist.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { throwError } from 'rxjs'; //of

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

  describe('The item key field', () => {
    let itemKeyControl: AbstractControl;

    beforeEach(() => {
      itemKeyControl = addSupplyListComponent.addSupplyListForm.controls.itemKey;
    });

    it('should not allow empty item keys', () => {
      itemKeyControl.setValue('');
      expect(itemKeyControl.valid).toBeFalsy();
    });

    it('should be fine with "the_ball"', () => {
      itemKeyControl.setValue('the_ball');
      expect(itemKeyControl.valid).toBeTruthy();
    });

    // it('should fail on non key format', () => {
    //   itemKeyControl.setValue('The Ball');
    //   expect(itemKeyControl.valid).toBeFalsy();
    // });

  });

  describe('The item name field', () => {
    let itemNameControl: AbstractControl;

    beforeEach(() => {
      itemNameControl = addSupplyListComponent.addSupplyListForm.controls.itemName;
    });

    it('should not allow empty name keys', () => {
      itemNameControl.setValue('');
      expect(itemNameControl.valid).toBeFalsy();
    });

    it('should be fine with "the_ball"', () => {
      itemNameControl.setValue('The Ball');
      expect(itemNameControl.valid).toBeTruthy();
    });

  });

  describe('The quantityAvailable field', () => {
    let quantityAvailableControl: AbstractControl;

    beforeEach(() => {
      quantityAvailableControl = addSupplyListComponent.addSupplyListForm.controls.quantityAvailable;
    });

    it('should not allow empty quantities', () => {
      quantityAvailableControl.setValue('');
      expect(quantityAvailableControl.valid).toBeFalsy();
    });

    it('should be fine with whole numbers', () => {
      quantityAvailableControl.setValue(4);
      expect(quantityAvailableControl.valid).toBeTruthy();
    });

    it('shouldnt allow only strings to input', () => {
      quantityAvailableControl.setValue('x');
      expect(quantityAvailableControl.valid).toBeFalsy();
      expect(quantityAvailableControl.hasError('pattern')).toBeTruthy();
    });

    it('should allow only numbers equal or greater then 0', () => {
      quantityAvailableControl.setValue(-2);
      expect(quantityAvailableControl.valid).toBeFalsy();
      expect(quantityAvailableControl.hasError('min')).toBeTruthy();
    });
  });


  describe('getErrorMessage()', () => {
    it('should return the correct error message', () => {
      let controlName: keyof typeof addSupplyListComponent.addSupplyListValidationMessages = 'itemKey';
      addSupplyListComponent.addSupplyListForm.get(controlName).setErrors({'required': true});
      expect(addSupplyListComponent.getErrorMessage(controlName)).toEqual('Item key is required');

      controlName = 'itemName';
      addSupplyListComponent.addSupplyListForm.get(controlName).setErrors({'required': true});
      expect(addSupplyListComponent.getErrorMessage(controlName)).toEqual('Item name is required');

      controlName = 'quantityAvailable';
      addSupplyListComponent.addSupplyListForm.get(controlName).setErrors({'required': true});
      expect(addSupplyListComponent.getErrorMessage(controlName)).toEqual('Quantity is required');
    });

    it('should return "Unknown error" if no error message is found', () => {
      // The type statement is needed to ensure that `controlName` isn't just any
      // random string, but rather one of the keys of the `addSupplyListValidationMessages`
      // map in the component.
      const controlName: keyof typeof addSupplyListComponent.addSupplyListValidationMessages = 'itemKey';
      addSupplyListComponent.addSupplyListForm.get(controlName).setErrors({'unknown': true});
      expect(addSupplyListComponent.getErrorMessage(controlName)).toEqual('Unknown error');
    });

  });
});

// A lot of these tests mock the service using an approach like this doc example
// https://angular.dev/guide/testing/components-scenarios#more-async-tests
// The same way that the following allows the mock to be used:

// TestBed.configureTestingModule({
//   providers: [{provide: TwainQuotes, useClass: MockTwainQuotes}], // A (more-async-tests) - provide + use class of the mock
// });
// const twainQuotes = TestBed.inject(TwainQuotes) as MockTwainQuotes; // B (more-async-tests) - inject the service as the mock

// Is how these tests work with the mock then being injected in

describe('AddSupplyListComponent#submitForm()', () => {
  let component: AddSupplyListComponent;
  let fixture: ComponentFixture<AddSupplyListComponent>;
  let inventoryService: SupplyListService;
  let location: Location;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        AddSupplyListComponent,
        MatSnackBarModule
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {provide: SupplyListService, useClass: MockSupplyListService }, // A (more-async-tests) - provide + use class of the mock
        // provideRouter([
        //   { path: 'inventory/:id', component: SupplyListListComponent }
        // ])
      ]
    }).compileComponents().catch(error => {
      expect(error).toBeNull();
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddSupplyListComponent);
    component = fixture.componentInstance;
    inventoryService = TestBed.inject(SupplyListService); // B (more-async-tests) - inject the service as the mock
    location = TestBed.inject(Location);
    TestBed.inject(Router);
    TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  beforeEach(() => {
    component.addSupplyListForm.controls.item.setValue('red_folder');
    component.addSupplyListForm.controls.item.setValue('Folder');
    component.addSupplyListForm.controls.quantityAvailable.setValue(6);
  });

  // it('should call addSupplyList() and handle success response', fakeAsync(() => {
  //   const addSupplyListSpy = spyOn(inventoryService, 'addSupplyList').and.returnValue(of('1'));
  //   component.submitForm();
  //   expect(addSupplyListSpy).toHaveBeenCalledWith(component.addSupplyListForm.value);
  //   tick();
  //   expect(location.path()).toBe('/inventory/1');
  //   flush();
  // }));

  it('should call addSupplyList() and handle error response', () => {
    const path = location.path();
    const errorResponse = { status: 500, message: 'Server error' };
    const addSupplyListSpy = spyOn(inventoryService, 'addSupplyList')
      .and
      .returnValue(throwError(() => errorResponse));
    component.submitForm();
    expect(addSupplyListSpy).toHaveBeenCalledWith(component.addSupplyListForm.value);
    expect(location.path()).toBe(path);
  });


  it('should call addSupplyList() and handle error response for illegal inventory', () => {
    const path = location.path();
    const errorResponse = { status: 400, message: 'Illegal inventory error' };

    const addSupplyListSpy = spyOn(inventoryService, 'addSupplyList')
      .and
      .returnValue(throwError(() => errorResponse));
    component.submitForm();
    expect(addSupplyListSpy).toHaveBeenCalledWith(component.addSupplyListForm.value);
    expect(location.path()).toBe(path);
  });

  it('should call addSupplyList() and handle unexpected error response if it arises', () => {
    const path = location.path();
    const errorResponse = { status: 404, message: 'Not found' };

    const addSupplyListSpy = spyOn(inventoryService, 'addSupplyList')
      .and
      .returnValue(throwError(() => errorResponse));
    component.submitForm();
    expect(addSupplyListSpy).toHaveBeenCalledWith(component.addSupplyListForm.value);
    expect(location.path()).toBe(path);
  });
});
