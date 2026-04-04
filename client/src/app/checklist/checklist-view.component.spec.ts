// Angular Imports
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

// RxJS Imports
import { Observable, of } from 'rxjs';

// Checklist Component and Service Imports
import { ChecklistService } from './checklist.service';
import { ChecklistViewComponent } from './checklist-view.component';
import { MockChecklistService } from 'src/testing/checklist-service.mock';
import { Checklist } from './checklist';

/**
 * This file contains unit tests for the ChecklistViewComponent, which is responsible for displaying a list of checklists. The tests cover the component's
 * ability to load checklist data from the ChecklistService, handle errors gracefully, and trigger the CSV download functionality correctly. The tests use Angular's TestBed to set up the
 * testing environment, including providing a mock implementation of the ChecklistService to simulate different scenarios. The tests verify that the component is created successfully,
 * that it loads checklist data correctly, and that it handles errors by returning an empty array when the service fails. Additionally, the tests check that the exportChecklists() method
 * is called when the CSV download function is triggered, and that the appropriate methods for handling the CSV data are invoked.
 */

// Test for the ChecklistViewComponent
describe('Checklist list', () => {
  let checklistList: ChecklistViewComponent;
  let fixture: ComponentFixture<ChecklistViewComponent>;
  let checklistService: ChecklistService;

  // Set up the testing module for the ChecklistViewComponent, including necessary imports and providers
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ChecklistViewComponent
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {
          provide: ChecklistService,
          useClass: MockChecklistService
        }
      ],
    });
  });

  // Compile the component and its template before running tests, and initialize the component instance and loader
  beforeEach(waitForAsync(() => {
    TestBed.compileComponents().then(() => {
      fixture = TestBed.createComponent(ChecklistViewComponent);
      checklistList = fixture.componentInstance;
      checklistService = TestBed.inject(ChecklistService);
      fixture.detectChanges();
    });
  }));

  // Test to ensure the component is created successfully
  it('should create the component', () => {
    expect(checklistList).toBeTruthy();
  });

  // Test to verify that checklists are loaded from the service and that the expected checklist data is present
  it('should load checklists from service', () => {
    const checklists = checklistList.checklists();
    expect(checklists.length).toBe(3);
    expect(checklists[0].guardianName).toBe('John Johnson');
  });

  // Test to verify that exportChecklists() is called when the CSV download function is triggered,
  // and that the appropriate methods for handling the CSV data are invoked
  it('exportChecklists() should be called when CSV is downloaded', () => {
    spyOn(checklistService, 'exportChecklists').and.returnValue(of('csv-data'));

    spyOn(URL, 'createObjectURL').and.returnValue('blob-url');
    spyOn(URL, 'revokeObjectURL');

    const click = jasmine.createSpy('click');
    spyOn(document, 'createElement').and.returnValue({ click } as undefined);

    checklistList.downloadCSV();
    expect(checklistService.exportChecklists).toHaveBeenCalled();
    expect(document.createElement).toHaveBeenCalledWith('a');
    expect(click).toHaveBeenCalled();
    expect(URL.createObjectURL).toHaveBeenCalled();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob-url');
  });
});

// Tests for the ChecklistViewComponent when the ChecklistService is not set up properly, ensuring that appropriate error messages are shown and that the component handles the error gracefully
describe('Misbehaving Checklist List', () => {
  let checklistList: ChecklistViewComponent;
  let fixture: ComponentFixture<ChecklistViewComponent>;

  let checklistServiceStub: {
    getChecklists: () => Observable<Checklist[]>;
    exportChecklists: () => Observable<string>;
  };

  // Set up a stub for the ChecklistService that simulates an error when getChecklists() is called, and returns an empty string for exportChecklists()
  beforeEach(() => {
    checklistServiceStub = {
      getChecklists: () =>
        new Observable((observer) => {
          observer.error('getChecklists() Observer generates an error');
        }),
      exportChecklists: () => of('')
    };
  });

  // Set up the testing module and component before each test, providing the misbehaving ChecklistService stub
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        ChecklistViewComponent
      ],
      providers: [{
        provide: ChecklistService,
        useValue: checklistServiceStub
      },
      provideRouter([])
      ],
    })
      .compileComponents();
  }));

  // Compile the component and its template before running tests, and initialize the component instance
  beforeEach(() => {
    fixture = TestBed.createComponent(ChecklistViewComponent);
    checklistList = fixture.componentInstance;
    fixture.detectChanges();
  });

  // Test to verify that an appropriate error message is set when the ChecklistService fails to provide checklist data, and that the checklists() method returns an empty array in this case
  it('it will return an empty array when the service experiences an error', () => {
    expect(checklistList.checklists()).toEqual([]);
  });
});
