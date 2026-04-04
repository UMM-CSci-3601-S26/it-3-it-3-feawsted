// Angular Testing Imports
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ChecklistCardComponent } from './checklist-card.component';

// Family Interface Import
import { Checklist } from './checklist';

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
      // Example Family with Two Kids
      _id: 'chris_id',
      studentName: 'Chris',
      grade: '123 Street',
      school: 'chris@email.com',
      requestedSupplies: List.of("backpack"),
      //checklist:
    };

    fixture.componentRef.setInput('family', expectedChecklist);
    fixture.detectChanges();
  });

  // Test to ensure the component is created successfully
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Test to verify that the component's family input is correctly associated with the expected family data
  it('should be associated with the correct family', () => {
    expect(component.checklist()).toEqual(expectedChecklist);
  });

  // Test to check that the guardian's name in the family data is correctly displayed as "Chris"
  it('should be the family named Chris', () => {
    expect(component.checklist().studentName).toEqual('Chris');
  });
});
