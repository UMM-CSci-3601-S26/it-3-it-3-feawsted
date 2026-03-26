// Angular Testing Imports
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FamilyCardComponent } from './family-card.component';

// Family Interface Import
import { Family } from './family';

// Test suite for the FamilyCardComponent, which displays information about a family and their requested supplies
describe('FamilyCardComponent', () => {
  let component: FamilyCardComponent;
  let fixture: ComponentFixture<FamilyCardComponent>;
  let expectedFamily: Family;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        FamilyCardComponent
      ]
    })
    // Compile the component and its template before running tests
      .compileComponents();
  }));

  // Set up the component instance and provide it with a sample family before each test
  beforeEach(() => {
    fixture = TestBed.createComponent(FamilyCardComponent);
    component = fixture.componentInstance;
    expectedFamily = {
      // Example Family with Two Kids
      _id: 'chris_id',
      guardianName: 'Chris',
      address: '123 Street',
      email: 'chris@email.com',
      timeSlot: '9:00-10:00',
      students: [
        {
          name: 'Chris Jr.',
          grade: '2',
          school: "Morris Elementary",
          requestedSupplies: ['backpack', 'markers']
        },
        {
          name: 'Christy',
          grade: '2',
          school: "Morris Elementary",
          requestedSupplies: ['backpack', 'pencils']
        }
      ]
    };

    fixture.componentRef.setInput('family', expectedFamily);
    fixture.detectChanges();
  });

  // Test to ensure the component is created successfully
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Test to verify that the component's family input is correctly associated with the expected family data
  it('should be associated with the correct family', () => {
    expect(component.family()).toEqual(expectedFamily);
  });

  // Test to check that the guardian's name in the family data is correctly displayed as "Chris"
  it('should be the family named Chris', () => {
    expect(component.family().guardianName).toEqual('Chris');
  });
});
