// Angular Testing Imports
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ChecklistCardComponent } from './checklist-card.component';

// Family Interface Import
import { Checklist } from './checklist';
import { MockChecklistService } from 'src/testing/checklist-service.mock';

// Test suite for the FamilyCardComponent, which displays information about a family and their requested supplies
describe('ChecklistCardComponent', () => {
  let component: ChecklistCardComponent;
  let fixture: ComponentFixture<ChecklistCardComponent>;
  let expectedChecklist: Checklist;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        ChecklistCardComponent
      ]
    })
    // Compile the component and its template before running tests
      .compileComponents();
  }));

  // Set up the component instance and provide it with a sample family before each test
  beforeEach(() => {
    fixture = TestBed.createComponent(ChecklistCardComponent);
    component = fixture.componentInstance;

    expectedChecklist = {
      _id: 'chris_id',
      studentName: 'Chris',
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

    fixture.componentRef.setInput('checklist', expectedChecklist);
    fixture.detectChanges();
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

});
