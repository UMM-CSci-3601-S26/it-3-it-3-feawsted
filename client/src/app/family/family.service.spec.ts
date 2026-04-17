// Angular Imports
import { HttpClient, HttpParams, provideHttpClient } from '@angular/common/http'; //HttpParams
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed, waitForAsync } from '@angular/core/testing';

// RxJS Imports
import { of } from 'rxjs';

// Family Interface and Service Import
import { Family } from './family';
import { FamilyService } from './family.service';

/**
 * Test suite for the FamilyService, which handles communication with the backend API for managing family data.
 * The tests cover the functionality of fetching families, fetching a family by ID, adding a family, deleting a family,
 * and fetching dashboard statistics. Each test verifies that the correct HTTP requests are made to the appropriate
 * endpoints with the expected parameters and that the service behaves as intended when interacting with the backend API.
 */
describe('FamilyService', () => {
  // Sample family data to be used in tests, representing a variety of family configurations with different numbers of students and requested supplies
  const testFamilies: Family[] = [
    {
      _id: 'john_id',
      guardianName: 'John Johnson',
      altPickUp: 'Dwayne Johnson',
      email: 'jjohnson@email.com',
      address: '713 Broadway',
      timeSlot: '8:00-9:00',
      students: [
        {
          name: 'John Jr.',
          grade: '1',
          school: "Morris Elementary",
          requestedSupplies: ['pencils', 'markers']
        },
      ],
      timeAvailability: { earlyMorning: false, lateMorning: true, earlyAfternoon: false, lateAfternoon: false }
    },
    {
      _id: 'jane_id',
      guardianName: 'Jane Doe',
      altPickUp: '',
      email: 'janedoe@email.com',
      address: '123 Street',
      timeSlot: '10:00-11:00',
      students: [
        {
          name: 'Jennifer',
          grade: '6',
          school: "Hancock Middle School",
          requestedSupplies: ['headphones']
        },
        {
          name: 'Jake',
          grade: '8',
          school: "Hancock Middle School",
          requestedSupplies: ['calculator']
        },
      ],
      timeAvailability: { earlyMorning: false, lateMorning: true, earlyAfternoon: false, lateAfternoon: false }
    },
    {
      _id: 'george_id',
      guardianName: 'George Peterson',
      altPickUp: 'Will Smith',
      email: 'georgepeter@email.com',
      address: '245 Acorn Way',
      timeSlot: '1:00-2:00',
      students: [
        {
          name: 'Harold',
          grade: '11',
          school: "Morris High School",
          requestedSupplies: []
        },
        {
          name: 'Thomas',
          grade: '6',
          school: "Morris High School",
          requestedSupplies: ['headphones']
        },
        {
          name: 'Emma',
          grade: '2',
          school: "Morris Elementary",
          requestedSupplies: ['backpack', 'markers']
        },
      ],
      timeAvailability: { earlyMorning: false, lateMorning: true, earlyAfternoon: false, lateAfternoon: false }
    },
  ];

  let familyService: FamilyService;
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;

  // Set up the testing module for the FamilyService, including necessary imports and providers, and initialize the service and HTTP testing controller before each test
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });

    httpClient = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
    familyService = TestBed.inject(FamilyService);
  });

  // After each test, verify that there are no outstanding HTTP requests to ensure that all expected requests have been made and handled properly
  afterEach(() => {
    // After every test, assert that there are no more pending requests.
    httpTestingController.verify();
  });

  describe('When getFamilies() is called with no parameters', () => {
    // Test to ensure getFamilies() correctly calls the API endpoint with no filter parameters, and that it is called exactly once with the correct URL and empty query parameters
    it('calls `api/families`', waitForAsync(() => {
      const mockedMethod = spyOn(httpClient, 'get').and.returnValue(of(testFamilies));
      familyService.getFamilies().subscribe(() => {
        expect(mockedMethod)
          .withContext('one call')
          .toHaveBeenCalledTimes(1);
        expect(mockedMethod)
          .withContext('talks to the correct endpoint')
          .toHaveBeenCalledWith(familyService.familyUrl, { params: new HttpParams() });
      });
    }));
  });

  /**
   * The following tests for getFamilies() with various filter parameters are currently commented out, as the filtering functionality is not yet implemented in the backend API.
   * Once the API supports filtering by timeSlot and other parameters, these tests should be uncommented and updated as necessary to ensure that getFamilies()
   * correctly forms the HTTP requests with the appropriate query parameters for filtering. Each test verifies that the correct endpoint is called with the expected parameters and
   * that the service behaves as intended when interacting with the backend API for filtered data retrieval.
   */
  // describe('When getFamilies() is called with parameters, it correctly forms the HTTP request (Javalin/Server filtering)', () => {
  //   // Test to ensure getFamilies() correctly calls the API endpoint with the 'timeSlot' filter parameter, and that it is called exactly once with the correct URL and query parameters
  //   it('correctly calls api/families with no parameters', () => {
  //     const mockedMethod = spyOn(httpClient, 'get').and.returnValue(of(testFamilies));

  //     familyService.getFamilies().subscribe(() => {
  //       const [url, options] = mockedMethod.calls.argsFor(0);
  //       const calledHttpParams: HttpParams = (options.params) as HttpParams;
  //       expect(mockedMethod)
  //         .withContext('one call')
  //         .toHaveBeenCalledTimes(1);
  //       expect(url)
  //         .withContext('talks to the correct endpoint')
  //         .toEqual(familyService.familyUrl);
  //       expect(calledHttpParams.keys().length)
  //         .withContext('should have 0 params')
  //         .toEqual(0);
  //     });
  //   });
  // });

  // Test to ensure getFamilyById() correctly
  describe('When getFamilyById() is given an ID', () => {
    it('calls api/families/id with the correct ID', waitForAsync(() => {
      const targetFamily: Family = testFamilies[1];
      const targetId: string = targetFamily._id!;

      const mockedMethod = spyOn(httpClient, 'get').and.returnValue(of(targetFamily));
      familyService.getFamilyById(targetId).subscribe(() => {
        expect(mockedMethod)
          .withContext('one call')
          .toHaveBeenCalledTimes(1);
        expect(mockedMethod)
          .withContext('talks to the correct endpoint')
          .toHaveBeenCalledWith(`${familyService.familyUrl}/${targetId}`);
      });
    }));
  });

  // Test to ensure addFamily() correctly calls the API endpoint to add a new family, and that it is called exactly once with the correct URL and payload
  describe('Adding a family using `addFamily()`', () => {
    it('talks to the right endpoint and is called once', waitForAsync(() => {
      const family_id = 'john_id';
      const expected_http_response = { id: family_id } ;

      const mockedMethod = spyOn(httpClient, 'post')
        .and
        .returnValue(of(expected_http_response));

      familyService.addFamily(testFamilies[1]).subscribe((new_family_id) => {
        expect(new_family_id).toBe(family_id);
        expect(mockedMethod)
          .withContext('one call')
          .toHaveBeenCalledTimes(1);
        expect(mockedMethod)
          .withContext('talks to the correct endpoint')
          .toHaveBeenCalledWith(familyService.familyUrl, testFamilies[1]);
      });
    }));
  });

  // Test to ensure deleteFamily() correctly calls the API endpoint to delete a family by ID, and that it is called exactly once with the correct URL
  describe('Deleting a family using `deleteFamily()`', () => {
    it('talks to the right endpoint and is called once', waitForAsync(() => {
      const mockedMethod = spyOn(httpClient, 'delete').and.returnValue(of({ success: true }));

      familyService.deleteFamily('john_id').subscribe((res) => {
        expect(res).toEqual({success: true});

        expect(mockedMethod)
          .withContext('one call')
          .toHaveBeenCalledTimes(1);
      });
    }));
  });

  // Test to ensure getDashboardStats() correctly calls the API endpoint to fetch dashboard statistics, and that it is called exactly once with the correct URL and empty query parameters
  describe('When getDashboardStats() is called with parameters, it correctly forms the HTTP request (Javalin/Server filtering)', () => {
    // Test to ensure getDashboardStats() correctly calls the API endpoint with no filter parameters, and that it is called exactly once with the correct URL and empty query parameters
    it('correctly calls api/dashboard with no parameters', () => {
      const mockedMethod = spyOn(httpClient, 'get').and.returnValue(of(testFamilies));

      familyService.getDashboardStats().subscribe(() => {

        const [url, options] = mockedMethod.calls.argsFor(0);
        const calledHttpParams: HttpParams = (options?.params) as HttpParams;
        expect(mockedMethod)
          .withContext('one call')
          .toHaveBeenCalledTimes(1);
        expect(url)
          .withContext('talks to the correct endpoint')
          .toEqual(familyService.dashboardUrl);
        expect(calledHttpParams.keys().length)
          .withContext('should have 0 params')
          .toEqual(0);
      });
    });
  });

  // Test to ensure exportFamilies() correctly returns CSV data from the API endpoint, and that it is called exactly once with the correct URL and response type
  it('should call GET /export and return Csv text', () => {
    const mockCsv = `Guardian Name,Email,Address,Time Slot,Number of Students
                     John Johnson,jjohnson@email.com,713 Broadway,8:00-9:00,1`;

    familyService.exportFamilies().subscribe(response => {
      expect(response).toBe(mockCsv);
    });

    const req = httpTestingController.expectOne(`${familyService['familyUrl']}/export`)

    expect(req.request.method).toBe('GET');
    expect(req.request.responseType).toBe('text');

    req.flush(mockCsv);
  })
});
