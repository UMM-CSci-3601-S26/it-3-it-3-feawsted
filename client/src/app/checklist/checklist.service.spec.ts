// Angular Imports
import { HttpClient, HttpParams, provideHttpClient } from '@angular/common/http'; //HttpParams
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed, waitForAsync } from '@angular/core/testing';

// RxJS Imports
import { of } from 'rxjs';

// Checklist Interface and Service Import
import { Checklist } from './checklist';
import { ChecklistService } from './checklist.service';

import { SupplyList } from '../supplylist/supplylist';
import { MockChecklistService } from 'src/testing/checklist-service.mock';

describe('ChecklistService', () => {
  const mockSupply1: SupplyList = {
    school: "Herman",
    grade: "7",
    item: ["Pencil"],
    brand: { allOf: ["Generic"], anyOf: [] },
    color: { allOf: [], anyOf: ["yellow"] },
    count: 1,
    size: "Medium",
    type: { allOf: ["Standard"], anyOf: [] },
    material: { allOf: ["Wood"], anyOf: [] },
    style: { allOf: [], anyOf: [] },
    quantity: 1,
    notes: ""
  };

  const mockSupply2: SupplyList = {
    school: "Herman",
    grade: "3",
    item: ["Notebook"],
    brand: { allOf: ["Generic"], anyOf: [] },
    color: { allOf: ["red"], anyOf: [] },
    count: 1,
    size: "Medium",
    type: { allOf: ["Standard"], anyOf: [] },
    material: { allOf: ["Paper"], anyOf: [] },
    style: { allOf: [], anyOf: [] },
    quantity: 1,
    notes: ""
  };

  const testChecklists: Checklist[] = [
    {
      _id: '1',
      studentName: 'John',
      guardianName: 'alex Doe',
      altPickUp: 'Jane Doe',
      school: 'Herman',
      grade: '7',
      requestedSupplies: ['backpack'],
      checklist: [
        {
          supply: mockSupply1,
          completed: false,
          unreceived: false,
          selectedOption: ''
        }
      ]
    },
    {
      _id: '2',
      studentName: 'Jane Doe',
      guardianName: 'Freddy Doe',
      altPickUp: 'Christa Doe',
      school: 'Herman',
      grade: '3',
      requestedSupplies: ['backpack'],
      checklist: [
        {
          supply: mockSupply2,
          completed: false,
          unreceived: false,
          selectedOption: ''
        }
      ]
    }
  ];

  let checklistService: ChecklistService;
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });

    httpClient = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
    checklistService = TestBed.inject(ChecklistService);
  });




  // Test to verify that getChecklists() returns checklist data when called
  it('getChecklists() should be called and return checklists', () => {
    spyOn(checklistService, 'getChecklists').and.returnValue(of(testChecklists));

    checklistService.getChecklists().subscribe(result => {
      expect(result).toEqual(testChecklists);
    });

    expect(checklistService.getChecklists).toHaveBeenCalled();
  });








  afterEach(() => {
    httpTestingController.verify();
  });

  // Test to ensure getChecklists() calls the correct API endpoint when called with no parameters, and that it is called exactly once
  describe('When getChecklists() is called with no parameters', () => {
    it('calls `api/checklists`', waitForAsync(() => {
      const mockedMethod = spyOn(httpClient, 'get').and.returnValue(of(testChecklists));
      checklistService.getChecklists().subscribe(() => {
        expect(mockedMethod)
          .withContext('one call')
          .toHaveBeenCalledTimes(1);
        expect(mockedMethod)
          .withContext('talks to the correct endpoint')
          .toHaveBeenCalledWith(checklistService.checklistUrl, { params: new HttpParams() });
      });
    }));
  });

  describe('When getChecklists() is called with parameters, it correctly forms the HTTP request (Javalin/Server filtering)', () => {
    it('correctly calls api/checklists with filter parameter item', () => {
      const mockedMethod = spyOn(httpClient, 'get').and.returnValue(of(testChecklists));

      checklistService.getChecklists({ studentName: 'John' }).subscribe(() => {
        expect(mockedMethod)
          .withContext('one call')
          .toHaveBeenCalledTimes(1);
        expect(mockedMethod)
          .withContext('talks to the correct endpoint')
          .toHaveBeenCalledWith(checklistService.checklistUrl, { params: new HttpParams().set('studentName', 'John') });
      });
    });

    // Test to ensure getChecklists() correctly calls the API endpoint with the 'school' filter parameter, and that it is called exactly once with the correct URL and query parameters
    it('correctly calls api/checklists with filter parameter school', () => {
      const mockedMethod = spyOn(httpClient, 'get').and.returnValue(of(testChecklists));

      checklistService.getChecklists({ school: 'Herman' }).subscribe(() => {
        expect(mockedMethod)
          .withContext('one call')
          .toHaveBeenCalledTimes(1);
        expect(mockedMethod)
          .withContext('talks to the correct endpoint')
          .toHaveBeenCalledWith(checklistService.checklistUrl, { params: new HttpParams().set('school', 'Herman') });
      });
    });

    it('correctly calls api/checklists with filter parameter grade', () => {
      const mockedMethod = spyOn(httpClient, 'get').and.returnValue(of(testChecklists));

      checklistService.getChecklists({ grade: '7' }).subscribe(() => {
        expect(mockedMethod)
          .withContext('one call')
          .toHaveBeenCalledTimes(1);
        expect(mockedMethod)
          .withContext('talks to the correct endpoint')
          .toHaveBeenCalledWith(checklistService.checklistUrl, { params: new HttpParams().set('grade', '7') });
      });
    });

  });

  it('should fetch all checklists', () => {
    checklistService.getChecklists().subscribe(result => {
      expect(result).toEqual(testChecklists);
      expect(result.length).toBe(2);
    });

    const req = httpTestingController.expectOne(req =>
      req.method === 'GET' && req.url === checklistService.checklistUrl
    );

    expect(req.request.method).toBe('GET');
    req.flush(testChecklists);
  });

  it('should fetch a checklist by ID', () => {
    const testChecklist: Checklist = {
      _id: '123',
      studentName: 'Test Checklist',
      guardianName: 'Test Guardian',
      altPickUp: 'Test Alt PickUp',
      requestedSupplies: ['backpack'],
      school: 'AHS',
      grade: '6th',
      checklist: [{
        supply: MockChecklistService.mockSupply1,
        completed: false,
        unreceived: false,
        selectedOption: ''
      }]
    };

    checklistService.getChecklistById('123').subscribe(result => {
      expect(result).toEqual(testChecklist);
      expect(result._id).toBe('123');
    });

    const req = httpTestingController.expectOne(`${checklistService.checklistUrl}/123`);
    expect(req.request.method).toBe('GET');

    req.flush(testChecklist);
  });

  describe('printAllChecklists()', () => {
    it('should call GET /api/checklists with no parameters', () => {
      checklistService.printAllChecklists().subscribe(result => {
        expect(result).toEqual(testChecklists);
        expect(result.length).toBe(2);
      });

      const req = httpTestingController.expectOne(req =>
        req.method === 'GET' && req.url === checklistService.checklistUrl
      );
      expect(req.request.method).toBe('GET');
      expect(req.request.params.keys().length).toBe(0);
      req.flush(testChecklists);
    });

    it('should return an Observable of Checklist[]', () => {
      const mockedMethod = spyOn(httpClient, 'get').and.returnValue(of(testChecklists));

      checklistService.printAllChecklists().subscribe(result => {
        expect(result).toEqual(testChecklists);
        expect(mockedMethod).toHaveBeenCalledTimes(1);
        expect(mockedMethod).toHaveBeenCalledWith(checklistService.checklistUrl);
      });
    });
  });

  describe('printIndividualChecklist()', () => {

    it('should call GET /api/checklists/:id with the correct ID parameter', () => {
      const checklistId = '123';
      const mockChecklist = testChecklists[0];

      checklistService.printIndividualChecklist(checklistId).subscribe(result => {
        expect(result).toEqual(mockChecklist);
      });

      const req = httpTestingController.expectOne(
        `${checklistService.checklistUrl}/${checklistId}`
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockChecklist);
    });

    it('should return an Observable of Checklist', () => {
      const checklistId = '123';
      const mockChecklist = testChecklists[0];
      const mockedMethod = spyOn(httpClient, 'get').and.returnValue(of(mockChecklist));

      checklistService.printIndividualChecklist(checklistId).subscribe(result => {
        expect(result).toEqual(mockChecklist);
        expect(mockedMethod).toHaveBeenCalledTimes(1);
        expect(mockedMethod).toHaveBeenCalledWith(`${checklistService.checklistUrl}/${checklistId}`);
      });
    });
  });
});
