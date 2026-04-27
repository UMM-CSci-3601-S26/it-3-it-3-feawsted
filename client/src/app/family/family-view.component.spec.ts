// Angular Imports
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

// RxJS Imports
import { Observable, of } from 'rxjs';

// Family Component and Service Imports
import { FamilyService } from './family.service';
import { FamilyViewComponent } from './family-view.component';
import { MockFamilyService } from 'src/testing/family-service.mock';
import { Family } from './family';

/**
 * This file contains unit tests for the FamilyViewComponent, which is responsible for displaying a list of families. The tests cover the component's
 * ability to load family data from the FamilyService, handle errors gracefully, and trigger the CSV download functionality correctly. The tests use Angular's TestBed to set up the
 * testing environment, including providing a mock implementation of the FamilyService to simulate different scenarios. The tests verify that the component is created successfully,
 * that it loads family data correctly, and that it handles errors by returning an empty array when the service fails. Additionally, the tests check that the exportFamilies() method
 * is called when the CSV download function is triggered, and that the appropriate methods for handling the CSV data are invoked.
 */

// Test for the FamilyViewComponent
describe('Family list', () => {
  let familyList: FamilyViewComponent;
  let fixture: ComponentFixture<FamilyViewComponent>;
  let familyService: FamilyService;

  // Set up the testing module for the FamilyViewComponent, including necessary imports and providers
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        FamilyViewComponent
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {
          provide: FamilyService,
          useClass: MockFamilyService
        }
      ],
    });
  });

  // Compile the component and its template before running tests, and initialize the component instance and loader
  beforeEach(waitForAsync(() => {
    TestBed.compileComponents().then(() => {
      fixture = TestBed.createComponent(FamilyViewComponent);
      familyList = fixture.componentInstance;
      familyService = TestBed.inject(FamilyService);
      fixture.detectChanges();
    });
  }));

  // Test to ensure the component is created successfully
  it('should create the component', () => {
    expect(familyList).toBeTruthy();
  });

  // Test to verify that families are loaded from the service and that the expected family data is present
  it('should load families from service', () => {
    const families = familyList.families();
    expect(families).toBeDefined();
    expect(families?.length).toBe(3);
    expect(families?.[0].guardianName).toBe('John Johnson');
  });

  // Test to verify that exportFamilies() is called when the CSV download function is triggered,
  // and that the appropriate methods for handling the CSV data are invoked
  it('exportFamilies() should be called when CSV is downloaded', () => {
    spyOn(familyService, 'exportFamilies').and.returnValue(of('csv-data'));

    spyOn(URL, 'createObjectURL').and.returnValue('blob-url');
    spyOn(URL, 'revokeObjectURL');

    const click = jasmine.createSpy('click');
    spyOn(document, 'createElement').and.returnValue({ click } as unknown as HTMLElement);

    familyList.downloadCSV();
    expect(familyService.exportFamilies).toHaveBeenCalled();
    expect(document.createElement).toHaveBeenCalledWith('a');
    expect(click).toHaveBeenCalled();
    expect(URL.createObjectURL).toHaveBeenCalled();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob-url');
  });
});

// Tests for the FamilyViewComponent when the FamilyService is not set up properly, ensuring that appropriate error messages are shown and that the component handles the error gracefully
describe('Misbehaving Family List', () => {
  let familyList: FamilyViewComponent;
  let fixture: ComponentFixture<FamilyViewComponent>;

  let familyServiceStub: {
    getFamilies: () => Observable<Family[]>;
    exportFamilies: () => Observable<string>;
    editInventory: (id: string, family: Family) => Observable<void>;
  };

  // Set up a stub for the FamilyService that simulates an error when getFamilies() is called, and returns an empty string for exportFamilies()
  beforeEach(() => {
    familyServiceStub = {
      getFamilies: () =>
        new Observable((observer) => {
          observer.error('getFamilies() Observer generates an error');
        }),
      exportFamilies: () => of(''),
      editInventory: () => of(void 0)
    };
  });

  // Set up the testing module and component before each test, providing the misbehaving FamilyService stub
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        FamilyViewComponent
      ],
      providers: [{
        provide: FamilyService,
        useValue: familyServiceStub
      },
      provideRouter([])
      ],
    })
      .compileComponents();
  }));

  // Compile the component and its template before running tests, and initialize the component instance
  beforeEach(() => {
    fixture = TestBed.createComponent(FamilyViewComponent);
    familyList = fixture.componentInstance;
    fixture.detectChanges();
  });

  // Test to verify that an appropriate error message is set when the FamilyService fails to provide family data, and that the families() method returns an empty array in this case
  it('it will return an empty array when the service experiences an error', () => {
    expect(familyList.families()).toEqual([]);
  });


  it('should call familyService.editInventory when updateFamily is triggered', () => {
    const updatedFamily: Family = { _id: '123', guardianName: 'New Name' } as Family;
    // We spy on the stub to see if it's called
    const editSpy = spyOn(familyServiceStub, 'editInventory').and.returnValue(of(void 0));

    // Prevent the actual page reload during tests which would crash the test runner
    spyOn(window.location, 'reload');

    familyList.updateFamily(updatedFamily);

    expect(editSpy).toHaveBeenCalledWith('123', updatedFamily);
  });

  it('should alert the user if the update fails', () => {
    const updatedFamily: Family = { _id: '123' } as Family;
    // Simulate a server error (like the 404 you saw earlier)
    spyOn(familyServiceStub, 'editInventory').and.returnValue(
      new Observable(obs => obs.error('Server Error'))
    );
    spyOn(window, 'alert');

    familyList.updateFamily(updatedFamily);

    expect(window.alert).toHaveBeenCalledWith('Could not save changes. Check the console.');
  });

});
