// Angular Testing Imports
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ChecklistCardComponent } from './checklist-card.component';

// Family Interface Import
import { Checklist } from './checklist';
import { MockChecklistService } from 'src/testing/checklist-service.mock';
import { ChecklistService } from './checklist.service';
//import { throwError } from 'rxjs'; //of

// Test suite for the FamilyCardComponent, which displays information about a family and their requested supplies
describe('ChecklistCardComponent', () => {
  let component: ChecklistCardComponent;
  let fixture: ComponentFixture<ChecklistCardComponent>;
  let expectedChecklist: Checklist;
  let saveSpy: jasmine.Spy;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        ChecklistCardComponent],
      providers: [
        { provide: ChecklistService, useClass: MockChecklistService }]
    })
    // Compile the component and its template before running tests
      .compileComponents();
  }));

  // Set up the component instance and provide it with a sample family before each test
  beforeEach(() => {
    saveSpy = jasmine.createSpy('save');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as unknown as { jsPDF: () => any }).jsPDF = function () {};

    // Now safely spy on it without using <any>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    spyOn(window as unknown as { jsPDF: () => any }, 'jsPDF').and.returnValue({
      internal: { pageSize: { getWidth: () => 200, getHeight: () => 300 } },
      setFontSize: () => {},
      setFont: () => {},
      text: () => {},
      line: () => {},
      rect: () => {},
      splitTextToSize: () => ['line1'],
      addPage: () => {},
      save: saveSpy
    });


    expectedChecklist = {
      _id: 'chris_id',
      studentName: 'Chris',
      guardianName: 'Alex Jon',
      altPickUp: 'Jamie Bob',
      grade: '3',
      school: 'AHS',
      requestedSupplies: ["backpack"],
      checklist: [
        {
          supply: MockChecklistService.mockSupply1,
          completed: false,
          unreceived: false,
          selectedOption: ''
        }
      ]
    };

    fixture = TestBed.createComponent(ChecklistCardComponent);
    fixture.componentRef.setInput('checklist', expectedChecklist);
    fixture.detectChanges();
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should be associated with the correct studentName', () => {
    expect(component.checklist().studentName).toEqual(expectedChecklist.studentName);
  });

  it('should be the studentName Chris', () => {
    expect(component.checklist().studentName).toEqual('Chris');
  });


  it('should correctly format a supply label without "?"', () => {
    const supply = MockChecklistService.mockSupply3;

    const label = component.toLabel(supply);

    // The label should start with the quantity number
    expect(label.startsWith(`${supply.quantity}`)).toBeTrue();

    // Notes cleaned of placeholders
    expect(label).not.toContain('?');
  });

  //describe('downloadPDFforIndividualChecklist()', () => {

  // it('should call ChecklistService with the correct ID and save a PDF', () => {
  //   const service = TestBed.inject(ChecklistService) as MockChecklistService;

  //   // Mock service response
  //   spyOn(service, 'printIndividualChecklist').and.returnValue(of(expectedChecklist));

  //   component.downloadPDFforIndividualChecklist();

  //   expect(service.printIndividualChecklist).toHaveBeenCalledWith('chris_id');
  //   expect(saveSpy).toHaveBeenCalled();
  // });

  // it('should show a snackbar when the service errors', () => {
  //   const service = TestBed.inject(ChecklistService) as MockChecklistService;
  //   const snackSpy = spyOn(component['snackBar'], 'open');

  //   spyOn(service, 'printIndividualChecklist').and.returnValue(
  //     throwError(() => new Error('Failed'))
  //   );

  //   component.downloadPDFforIndividualChecklist();

  //   expect(snackSpy).toHaveBeenCalledWith(
  //     'Failed to load checklist: Failed',
  //     'OK',
  //     { duration: 6000 }
  //   );
  // });
  //});
});


