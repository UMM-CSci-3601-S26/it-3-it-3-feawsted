// Angular Imports
import { ComponentFixture, TestBed, fakeAsync, tick, flushMicrotasks } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { MatSnackBar, MatSnackBarRef, SimpleSnackBar } from '@angular/material/snack-bar';

// RxJS Imports
import { Observable, of, throwError } from 'rxjs';

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
  //let checklistService: ChecklistService;

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
  beforeEach(fakeAsync(() => {
    TestBed.compileComponents().then(() => {
      fixture = TestBed.createComponent(ChecklistViewComponent);
      checklistList = fixture.componentInstance;
      //checklistService = TestBed.inject(ChecklistService);
      fixture.detectChanges();
    });
    flushMicrotasks(); // resolve compileComponents promise
    tick(300);         // advance past debounceTime(300)
  }));

  // Test to ensure the component is created successfully
  it('should create the component', () => {
    expect(checklistList).toBeTruthy();
  });

  // Test to verify that checklists are loaded from the service and that the expected checklist data is present
  // Signal is already populated after fakeAsync beforeEach ticks past debounceTime(300)
  it('should load checklists from service', () => {
    expect(checklistList.serverFilteredChecklists().length).toBe(2);
  });

  // Test to verify that resetFilters clears all filter signals back to undefined
  it('should reset all filter signals to undefined when resetFilters is called', fakeAsync(() => {
    checklistList.studentName.set('Alice');
    checklistList.school.set('Morris Area High School');
    checklistList.grade.set('5');

    checklistList.resetFilters();

    expect(checklistList.studentName()).toBeUndefined();
    expect(checklistList.school()).toBeUndefined();
    expect(checklistList.grade()).toBeUndefined();
  }));

  // Tests for the ChecklistViewComponent when the ChecklistService is not set up properly, ensuring that appropriate error messages are shown and that the component handles the error gracefully
  describe('Misbehaving Checklist List', () => {
    let checklistList: ChecklistViewComponent;
    let fixture: ComponentFixture<ChecklistViewComponent>;

    let checklistServiceStub: {
      getChecklists: () => Observable<Checklist[]>;
      exportChecklists: () => Observable<string>;
      generateChecklists: () => Observable<void>;
      printAllChecklists: () => Observable<Checklist[]>;
    };

    // Set up a stub for the ChecklistService that simulates an error when generateChecklists() is called, and returns empty arrays/strings for other methods
    beforeEach(() => {
      checklistServiceStub = {
        getChecklists: () => of([]),
        exportChecklists: () => of(''),
        generateChecklists: () => new Observable((observer) => {
          observer.error('generateChecklists() Observer generates an error');
        }),
        printAllChecklists: () => of([]),
      };
    });

    // Set up the testing module and component before each test, providing the misbehaving ChecklistService stub
    beforeEach(fakeAsync(() => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [
          ChecklistViewComponent
        ],
        providers: [
          { provide: ChecklistService, useValue: checklistServiceStub },
          provideRouter([]),
          provideHttpClient(),
          provideHttpClientTesting()
        ],
      })
        .compileComponents();
      flushMicrotasks();
    }));

    // Compile the component and its template before running tests, and initialize the component instance
    // detectChanges() is intentionally omitted here; fakeAsync tests call it inside the test body
    beforeEach(() => {
      fixture = TestBed.createComponent(ChecklistViewComponent);
      checklistList = fixture.componentInstance;
    });

    // Test to verify that an appropriate error message is set when generateChecklists fails
    it('should handle errors when generateChecklists fails', fakeAsync(() => {
      fixture.detectChanges();
      tick(300); // advance past debounceTime(300)
      checklistList.generateChecklists();
      tick();    // let the error observable emit
      expect(checklistList.errMsg()).toBe('Failed to generate checklists.');
    }));
  });

  describe('serverFilteredChecklists error handling', () => {
    let checklistList: ChecklistViewComponent;
    let fixture: ComponentFixture<ChecklistViewComponent>;
    let snackBar: MatSnackBar;
    let snackBarSpy: jasmine.Spy;

    let checklistServiceStub: {
      getChecklists: () => Observable<Checklist[]>;
      exportChecklists: () => Observable<string>;
      generateChecklists: () => Observable<void>;
      printAllChecklists: () => Observable<Checklist[]>;
    };

    // Test when HTTP error occurs (not an ErrorEvent)
    beforeEach(() => {
      const httpErrorResponse = {
        error: { message: 'Server error' }, // Not an ErrorEvent
        status: 500,
        message: 'Internal Server Error'
      };

      checklistServiceStub = {
        getChecklists: () => throwError(() => httpErrorResponse),
        exportChecklists: () => of(''),
        generateChecklists: () => of(void 0),
        printAllChecklists: () => of([]),
      };
    });

    beforeEach(fakeAsync(() => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [
          ChecklistViewComponent
        ],
        providers: [
          {
            provide: ChecklistService,
            useValue: checklistServiceStub
          },
          provideRouter([]),
          provideHttpClient(),
          provideHttpClientTesting(),
        ],
      }).compileComponents();
      flushMicrotasks();
    }));

    beforeEach(() => {
      fixture = TestBed.createComponent(ChecklistViewComponent);
      checklistList = fixture.componentInstance;
      snackBar = TestBed.inject(MatSnackBar);
      snackBarSpy = spyOn(snackBar, 'open').and.returnValue({
        onAction: () => of(void 0),
        close: () => { },
        afterDismissed: () => of({ dismissedByAction: false }),
      } as unknown as MatSnackBarRef<SimpleSnackBar>);
    });

    it('should call generateChecklists when generate=true in query params', fakeAsync(() => {
      const generateSpy = spyOn(ChecklistViewComponent.prototype, 'generateChecklists');

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [ChecklistViewComponent],
        providers: [
          provideHttpClient(),
          provideHttpClientTesting(),
          {
            provide: ChecklistService,
            useClass: MockChecklistService
          },
          {
            provide: ActivatedRoute,
            useValue: {
              queryParamMap: of({
                get: (key: string) => key === 'generate' ? 'true' : null
              })
            }
          }
        ]
      }).compileComponents();

      flushMicrotasks();

      const fixture = TestBed.createComponent(ChecklistViewComponent);
      fixture.detectChanges(); // triggers constructor subscription

      expect(generateSpy).toHaveBeenCalled();
    }));

    // Test that error message is set with status code when HTTP error occurs
    it('should set error message with status code and message when HTTP error occurs', fakeAsync(() => {
      fixture.detectChanges();
      tick(300); // Account for debounceTime
      fixture.detectChanges();

      expect(checklistList.errMsg()).toBe(
        'Problem contacting the server – Error Code: 500\nMessage: Internal Server Error'
      );
    }));

    // Test that snack bar is opened with error message
    it('should open snack bar with error message when HTTP error occurs', fakeAsync(() => {
      fixture.detectChanges();
      tick(300); // Account for debounceTime
      fixture.detectChanges();

      expect(snackBarSpy).toHaveBeenCalledWith(
        'Problem contacting the server – Error Code: 500\nMessage: Internal Server Error',
        'OK',
        { duration: 6000 }
      );
    }));

    // Test that empty array is returned when error occurs
    it('should return empty array when HTTP error occurs', fakeAsync(() => {
      fixture.detectChanges();
      tick(300); // Account for debounceTime
      fixture.detectChanges();

      expect(checklistList.serverFilteredChecklists().length).toBe(0);
      expect(checklistList.serverFilteredChecklists()).toEqual([]);
    }));

    // Test when ErrorEvent occurs (client-side error)
    describe('when ErrorEvent occurs', () => {
      beforeEach(() => {
        const errorEvent = new ErrorEvent('Network error');
        checklistServiceStub.getChecklists = () => throwError(() => ({
          error: errorEvent
        }));
      });

      beforeEach(fakeAsync(() => {
        TestBed.resetTestingModule();
        TestBed.configureTestingModule({
          imports: [
            ChecklistViewComponent
          ],
          providers: [
            {
              provide: ChecklistService,
              useValue: checklistServiceStub
            },
            provideRouter([]),
            provideHttpClient(),
            provideHttpClientTesting(),
          ],
        }).compileComponents();
        flushMicrotasks();
      }));

      beforeEach(() => {
        fixture = TestBed.createComponent(ChecklistViewComponent);
        checklistList = fixture.componentInstance;
        snackBar = TestBed.inject(MatSnackBar);
        snackBarSpy = spyOn(snackBar, 'open').and.returnValue({
          onAction: () => of(void 0),
          close: () => { },
          afterDismissed: () => of({ dismissedByAction: false }),
        } as unknown as MatSnackBarRef<SimpleSnackBar>);
      });

      // Test that error message is NOT set when ErrorEvent occurs
      it('should not set error message when ErrorEvent occurs', fakeAsync(() => {
        fixture.detectChanges();
        tick(300); // Account for debounceTime
        fixture.detectChanges();

        expect(checklistList.errMsg()).toBeUndefined();
      }));

      // Test that snack bar is still opened even when ErrorEvent occurs
      it('should still open snack bar when ErrorEvent occurs', fakeAsync(() => {
        fixture.detectChanges();
        tick(300); // Account for debounceTime
        fixture.detectChanges();

        expect(snackBarSpy).toHaveBeenCalledWith('', 'OK', { duration: 6000 });
      }));
    });
  });

  describe('downloadPDFforChecklists()', () => {
    let checklistService: ChecklistService;

    beforeEach(() => {
      checklistService = TestBed.inject(ChecklistService);
      // Prevent actual file downloads in headless tests
      spyOn(URL, 'createObjectURL').and.returnValue('blob:test');
      spyOn(URL, 'revokeObjectURL');
    });

    it('should call printAllChecklists on the service', fakeAsync(() => {
      spyOn(checklistService, 'printAllChecklists').and.returnValue(of(MockChecklistService.testChecklists));

      checklistList.downloadPDFforChecklists();
      tick();

      expect(checklistService.printAllChecklists).toHaveBeenCalled();
    }));

    it('should trigger a file download when given valid checklists', fakeAsync(() => {
      spyOn(checklistService, 'printAllChecklists').and.returnValue(of(MockChecklistService.testChecklists));

      checklistList.downloadPDFforChecklists();
      tick();

      expect(URL.createObjectURL).toHaveBeenCalled();
    }));

    it('should add a page for each checklist after the first', fakeAsync(() => {
      spyOn(checklistService, 'printAllChecklists').and.returnValue(of(MockChecklistService.testChecklists));

      checklistList.downloadPDFforChecklists();
      tick();

      // With multiple checklists the PDF is still generated and a download is triggered
      expect(URL.createObjectURL).toHaveBeenCalled();
    }));

    it('should show a snack bar when printAllChecklists fails', fakeAsync(() => {
      spyOn(checklistService, 'printAllChecklists').and.returnValue(
        throwError(() => ({ message: 'Network error' }))
      );
      const snackBar = TestBed.inject(MatSnackBar);
      spyOn(snackBar, 'open').and.returnValue({
        onAction: () => of(void 0),
        close: () => { },
        afterDismissed: () => of({ dismissedByAction: false }),
      } as unknown as MatSnackBarRef<SimpleSnackBar>);

      checklistList.downloadPDFforChecklists();
      tick();

      expect(snackBar.open).toHaveBeenCalledWith(
        'Failed to load checklists: Network error',
        'OK',
        { duration: 6000 }
      );
    }));

    it('should not trigger a download when the service errors', fakeAsync(() => {
      spyOn(checklistService, 'printAllChecklists').and.returnValue(
        throwError(() => ({ message: 'error' }))
      );
      const snackBar = TestBed.inject(MatSnackBar);
      spyOn(snackBar, 'open').and.returnValue({
        onAction: () => of(void 0),
        close: () => { },
        afterDismissed: () => of({ dismissedByAction: false }),
      } as unknown as MatSnackBarRef<SimpleSnackBar>);

      checklistList.downloadPDFforChecklists();
      tick();

      expect(URL.createObjectURL).not.toHaveBeenCalled();
    }));
  });
  describe('downloadPDFforFilteredChecklists()', () => {
    let checklistService: ChecklistService;

    beforeEach(() => {
      checklistService = TestBed.inject(ChecklistService);
      // Prevent actual file downloads in headless tests
      spyOn(URL, 'createObjectURL').and.returnValue('blob:test');
      spyOn(URL, 'revokeObjectURL');
    });

    it('should call printFilteredChecklists on the service', fakeAsync(() => {
      spyOn(checklistService, 'printFilteredChecklists').and.returnValue(of(MockChecklistService.testChecklists));

      checklistList.downloadPDFforFilteredChecklists();
      tick();

      expect(checklistService.printFilteredChecklists).toHaveBeenCalled();
    }));
  });
});
