// Angular Imports
import { HttpClient, HttpParams, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed, waitForAsync } from '@angular/core/testing';

// RxJS Imports
import { of } from 'rxjs';

// Inventory Imports
import { Inventory } from './inventory';
import { InventoryService } from './inventory.service';

/**
 * Test suite for the InventoryService, which handles communication with the backend API for managing inventory data.
 * The tests cover the functionality of fetching inventory items with optional filters and deleting inventory items by ID.
 * Each test verifies that the correct HTTP requests are made to the appropriate endpoints with the expected parameters
 * and that the service behaves as intended when interacting with the backend API.
 */
describe('InventoryService', () => {
  // Sample inventory data to be used in tests, representing a variety of inventory items with different attributes such as item name, brand, color, size, type, material, quantity, and notes
  const testInventory: Inventory[] = [
    {
      item: "Markers",
      description: "8 Pack of Washable Wide Markers",
      brand: "Crayola",
      color: "Black",
      count: 8,
      size: "Wide",
      type: "Washable",
      material: "N/A",
      quantity: 0,
      notes: "N/A"
    },
    {
      item: "Folder",
      description: "Red 2 Prong Plastic Pocket Folder",
      brand: "N/A",
      color: "Red",
      count: 1,
      size: "N/A",
      type: "2 Prong",
      material: "Plastic",
      quantity: 0,
      notes: "N/A"
    },
    {
      item: "Notebook",
      description: "Yellow Wide Ruled Spiral Notebook",
      brand: "N/A",
      color: "Yellow",
      count: 1,
      size: "Wide Ruled",
      type: "Spiral",
      material: "N/A",
      quantity: 0,
      notes: "N/A"
    }
  ];

  let inventoryService: InventoryService;
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;

  // Set up the testing module for the InventoryService, including necessary imports and providers, and initialize the service and HTTP testing controller before each test
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });

    httpClient = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
    inventoryService = TestBed.inject(InventoryService);
  });

  // Verify that there are no outstanding HTTP requests after each test to ensure that all expected requests have been made and handled
  afterEach(() => {
    httpTestingController.verify();
  });

  // Test to ensure getInventory() calls the correct API endpoint when called with no parameters, and that it is called exactly once
  describe('When getInventory() is called with no parameters', () => {
    it('calls `api/inventories`', waitForAsync(() => {
      const mockedMethod = spyOn(httpClient, 'get').and.returnValue(of(testInventory));
      inventoryService.getInventory().subscribe(() => {
        expect(mockedMethod)
          .withContext('one call')
          .toHaveBeenCalledTimes(1);
        expect(mockedMethod)
          .withContext('talks to the correct endpoint')
          .toHaveBeenCalledWith(inventoryService.inventoryUrl, { params: new HttpParams() });
      });
    }));
  });

  /**
   * Tests to ensure getInventory() correctly forms the HTTP request with various filter parameters, including
   * item, brand, color, size, type, material, and combinations of these parameters. Each test verifies that the
   * correct endpoint is called with the expected query parameters and that the service behaves as intended when
   * fetching filtered inventory data from the backend API.
   */
  describe('When getInventory() is called with parameters, it correctly forms the HTTP request (Javalin/Server filtering)', () => {
    it('correctly calls api/inventory with filter parameter \'item\'', () => {
      const mockedMethod = spyOn(httpClient, 'get').and.returnValue(of(testInventory));

      inventoryService.getInventory({ item: 'Markers' }).subscribe(() => {
        expect(mockedMethod)
          .withContext('one call')
          .toHaveBeenCalledTimes(1);
        expect(mockedMethod)
          .withContext('talks to the correct endpoint')
          .toHaveBeenCalledWith(inventoryService.inventoryUrl, { params: new HttpParams().set('item', 'Markers') });
      });
    });

    // Test to ensure getInventory() correctly calls the API endpoint with the 'brand' filter parameter, and that it is called exactly once with the correct URL and query parameters
    it('correctly calls api/inventory with filter parameter \'brand\'', () => {
      const mockedMethod = spyOn(httpClient, 'get').and.returnValue(of(testInventory));

      inventoryService.getInventory({ brand: 'Crayola' }).subscribe(() => {
        expect(mockedMethod)
          .withContext('one call')
          .toHaveBeenCalledTimes(1);
        expect(mockedMethod)
          .withContext('talks to the correct endpoint')
          .toHaveBeenCalledWith(inventoryService.inventoryUrl, { params: new HttpParams().set('brand', 'Crayola') });
      });
    });

    // Test to ensure getInventory() correctly calls the API endpoint with the 'color' filter parameter, and that it is called exactly once with the correct URL and query parameters
    it('correctly calls api/inventory with filter parameter \'color\'', () => {
      const mockedMethod = spyOn(httpClient, 'get').and.returnValue(of(testInventory));

      inventoryService.getInventory({ color: 'Black' }).subscribe(() => {
        expect(mockedMethod)
          .withContext('one call')
          .toHaveBeenCalledTimes(1);
        expect(mockedMethod)
          .withContext('talks to the correct endpoint')
          .toHaveBeenCalledWith(inventoryService.inventoryUrl, { params: new HttpParams().set('color', 'Black') });
      });
    });

    // Test to ensure getInventory() correctly calls the API endpoint with the 'size' filter parameter, and that it is called exactly once with the correct URL and query parameters
    it('correctly calls api/inventory with filter parameter \'size\'', () => {
      const mockedMethod = spyOn(httpClient, 'get').and.returnValue(of(testInventory));

      inventoryService.getInventory({ size: 'Regular' }).subscribe(() => {
        expect(mockedMethod)
          .withContext('one call')
          .toHaveBeenCalledTimes(1);
        expect(mockedMethod)
          .withContext('talks to the correct endpoint')
          .toHaveBeenCalledWith(inventoryService.inventoryUrl, { params: new HttpParams().set('size', 'Regular') });
      });
    });

    // Test to ensure getInventory() correctly calls the API endpoint with the 'type' filter parameter, and that it is called exactly once with the correct URL and query parameters
    it('correctly calls api/inventory with filter parameter \'type\'', () => {
      const mockedMethod = spyOn(httpClient, 'get').and.returnValue(of(testInventory));

      inventoryService.getInventory({ type: 'Spiral' }).subscribe(() => {
        expect(mockedMethod)
          .withContext('one call')
          .toHaveBeenCalledTimes(1);
        expect(mockedMethod)
          .withContext('talks to the correct endpoint')
          .toHaveBeenCalledWith(inventoryService.inventoryUrl, { params: new HttpParams().set('type', 'Spiral') });
      });
    });

    // Test to ensure getInventory() correctly calls the API endpoint with the 'material' filter parameter, and that it is called exactly once with the correct URL and query parameters
    it('correctly calls api/inventory with filter parameter \'material\'', () => {
      const mockedMethod = spyOn(httpClient, 'get').and.returnValue(of(testInventory));

      inventoryService.getInventory({ material: 'Plastic' }).subscribe(() => {
        expect(mockedMethod)
          .withContext('one call')
          .toHaveBeenCalledTimes(1);
        expect(mockedMethod)
          .withContext('talks to the correct endpoint')
          .toHaveBeenCalledWith(inventoryService.inventoryUrl, { params: new HttpParams().set('material', 'Plastic') });
      });
    });

    // Test to ensure getInventory() correctly calls the API endpoint with multiple filter parameters, and that it is called exactly once with the correct URL and query parameters
    it('correctly calls api/inventory with multiple filter parameters', () => {
      const mockedMethod = spyOn(httpClient, 'get').and.returnValue(of(testInventory));

      inventoryService.getInventory({ item: 'Markers', color: 'Black' }).subscribe(() => {

        const [url, options] = mockedMethod.calls.argsFor(0);

        const calledHttpParams: HttpParams = (options.params) as HttpParams;
        expect(mockedMethod)
          .withContext('one call')
          .toHaveBeenCalledTimes(1);
        expect(url)
          .withContext('talks to the correct endpoint')
          .toEqual(inventoryService.inventoryUrl);
        expect(calledHttpParams.keys().length)
          .withContext('should have 2 params')
          .toEqual(2);
        expect(calledHttpParams.get('item'))
          .withContext('item being Markers')
          .toEqual('Markers');
        expect(calledHttpParams.get('color'))
          .withContext('color being Black')
          .toEqual('Black');
      });
    });

    // Test to ensure getInventory() correctly calls the API endpoint with multiple filter parameters, and that it is called exactly once with the correct URL and query parameters
    it('correctly calls api/inventory with multiple filter parameters', () => {
      const mockedMethod = spyOn(httpClient, 'get').and.returnValue(of(testInventory));

      inventoryService.getInventory({ type: '2 prong', material: 'Plastic' }).subscribe(() => {

        const [url, options] = mockedMethod.calls.argsFor(0);

        const calledHttpParams: HttpParams = (options.params) as HttpParams;
        expect(mockedMethod)
          .withContext('one call')
          .toHaveBeenCalledTimes(1);
        expect(url)
          .withContext('talks to the correct endpoint')
          .toEqual(inventoryService.inventoryUrl);
        expect(calledHttpParams.keys().length)
          .withContext('should have 2 params')
          .toEqual(2);
        expect(calledHttpParams.get('type'))
          .withContext('type being 2 prong')
          .toEqual('2 prong');
        expect(calledHttpParams.get('material'))
          .withContext('material being Plastic')
          .toEqual('Plastic');
      });
    });

    // Test to ensure getInventory() correctly calls the API endpoint with multiple filter parameters, and that it is called exactly once with the correct URL and query parameters
    it('correctly calls api/inventory with multiple filter parameters', () => {
      const mockedMethod = spyOn(httpClient, 'get').and.returnValue(of(testInventory));

      inventoryService.getInventory({ item: 'Notebook', color: 'Yellow', size: 'Wide Ruled', type: 'Spiral' }).subscribe(() => {

        const [url, options] = mockedMethod.calls.argsFor(0);

        const calledHttpParams: HttpParams = (options.params) as HttpParams;
        expect(mockedMethod)
          .withContext('one call')
          .toHaveBeenCalledTimes(1);
        expect(url)
          .withContext('talks to the correct endpoint')
          .toEqual(inventoryService.inventoryUrl);
        expect(calledHttpParams.keys().length)
          .withContext('should have 4 params')
          .toEqual(4);
        expect(calledHttpParams.get('item'))
          .withContext('item being Notebook')
          .toEqual('Notebook');
        expect(calledHttpParams.get('color'))
          .withContext('color being Yellow')
          .toEqual('Yellow');
        expect(calledHttpParams.get('size'))
          .withContext('size being Wide Ruled')
          .toEqual('Wide Ruled');
        expect(calledHttpParams.get('type'))
          .withContext('type being Spiral')
          .toEqual('Spiral');
      });
    });

    // Test to ensure deleteInventory() correctly calls the API endpoint to delete an inventory item by ID, and that it is called exactly once with the correct URL
    describe('When deleteInventory() is called', () => {
      it('correctly deletes an inventory item by ID', () => {
        const mockedMethod = spyOn(httpClient, 'delete').and.returnValue(of({}));
        const idToDelete = '12345';

        inventoryService.deleteInventory(idToDelete).subscribe(() => {
          const [url] = mockedMethod.calls.argsFor(0);
          expect(mockedMethod)
            .withContext('one call')
            .toHaveBeenCalledTimes(1);
          expect(url)
            .withContext('talks to the correct endpoint with ID')
            .toEqual(`${inventoryService.inventoryUrl}/${idToDelete}`);
        });
      });

      // Test to ensure deleteInventory() called with the correct URL and no body when deleting an inventory item by ID, and that it is called exactly once
      it('calls delete with the right URL and no body', () => {
        const idToDelete = 'abc-987';
        const mockedMethod = spyOn(httpClient, 'delete').and.returnValue(of(undefined));

        inventoryService.deleteInventory(idToDelete).subscribe((body) => {
          expect(body).toBeUndefined();
          expect(mockedMethod)
            .withContext('delete should be called once')
            .toHaveBeenCalledTimes(1);

          expect(mockedMethod)
            .withContext('delete path must include ID')
            .toHaveBeenCalledWith(`${inventoryService.inventoryUrl}/${idToDelete}`);
        });
      });
    });
  });
})
