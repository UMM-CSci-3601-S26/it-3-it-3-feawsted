import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { AppComponent } from 'src/app/app.component';
import { SupplyList } from '../app/supplylist/supplylist';
import { SupplyListService } from 'src/app/supplylist/supplylist.service';

@Injectable({
  providedIn: AppComponent
})

export class MockSupplyListService implements Pick<SupplyListService, 'getSupplyList'> {
  static testSupplyList: SupplyList[] = [
    {
      school: "MHS",
      grade: "PreK",
      item: "Markers",
      description: "8 Pack of Washable Wide Markers",
      brand: "Crayola",
      color: "N/A",
      count: 8,
      size: "Wide",
      type: "Washable",
      material: "N/A",
      quantity: 0,
      notes: "N/A"
    },
    {
      school: "Herman",
      grade: "preK",
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
      school: "MHS",
      grade: "6th grade",
      item: "Notebook",
      description: "Yellow Wide Ruled Spiral Notebook",
      brand: "Five Star",
      color: "Yellow",
      count: 1,
      size: "Wide Ruled",
      type: "Spiral",
      material: "N/A",
      quantity: 0,
      notes: "N/A"
    }
  ];

  /* eslint-disable @typescript-eslint/no-unused-vars */
  getSupplyList(_filters: { school?: string, grade?: string, item?: string, brand?: string, color?: string, size?: string, type?: string, material?: string }): Observable<SupplyList[]> {
    return of(MockSupplyListService.testSupplyList);
  }
}
