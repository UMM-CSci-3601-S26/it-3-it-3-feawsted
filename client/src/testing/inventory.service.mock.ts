import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { AppComponent } from 'src/app/app.component';
import { Inventory } from '../app/inventory/inventory';
import { InventoryService } from 'src/app/inventory/inventory.service';

@Injectable({
  providedIn: AppComponent
})

export class MockInventoryService implements Pick<InventoryService, 'getInventory' | 'deleteInventory' | 'addInventory' | 'editInventory'> {
  static testInventory: Inventory[] = [
    {
      item: "Markers",
      brand: "Crayola",
      color: "N/A",
      count: 8,
      size: "Wide",
      type: ["Washable"],
      style: [],
      material: [],
      bin: [1],
      quantity: 0,
      notes: "N/A"
    },
    {
      item: "Folder",
      brand: "N/A",
      color: "Red",
      count: 1,
      size: "N/A",
      type: ["2 Prong"],
      style: [],
      material: ["Plastic"],
      bin: [2],
      quantity: 0,
      notes: "N/A"
    },
    {
      item: "Notebook",
      brand: "Five Star",
      color: "Yellow",
      count: 1,
      size: "Wide Ruled",
      type: ["Spiral"],
      style: [],
      material: [],
      bin: [3],
      quantity: 0,
      notes: "N/A"
    }
  ];

  /* eslint-disable @typescript-eslint/no-unused-vars */
  getInventory(_filters: { item?: string, brand?: string, color?: string, size?: string, type?: string, style?: string, material?: string, bin?: number, quantity?: number, notes?: string, count?: number }): Observable<Inventory[]> {
    return of(MockInventoryService.testInventory);
  }

  deleteInventory(id: string): Observable<unknown> {
    return of(undefined);
  }

  addInventory(newInventory: Partial<Inventory>): Observable<string> {
    return of('mock-id');
  }

  editInventory(_id: string, _updatedInventory: Partial<Inventory>): Observable<void> {
    return of(undefined);
  }
}
