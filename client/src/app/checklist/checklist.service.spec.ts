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
    item: "Pencil",
    brand: "Generic",
    color: "Yellow",
    count: 1,
    size: "Medium",
    type: "Standard",
    material: "Wood",
    description: "A standard pencil for school use",
    quantity: 1,
    notes: ""
  };

  const mockSupply2: SupplyList = {
    school: "Herman",
    grade: "3",
    item: "Notebook",
    brand: "Generic",
    color: "Red",
    count: 1,
    size: "Medium",
    type: "Standard",
    material: "Paper",
    description: "A standard notebook for school use",
    quantity: 1,
    notes: ""
  };

  const testChecklists: Checklist[] = [
    {
      _id: '1',
      studentName: 'John',
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




  // Test to verify that exportFamilies() is called when the CSV download function is triggered,
  // and that the appropriate methods for handling the CSV data are invoked
  it('exportFamilies() should be called when CSV is downloaded', () => {
    spyOn(checklistService, 'checklistFamilies').and.returnValue(of('csv-data'));

    spyOn(URL, 'createObjectURL').and.returnValue('blob-url');
    spyOn(URL, 'revokeObjectURL');

    const click = jasmine.createSpy('click');
    spyOn(document, 'createElement').and.returnValue({ click } as unknown as HTMLElement);

    checklistList.downloadCSV();
    expect(familyService.exportFamilies).toHaveBeenCalled();
    expect(document.createElement).toHaveBeenCalledWith('a');
    expect(click).toHaveBeenCalled();
    expect(URL.createObjectURL).toHaveBeenCalled();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob-url');
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
});
