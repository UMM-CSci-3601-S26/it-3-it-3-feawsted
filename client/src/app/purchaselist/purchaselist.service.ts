import { HttpClient } from '@angular/common/http'; //HttpParams
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Purchaselist } from './purchaselist';
import { environment } from 'src/environments/environment';
import { Checklist } from '../checklist/checklist';
//import { Checklist } from '../checklist/checklist';

@Injectable({
  providedIn: 'root'
})
export class PurchaselistService {
  private httpClient = inject(HttpClient);

  readonly purchaselistUrl: string = `${environment.apiUrl}purchaselist`;


  getPurchaselist(): Observable<Purchaselist[]> { //filters?: {school?: string; grade?: string; item?: string; brand?: string; color?: string;
    //count?: number; size?: string; type?: string; material?: string; style?: string; quantity?: number; notes?: string}

    return this.httpClient.get<Purchaselist[]>(this.purchaselistUrl); //, { params: httpParams });
  }
  addChecklist(checklist: Checklist): Observable<Checklist> {
    return this.httpClient.post<Checklist>(`${environment.apiUrl}checklists`, checklist);
  }
}
