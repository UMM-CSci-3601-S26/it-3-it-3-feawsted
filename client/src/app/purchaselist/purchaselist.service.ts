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

  // private readonly itemKey = 'item';
  // private readonly brandKey = 'brand';
  // private readonly colorKey = 'color';
  // private readonly sizeKey = 'size';

  getPurchaselist(): Observable<Purchaselist[]> { //filters?: {school?: string; grade?: string; item?: string; brand?: string; color?: string;
    //count?: number; size?: string; type?: string; material?: string; style?: string; quantity?: number; notes?: string}

    // let httpParams: HttpParams = new HttpParams();
    // if (filters) {
    //   if (filters.item) {
    //     httpParams = httpParams.set(this.itemKey, filters.item);
    //   }
    //   if (filters.brand) {
    //     httpParams = httpParams.set(this.brandKey, filters.brand);
    //   }
    //   if (filters.color) {
    //     httpParams = httpParams.set(this.colorKey, filters.color);
    //   }
    //   if (filters.size) {
    //     httpParams = httpParams.set(this.sizeKey, filters.size);
    //   }

    // }
    return this.httpClient.get<Purchaselist[]>(this.purchaselistUrl); //, { params: httpParams });
  }
  addChecklist(checklist: Checklist): Observable<Checklist> {
    return this.httpClient.post<Checklist>(`${environment.apiUrl}checklists`, checklist);
  }
}
