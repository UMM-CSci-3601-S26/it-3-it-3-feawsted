import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { ChecklistService } from './checklist.service';
import { environment } from '../../environments/environment';
import { Checklist } from './checklist';


describe('ChecklistService', () => {
  let service: ChecklistService;
  let httpTestingController: HttpTestingController;

  const checklistUrl = `${environment.apiUrl}checklists`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ChecklistService]
    });

    service = TestBed.inject(ChecklistService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should fetch all checklists', () => {
    const mockChecklists: Checklist[] = [
      { _id: '1', studentName: 'Daily Tasks', items: [] },
      { _id: '2', studentName: 'Grocery List', items: [] }
    ];

    service.getChecklists().subscribe(result => {
      expect(result).toEqual(mockChecklists);
      expect(result.length).toBe(2);
    });

    const req = httpMock.expectOne(req =>
      req.method === 'GET' && req.url === checklistUrl
    );

    expect(req.request.method).toBe('GET');
    req.flush(mockChecklists);
  });

  it('should fetch a checklist by ID', () => {
    const mockChecklist: Checklist = {
      _id: '123',
      studentName: 'Test Checklist',
      requestedSupplies: []
    };

    service.getChecklistById('123').subscribe(result => {
      expect(result).toEqual(mockChecklist);
      expect(result._id).toBe('123');
    });

    const req = httpMock.expectOne(`${checklistUrl}/123`);
    expect(req.request.method).toBe('GET');

    req.flush(mockChecklist);
  });
});
