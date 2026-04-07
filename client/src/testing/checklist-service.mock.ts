import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { AppComponent } from 'src/app/app.component';
import { Checklist } from '../app/checklist/checklist';
import { ChecklistService } from 'src/app/checklist/checklist.service';
import { SupplyList } from 'src/app/supplylist/supplylist';

@Injectable({
  providedIn: AppComponent
})
export class MockChecklistService implements Pick<ChecklistService, 'getChecklists' | 'getChecklistById' | 'generateChecklists'> {
  static mockSupply1: SupplyList = {
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

  static mockSupply2: SupplyList = {
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


  static testChecklists: Checklist[] = [
    {
      _id: '1',
      studentName: 'John',
      school: 'Herman',
      grade: '7',
      requestedSupplies: ['backpack'],
      checklist: [
        {
          supply: MockChecklistService.mockSupply1,
          completed: false,
          unreceived: false,
          selectedOption: ''
        }
      ]
    },
    {
      _id: '2',
      studentName: 'Jane',
      school: 'Herman',
      grade: '3',
      requestedSupplies: ['backpack'],
      checklist: [
        {
          supply: MockChecklistService.mockSupply2,
          completed: false,
          unreceived: false,
          selectedOption: ''
        }
      ]
    }
  ];

  getChecklists(): Observable<Checklist[]> {
    return of(MockChecklistService.testChecklists);
  }

  generateChecklists(): Observable<Checklist[]> {
    return of(MockChecklistService.testChecklists);
  }

  getChecklistById(id: string): Observable<Checklist> {
    if (id === MockChecklistService.testChecklists[0]._id) {
      return of(MockChecklistService.testChecklists[0]);
    } else if (id === MockChecklistService.testChecklists[1]._id) {
      return of(MockChecklistService.testChecklists[1]);
    } else {
      return of(MockChecklistService.testChecklists[0]);
    }
  }

  // exportChecklists(): Observable<string> {
  //   return of('csv-data');
  // }
}
