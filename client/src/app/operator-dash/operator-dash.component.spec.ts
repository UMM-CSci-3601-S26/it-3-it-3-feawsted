// Angular Imports
import { ComponentFixture, TestBed } from '@angular/core/testing';

// App Imports
import { OperatorDashComponent } from './operator-dash.component';
import { FamilyService } from '../family/family.service';
import { MockFamilyService } from 'src/testing/family-service.mock';

/**
 * Unit tests for the OperatorDashComponent. This test suite verifies that the component is created successfully and
 * can be extended to include more specific tests for the component's functionality and interactions with the FamilyService.
 * The MockFamilyService is used to provide a controlled testing environment for any dependencies on the FamilyService,
 * allowing for isolated testing of the OperatorDashComponent.
 */

// Test suite for the OperatorDashComponent
describe('OperatorDashComponent', () => {
  let component: OperatorDashComponent;
  let fixture: ComponentFixture<OperatorDashComponent>;

  // Set up the testing environment before each test case
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OperatorDashComponent],
      providers: [
        { provide: FamilyService, useClass: MockFamilyService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(OperatorDashComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // Test case to verify that the component is created successfully
  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
