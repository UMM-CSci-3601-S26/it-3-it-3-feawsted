import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { AppComponent } from 'src/app/app.component';
import { Checklist } from '../app/checklist/checklist';
import { ChecklistService } from 'src/app/checklist/checklist.service';
import { MockSupplyListService } from './supplylist.service.mock';

@Injectable({
  providedIn: AppComponent
})
export class MockChecklistService implements Pick<ChecklistService, 'getChecklists' | 'getChecklistById' > { //'exportChecklists'

  static testChecklists: Checklist[] = [
    {
      //checklist with one kid
      _id: 'john_id',
      studentName: 'John',
      school: 'Herman',
      grade: '7',
      requestedSupplies:['backpack'],
      checklist: {
        supply: MockSupplyListService.mockSupply,
        completed: false,
        unreceived: false,
        selectedOption: ''
      }
    },
    {
      //checklist with two kids
      _id: 'jane_id',
      studentName: 'Jane Doe',
      school: 'janedoe@email.com',
      grade: '123 Street',
      requestedSupplies:['backpack'],
      checklist: {
        supply: '?????????????, blaaahh',
        completed: false,
        unreceived: false,
        selectedOption: ''
      }
    },
    {
      //checklist with three kids
      _id: 'george_id',
      studentName: 'George Peterson',
      school: 'georgepeter@email.com',
      grade: '245 Acorn Way',
      requestedSupplies:['backpack'],
      checklist: {
        supply: 'marker, pencil, tissues',
        completed: false,
        unreceived: false,
        selectedOption: ''
      }
    },
  ];
  static mockSupply: any;

  getChecklists(): Observable<Checklist[]> {
    return of(MockChecklistService.testChecklists);
  }

  getChecklistById(id: string): Observable<Checklist> {
    if (id === MockChecklistService.testChecklists[0]._id) {
      return of(MockChecklistService.testChecklists[0]);
    } else if (id === MockChecklistService.testChecklists[1]._id) {
      return of(MockChecklistService.testChecklists[1]);
    } else {
      return of(null);
    }
  }

  // exportChecklists(): Observable<string> {
  //   return of('csv-data');
  // }
}
