// Angular Imports
import { ComponentFixture, TestBed, waitForAsync, tick, fakeAsync, flushMicrotasks } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { InventoryService } from './inventory.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { MatPaginatorHarness } from '@angular/material/paginator/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatTableHarness } from '@angular/material/table/testing';
import { HarnessLoader } from '@angular/cdk/testing';

// RxJS Imports
import { Observable, of, throwError } from 'rxjs';

// Inventory Imports
import { MockInventoryService } from 'src/testing/inventory.service.mock';
import { Inventory } from './inventory';
import { InventoryTableComponent } from './inventory-table.component';

/**
 * This file contains unit tests for the InventoryTableComponent, which is responsible for displaying a table of inventory items with sorting, pagination, and filtering capabilities. The tests cover the component's
 * ability to load inventory data from the InventoryService, handle errors gracefully, and trigger the delete functionality correctly. The tests use Angular's TestBed to set up the
 * testing environment, including providing a mock implementation of the InventoryService to simulate different scenarios. The tests verify that the component is created successfully,
 * that it loads inventory data correctly, and that it handles errors by returning an empty array when the service fails. Additionally, the tests check that the deleteInventory() method
 * is called with the correct parameters when a user confirms deletion of an item, and that appropriate error messages are set when deletion fails or when required parameters are missing.
 */

// Tests for the InventoryTableComponent
describe('Inventory Table', () => {
  let inventoryTable: InventoryTableComponent;
  let fixture: ComponentFixture<InventoryTableComponent>
  let inventoryService: InventoryService;
  let loader: HarnessLoader

  // Set up the testing module and component before each test
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        InventoryTableComponent
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: InventoryService,
          useClass: MockInventoryService
        },
        provideRouter([])
      ] // Ensure provideHttpClientTesting is always present
    });
  });

  // Compile the component and its template before running tests, and initialize the component instance and loader
  beforeEach(fakeAsync(() => {
    TestBed.compileComponents().then(() => {
      fixture = TestBed.createComponent(InventoryTableComponent);
      inventoryTable = fixture.componentInstance;
      inventoryService = TestBed.inject(InventoryService);
      fixture.detectChanges();
      loader = TestbedHarnessEnvironment.loader(fixture);
    });
    flushMicrotasks(); // resolve the compileComponents promise
    tick(300);         // advance past the initial debounceTime(300)
  }));

  // Test to ensure the component is created successfully
  it('should create the component', () => {
    expect(inventoryTable).toBeTruthy();
  });

  // Test to verify that the component's serverFilteredInventory method returns a defined array
  it('should initialize with serverFilteredTable available', () => {
    const inventory = inventoryTable.serverFilteredInventory();
    expect(inventory).toBeDefined();
    expect(Array.isArray(inventory)).toBe(true);
  });

  // Test to verify that the paginator harness is loaded successfully
  it('should load the paginator harnesses', async () => {
    const paginators = await loader.getAllHarnesses(MatPaginatorHarness);
    expect(paginators.length).toBe(1);
  });

  // Test to verify that the table harness is loaded successfully
  it('should load harness for the table', async () => {
    const tables = await loader.getAllHarnesses(MatTableHarness);
    expect(tables.length).toBe(1);
  });

  // Tests to verify that the getInventory method is called with the correct parameters when various filter signals change, using fakeAsync and tick to handle asynchronous operations
  it('should call getInventory() when item signal changes', fakeAsync(() => {
    const spy = spyOn(inventoryService, 'getInventory').and.callThrough();
    inventoryTable.item.set('Markers');
    fixture.detectChanges();
    tick(300);
    expect(spy).toHaveBeenCalledWith({ item: 'Markers', brand: undefined, color: undefined, size: undefined, type: undefined, style: undefined, material: undefined, bin: undefined });
  }));

  // Tests for brand, color, size, type, and material signals changing, ensuring that getInventory is called with the correct parameters for each case
  it('should call getInventory() when brand signal changes', fakeAsync(() => {
    const spy = spyOn(inventoryService, 'getInventory').and.callThrough();
    inventoryTable.brand.set('Crayola');
    fixture.detectChanges();
    tick(300);
    expect(spy).toHaveBeenCalledWith({ item: undefined, brand: 'Crayola', color: undefined, size: undefined, type: undefined, style: undefined, material: undefined, bin: undefined });
  }));

  // Test to verify that getInventory is called with the correct parameters when the color signal changes
  it('should call getInventory() when color signal changes', fakeAsync(() => {
    const spy = spyOn(inventoryService, 'getInventory').and.callThrough();
    inventoryTable.color.set('Red');
    fixture.detectChanges();
    tick(300);
    expect(spy).toHaveBeenCalledWith({ item: undefined, brand: undefined, color: 'Red', size: undefined, type: undefined, style: undefined, material: undefined, bin: undefined });
  }));

  // Test to verify that getInventory is called with the correct parameters when the size signal changes
  it('should call getInventory() when size signal changes', fakeAsync(() => {
    const spy = spyOn(inventoryService, 'getInventory').and.callThrough();
    inventoryTable.size.set('Wide Ruled');
    fixture.detectChanges();
    tick(300);
    expect(spy).toHaveBeenCalledWith({ item: undefined, brand: undefined, color: undefined, size: 'Wide Ruled', type: undefined, style: undefined, material: undefined, bin: undefined });
  }));

  // Test to verify that getInventory is called with the correct parameters when the type signal changes
  it('should call getInventory() when type signal changes', fakeAsync(() => {
    const spy = spyOn(inventoryService, 'getInventory').and.callThrough();
    inventoryTable.type.set('Spiral');
    fixture.detectChanges();
    tick(300);
    expect(spy).toHaveBeenCalledWith({ item: undefined, brand: undefined, color: undefined, size: undefined, type: 'Spiral', style: undefined, material: undefined, bin: undefined });
  }));

  // Test to verify that getInventory is called with the correct parameters when the material signal changes
  it('should call getInventory() when material signal changes', fakeAsync(() => {
    const spy = spyOn(inventoryService, 'getInventory').and.callThrough();
    inventoryTable.material.set('Plastic');
    fixture.detectChanges();
    tick(300);
    expect(spy).toHaveBeenCalledWith({ item: undefined, brand: undefined, color: undefined, size: undefined, type: undefined, style: undefined, material: 'Plastic', bin: undefined });
  }));

  // Test to verify that getInventory is called with the correct parameters when both brand and color signals change
  it('should call getInventory() when brand and color signals change', fakeAsync(() => {
    const spy = spyOn(inventoryService, 'getInventory').and.callThrough();
    inventoryTable.color.set('Black');
    inventoryTable.brand.set('Crayola');
    fixture.detectChanges();
    tick(300);
    expect(spy).toHaveBeenCalledWith({ item: undefined, brand: 'Crayola', color: 'Black', size: undefined, type: undefined, style: undefined, material: undefined, bin: undefined });
  }));

  //Test to verify the use of multiple filter inputs in the same filter
  it('should call getInventory() when item signal changes', fakeAsync(() => {
    const spy = spyOn(inventoryService, 'getInventory').and.callThrough();
    inventoryTable.item.set('Markers, Pencil');
    fixture.detectChanges();
    tick(300);
    expect(spy).toHaveBeenCalledWith({ item: 'Markers, Pencil', brand: undefined, color: undefined, size: undefined, type: undefined, style: undefined, material: undefined, bin: undefined });
  }));

  it('should call getInventory() when brand signal changes', fakeAsync(() => {
    const spy = spyOn(inventoryService, 'getInventory').and.callThrough();
    inventoryTable.brand.set('Crayola, Pink Pearl');
    fixture.detectChanges();
    tick(300);
    expect(spy).toHaveBeenCalledWith({ item: undefined, brand: 'Crayola, Pink Pearl', color: undefined, size: undefined, type: undefined, style: undefined, material: undefined, bin: undefined });
  }));

  it('should call getInventory() when color signal changes', fakeAsync(() => {
    const spy = spyOn(inventoryService, 'getInventory').and.callThrough();
    inventoryTable.color.set('Red, Black');
    fixture.detectChanges();
    tick(300);
    expect(spy).toHaveBeenCalledWith({ item: undefined, brand: undefined, color: 'Red, Black', size: undefined, type: undefined, style: undefined, material: undefined, bin: undefined });
  }));

  it('should call getInventory() when size signal changes', fakeAsync(() => {
    const spy = spyOn(inventoryService, 'getInventory').and.callThrough();
    inventoryTable.size.set('Wide Ruled, College Ruled');
    fixture.detectChanges();
    tick(300);
    expect(spy).toHaveBeenCalledWith({ item: undefined, brand: undefined, color: undefined, size: 'Wide Ruled, College Ruled', type: undefined, style: undefined, material: undefined, bin: undefined });
  }));

  it('should call getInventory() when type signal changes', fakeAsync(() => {
    const spy = spyOn(inventoryService, 'getInventory').and.callThrough();
    inventoryTable.type.set('Spiral, Composition');
    fixture.detectChanges();
    tick(300);
    expect(spy).toHaveBeenCalledWith({ item: undefined, brand: undefined, color: undefined, size: undefined, type: 'Spiral, Composition', style: undefined, material: undefined, bin: undefined });
  }));

  it('should call getInventory() when material signal changes', fakeAsync(() => {
    const spy = spyOn(inventoryService, 'getInventory').and.callThrough();
    inventoryTable.material.set('Plastic, Wood');
    fixture.detectChanges();
    tick(300);
    expect(spy).toHaveBeenCalledWith({ item: undefined, brand: undefined, color: undefined, size: undefined, type: undefined, style: undefined, material: 'Plastic, Wood', bin: undefined });
  }));
  it('should call getInventory() when style signal changes', fakeAsync(() => {
    const spy = spyOn(inventoryService, 'getInventory').and.callThrough();
    inventoryTable.style.set('hexagonal');
    fixture.detectChanges();
    tick(300);
    expect(spy).toHaveBeenCalledWith({ item: undefined, brand: undefined, color: undefined, size: undefined, type: undefined, style: 'hexagonal', material: undefined, bin: undefined });
  }));

  it('should call getInventory() when style signal changes with multiple values', fakeAsync(() => {
    const spy = spyOn(inventoryService, 'getInventory').and.callThrough();
    inventoryTable.style.set('hexagonal, round');
    fixture.detectChanges();
    tick(300);
    expect(spy).toHaveBeenCalledWith({ item: undefined, brand: undefined, color: undefined, size: undefined, type: undefined, style: 'hexagonal, round', material: undefined, bin: undefined });
  }));

  it('should call getInventory() when bin signal changes', fakeAsync(() => {
    const spy = spyOn(inventoryService, 'getInventory').and.callThrough();
    inventoryTable.bin.set(1);
    fixture.detectChanges();
    tick(300);
    expect(spy).toHaveBeenCalledWith({ item: undefined, brand: undefined, color: undefined, size: undefined, type: undefined, style: undefined, material: undefined, bin: 1 });
  }));

  //To check filtered item autofill feature
  it('filteredItemOptions filters correctly when item is set', () => {
    inventoryTable.item.set('pen');
    const result = inventoryTable.filteredItemOptions();
    expect(result.length).toBeGreaterThan(0);
    expect(result.every(opt =>
      opt.label.toLowerCase().includes('pen') || opt.value.toLowerCase().includes('pen')
    )).toBeTrue();
  });
  // Test to verify that getInventory is called with the correct parameters when item, brand, color, and type signals change
  it('should call getInventory() when item, brand, color, and material signals change', fakeAsync(() => {
    const spy = spyOn(inventoryService, 'getInventory').and.callThrough();
    inventoryTable.item.set('Notebook');
    inventoryTable.brand.set('Five Star');
    inventoryTable.color.set('Yellow');
    inventoryTable.type.set('Spiral');
    fixture.detectChanges();
    tick(300);
    expect(spy).toHaveBeenCalledWith({ item: 'Notebook', brand: 'Five Star', color: 'Yellow', size: undefined, type: 'Spiral', style: undefined, material: undefined, bin: undefined });
  }));

  // Test to verify that no error message is shown on successful load of inventory data
  it('should not show error message on successful load', () => {
    expect(inventoryTable.errMsg()).toBeUndefined();
  });

  // Test to verify that an appropriate error message is set when deleteInventory is called with an undefined ID, and that the deleteInventory method is not called in this case
  it('should set errMsg when delete is called with undefined id', () => {
    const deleteSpy = spyOn(inventoryService, 'deleteInventory').and.returnValue(of(undefined));
    inventoryTable.confirmDelete(undefined);

    expect(inventoryTable.errMsg()).toEqual('Cannot delete: missing item ID');
    expect(deleteSpy).not.toHaveBeenCalled();
  });

  // Test to verify that deleteInventory is called with the correct ID and that the item is removed from the data source when the user confirms deletion, using fakeAsync and tick to handle asynchronous operations
  it('should call deleteInventory and remove row when confirmed', fakeAsync(() => {
    const idToDelete = 'item-123';
    const deleteSpy = spyOn(inventoryService, 'deleteInventory').and.returnValue(of(undefined));

    //avoid browser confirm dialog side effect and simulate user clicking "OK"
    spyOn(window, 'confirm').and.returnValue(true);

    // Matrix row pre-seeding to ensure the item to delete is present in the table's data source before deletion.
    inventoryTable.dataSource.data = [
      { _id: idToDelete, item: 'Markers', brand: 'Crayola', color: 'Black', count: 1, size: 'Wide', type: ['Washable'], style: [], material: ['Plastic'], bin: [1], quantity: 0, notes: 'n/a' } as Inventory,
    ];

    inventoryTable.confirmDelete(idToDelete);
    tick();

    expect(deleteSpy).toHaveBeenCalledWith(idToDelete);
    expect(inventoryTable.dataSource.data.length).toBe(0);
  }));

  // Test to verify that deleteInventory is not called and the item remains in the data source when the user cancels deletion, using fakeAsync and tick to handle asynchronous operations
  it('should not call deleteInventory when user cancels confirmation', fakeAsync(() => {
    const idToDelete = 'item-123';
    const deleteSpy = spyOn(inventoryService, 'deleteInventory').and.returnValue(of(undefined));
    spyOn(window, 'confirm').and.returnValue(false);

    inventoryTable.dataSource.data = [
      { _id: idToDelete, item: 'Markers', brand: 'Crayola', color: 'Black', count: 1, size: 'Wide', type: ['Washable'], style: [], material: ['Plastic'], bin: [1], quantity: 0, notes: 'n/a' } as Inventory,
    ];

    inventoryTable.confirmDelete(idToDelete);
    tick();

    expect(deleteSpy).not.toHaveBeenCalled();
    expect(inventoryTable.dataSource.data.length).toBe(1);
  }));

  // Test to verify that an appropriate error message is set when deleteInventory fails, and that the item remains in the data source in this case, using fakeAsync and tick to handle asynchronous operations
  it('should set error message when deleteInventory fails', fakeAsync(() => {
    const idToDelete = 'item-123';
    const deleteSpy = spyOn(inventoryService, 'deleteInventory').and.returnValue(throwError(() => ({ status: 500, message: 'Internal' })));
    spyOn(window, 'confirm').and.returnValue(true);

    inventoryTable.dataSource.data = [
      { _id: idToDelete, item: 'Markers', brand: 'Crayola', color: 'Black', count: 1, size: 'Wide', type: ['Washable'], style: [], material: ['Plastic'], bin: [1], quantity: 0, notes: 'n/a' } as Inventory,
    ];

    inventoryTable.confirmDelete(idToDelete);
    tick();

    expect(deleteSpy).toHaveBeenCalledWith(idToDelete);
    expect(inventoryTable.errMsg()).toContain('');
    expect(inventoryTable.dataSource.data.length).toBe(1);
  }));

  // Test to verify that startEdit sets the editingRowId to the row's _id
  it('should enter edit mode and set editingRowId when startEdit is called', () => {
    const row: Inventory = {
      _id: 'edit-id-1', item: 'Markers', brand: 'Crayola',
      color: 'Black', count: 1, size: 'Wide', type: ['Washable'], style: [], material: ['Plastic'], bin: [1],
      quantity: 0, notes: 'n/a'
    };

    inventoryTable.startEdit(row);

    expect(inventoryTable.editingRowId).toBe('edit-id-1');
  });

  // Test to verify that cancelEdit reverts the row to its original values and clears editingRowId
  it('should revert row values and clear editingRowId when cancelEdit is called', () => {
    const row: Inventory = {
      _id: 'edit-id-2', item: 'Original', brand: 'Brand',
      color: 'Blue', count: 2, size: 'Small', type: ['Regular'], style: [], material: ['Wood'], bin: [],
      quantity: 3, notes: 'notes here'
    };

    inventoryTable.startEdit(row);
    row.item = 'Modified';
    inventoryTable.cancelEdit(row);

    expect(inventoryTable.editingRowId).toBeNull();
    expect(row.item).toBe('Original');
  });

  // Test to verify that saveEdit calls editInventory with the correct ID and row data, and clears editing state on success
  it('should call editInventory and clear editing state on successful saveEdit', fakeAsync(() => {
    const row: Inventory = {
      _id: 'edit-id-3', item: 'Notebook', brand: 'Five Star',
      color: 'Yellow', count: 1, size: 'Wide', type: ['Spiral'], style: [], material: ['Paper'], bin: [],
      quantity: 5, notes: ''
    };

    const editSpy = spyOn(inventoryService, 'editInventory').and.returnValue(of(undefined));
    inventoryTable.startEdit(row);
    inventoryTable.saveEdit(row);
    tick();

    expect(editSpy).toHaveBeenCalledWith('edit-id-3', row);
    expect(inventoryTable.editingRowId).toBeNull();
  }));

  // Test to verify that saveEdit sets an error message when editInventory fails
  it('should set errMsg when saveEdit fails', fakeAsync(() => {
    const row: Inventory = {
      _id: 'edit-id-4', item: 'Folder', brand: 'N/A',
      color: 'Red', count: 1, size: 'N/A', type: ['Prong'], style: [], material: ['Plastic'], bin: [],
      quantity: 2, notes: ''
    };

    spyOn(inventoryService, 'editInventory').and.returnValue(
      throwError(() => ({ status: 500, message: 'Server error' }))
    );
    inventoryTable.startEdit(row);
    inventoryTable.saveEdit(row);
    tick();

    expect(inventoryTable.errMsg()).toContain('Problem saving item');
  }));

  // Test to verify that saveEdit does nothing when the row has no _id
  it('should do nothing when saveEdit is called on a row without an _id', fakeAsync(() => {
    const row: Partial<Inventory> = {
      item: 'No ID item', brand: 'N/A',
      color: 'Red', count: 1, size: 'N/A', type: ['Prong'], style: [], material: ['Plastic'], bin: [],
      quantity: 1, notes: ''
    };

    const editSpy = spyOn(inventoryService, 'editInventory').and.returnValue(of(undefined));
    inventoryTable.saveEdit(row as Inventory);
    tick();

    expect(editSpy).not.toHaveBeenCalled();
  }));

  // Test to verify that addRow is a no-op when already editing a new row
  it('should not add a second new row when addRow is called while already editing a new row', () => {
    inventoryTable.addRow();
    const lengthAfterFirst = inventoryTable.dataSource.data.length;
    inventoryTable.addRow(); // second call should be no-op
    expect(inventoryTable.dataSource.data.length).toBe(lengthAfterFirst);
  });

  // Test to verify that saveEdit handles new row via addInventory (POST path)
  it('should call addInventory when saveEdit is called on a new row', fakeAsync(() => {
    const addSpy = spyOn(inventoryService, 'addInventory').and.returnValue(of('new-server-id'));
    inventoryTable.addRow();
    const newRow = inventoryTable.dataSource.data.find(r => r._id === '__new__')!;

    inventoryTable.saveEdit(newRow);
    tick();

    expect(addSpy).toHaveBeenCalled();
    expect(inventoryTable.editingRowId).toBeNull();
    expect(newRow._id).toBe('new-server-id');
  }));

  // Test to verify that addInventory error sets errMsg
  it('should set errMsg when addInventory fails on a new row', fakeAsync(() => {
    spyOn(inventoryService, 'addInventory').and.returnValue(
      throwError(() => ({ status: 500, message: 'Server error' }))
    );
    inventoryTable.addRow();
    const newRow = inventoryTable.dataSource.data.find(r => r._id === '__new__')!;

    inventoryTable.saveEdit(newRow);
    tick();

    expect(inventoryTable.errMsg()).toContain('Problem adding item');
  }));

  // Test to verify that cancelEdit removes the new row from the data source
  it('should remove the new row from dataSource when cancelEdit is called on a new row', () => {
    inventoryTable.addRow();
    expect(inventoryTable.dataSource.data.some(r => r._id === '__new__')).toBeTrue();

    const newRow = inventoryTable.dataSource.data.find(r => r._id === '__new__')!;
    inventoryTable.cancelEdit(newRow);

    expect(inventoryTable.dataSource.data.some(r => r._id === '__new__')).toBeFalse();
  });

  // Test to verify that resetFilters clears all filter signals back to undefined
  it('should reset all filter signals to undefined when resetFilters is called', fakeAsync(() => {
    inventoryTable.item.set('Markers');
    inventoryTable.brand.set('Crayola');
    inventoryTable.color.set('Black');
    inventoryTable.size.set('Wide');
    inventoryTable.type.set('Washable');
    inventoryTable.style.set('hexagonal');
    inventoryTable.material.set('Plastic');
    inventoryTable.bin.set(1);

    inventoryTable.resetFilters();

    expect(inventoryTable.item()).toBeUndefined();
    expect(inventoryTable.brand()).toBeUndefined();
    expect(inventoryTable.color()).toBeUndefined();
    expect(inventoryTable.size()).toBeUndefined();
    expect(inventoryTable.type()).toBeUndefined();
    expect(inventoryTable.style()).toBeUndefined();
    expect(inventoryTable.material()).toBeUndefined();
    expect(inventoryTable.bin()).toBeUndefined();
  }));
});

// Tests for the InventoryTableComponent when the InventoryService is not set up properly, ensuring that appropriate error messages are shown and that the component handles the error gracefully
describe('Misbehaving Inventory Table', () => {
  let inventoryTable: InventoryTableComponent;
  let fixture: ComponentFixture<InventoryTableComponent>;

  let inventoryServiceStub: {
    getInventory: () => Observable<Inventory[]>;
  };

  beforeEach(() => {
    inventoryServiceStub = {
      getInventory: () =>
        new Observable((observer) => {
          observer.error('getInventory() Observer generates an error');
        })
    };
  });

  // Set up the testing module and component before each test, providing the misbehaving InventoryService stub
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        InventoryTableComponent
      ],
      providers: [
        { provide: InventoryService, useValue: inventoryServiceStub },
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting()
      ],
    })
      .compileComponents();
  }));

  // Compile the component and its template before running tests, and initialize the component instance
  beforeEach(fakeAsync(() => {
    fixture = TestBed.createComponent(InventoryTableComponent);
    inventoryTable = fixture.componentInstance;
    fixture.detectChanges();
    tick(300);
  }));

  // Test to verify that an appropriate error message is set when the InventoryService fails to provide inventory data, and that the serverFilteredInventory method returns an empty array in this case
  it("generates an error if we don't set up a InventoryService", () => {
    expect(inventoryTable.serverFilteredInventory())
      .withContext("service can't give values to the list if it's not there")
      .toEqual([]);
    expect(inventoryTable.errMsg())
      .withContext('the error message will be')
      .toContain('Problem contacting the server – Error Code:');
  });
});
