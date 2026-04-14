import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { AppComponent } from 'src/app/app.component';
import { SupplyList } from '../app/supplylist/supplylist';
import { SupplyListService } from 'src/app/supplylist/supplylist.service';

@Injectable({
  providedIn: AppComponent
})

export class MockSupplyListService implements Pick<SupplyListService, 'getSupplyList' | 'addSupplyList' | 'deleteSupplyList' | 'editSupplyList'> {
  static testSupplyList: SupplyList[] = [
    {
      school: "MHS",
      grade: "PreK",
      item: ["Markers"],
      brand: { allOf: [], anyOf: ["Crayola"] },
      color: { allOf: [], anyOf: [] },
      count: 8,
      size: "Wide",
      type: { allOf: ["Washable"], anyOf: [] },
      style: { allOf: [], anyOf: [] },
      material: { allOf: [], anyOf: [] },
      quantity: 0,
      notes: ""
    },
    {
      school: "Herman",
      grade: "preK",
      item: ["Folder"],
      brand: { allOf: [], anyOf: [] },
      color: { allOf: [], anyOf: ["Red"] },
      count: 1,
      size: "",
      type: { allOf: ["2 Prong"], anyOf: [] },
      style: { allOf: [], anyOf: [] },
      material: { allOf: [], anyOf: ["Plastic"] },
      quantity: 0,
      notes: ""
    },
    {
      school: "MHS",
      grade: "6th grade",
      item: ["Notebook"],
      brand: { allOf: [], anyOf: ["Five Star"] },
      color: { allOf: [], anyOf: ["Yellow"] },
      count: 1,
      size: "Wide Ruled",
      type: { allOf: ["Spiral"], anyOf: [] },
      style: { allOf: [], anyOf: [] },
      material: { allOf: [], anyOf: [] },
      quantity: 0,
      notes: ""
    }
  ];

  /* eslint-disable @typescript-eslint/no-unused-vars */
  getSupplyList(_filters: { school?: string, grade?: string, item?: string, brand?: string, color?: string, size?: string, type?: string, material?: string, style?: string }): Observable<SupplyList[]> {
    return of(MockSupplyListService.testSupplyList);
  }

  addSupplyList(_newItem: Partial<SupplyList>): Observable<void> {
    return of(undefined);
  }

  deleteSupplyList(_id: string): Observable<unknown> {
    return of(undefined);
  }

  editSupplyList(_id: string, _updatedItem: Partial<SupplyList>): Observable<void> {
    return of(undefined);
  }
}
