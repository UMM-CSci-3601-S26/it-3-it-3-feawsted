// Angular Testing Imports
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FamilyCardComponent } from './family-card.component';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

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
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
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
      altPickUp: 'Chrissy',
      address: '123 Street',
      email: 'chris@email.com',
      timeSlot: '9:00-10:00',
      timeAvailability: { earlyMorning: true, lateMorning: false, earlyAfternoon: true, lateAfternoon: false },
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


  describe('Editing Logic', () => {
    it('should enter edit mode and clone the family data when startEditing is called', () => {
      component.startEditing();

      expect(component.isEditing()).toBeTrue();
      // Verify it's a copy, not the same reference, to avoid accidental mutations
      expect(component.editForm()).toEqual(expectedFamily);
      expect(component.editForm()).not.toBe(expectedFamily);
    });

    it('should exit edit mode and clear the form when cancelEdit is called', () => {
      component.startEditing();
      component.cancelEdit();

      expect(component.isEditing()).toBeFalse();
      expect(component.editForm()).toBeNull();
    });

    it('should emit familyUpdated with the modified data when saveEdit is called', () => {
    // Setup the spy on the output
      const emitSpy = spyOn(component.familyUpdated, 'emit');

      component.startEditing();

      // Simulate a user change in the edit form
      const editedData = { ...expectedFamily, guardianName: 'Updated Name' };
      component.editForm.set(editedData);

      component.saveEdit();

      expect(emitSpy).toHaveBeenCalledWith(editedData);
      expect(component.isEditing()).toBeFalse();
    });
  });
});
