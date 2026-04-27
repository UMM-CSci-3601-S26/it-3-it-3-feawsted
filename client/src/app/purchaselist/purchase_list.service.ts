import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PurchaseList } from './purchase_list';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PurchaseListService {
  private httpClient = inject(HttpClient);

  readonly purchaselistUrl: string = `${environment.apiUrl}purchaselist`;

  private readonly itemKey = 'item';
  private readonly brandKey = 'brand';
  private readonly colorKey = 'color';
  private readonly sizeKey = 'size';

  getPurchaseList(filters?: {school?: string; grade?: string; item?: string; brand?: string; color?: string;
    count?: number; size?: string; type?: string; material?: string; style?: string; quantity?: number; notes?: string}): Observable<PurchaseList[]> {

    let httpParams: HttpParams = new HttpParams();
    if (filters) {
      if (filters.item) {
        httpParams = httpParams.set(this.itemKey, filters.item);
      }
      if (filters.brand) {
        httpParams = httpParams.set(this.brandKey, filters.brand);
      }
      if (filters.color) {
        httpParams = httpParams.set(this.colorKey, filters.color);
      }
      if (filters.size) {
        httpParams = httpParams.set(this.sizeKey, filters.size);
      }

    }
    return this.httpClient.get<PurchaseList[]>(this.purchaselistUrl, { params: httpParams });
  }

}
