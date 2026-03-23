import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OperatorDashComponent } from './operator-dash.component';
import { FamilyService } from '../family/family.service';
import { MockFamilyService } from 'src/testing/family.service.mock';

describe('OperatorDashComponent', () => {
  let component: OperatorDashComponent;
  let fixture: ComponentFixture<OperatorDashComponent>;

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

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
