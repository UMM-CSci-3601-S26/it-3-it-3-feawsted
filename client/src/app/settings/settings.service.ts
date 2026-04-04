import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Settings } from './settings';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private readonly settingsUrl = `${environment.apiUrl}settings`;
  private http = inject(HttpClient);

  getSettings(): Observable<Settings> {
    return this.http.get<Settings>(this.settingsUrl);
  }
}
