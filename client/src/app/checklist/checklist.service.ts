// Angular Imports
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

// RxJS Imports
import { Observable } from 'rxjs';

// Environment and Checklist Interface Imports
import { environment } from '../../environments/environment';
import { Checklist } from './checklist';

@Injectable({
  providedIn: 'root'
})

/**
 * ChecklistService is an Angular service responsible for managing all interactions with the backend API related to checklist data.
 * It provides methods to fetch the list of checklists, retrieve details of a specific checklist by ID, add a new checklist, delete a checklist,
 * fetch dashboard statistics, and export checklist data in CSV format. The service uses Angular's HttpClient to make HTTP requests to
 * the API endpoints defined in the environment configuration, and it handles the necessary query parameters for filtering and data retrieval as needed.
 * Each method returns an Observable that can be subscribed to by components or other services that require access to checklist data.
 */
export class ChecklistService {
  private httpClient = inject(HttpClient);

  // Define the base URLs for the checklist and dashboard API endpoints using the environment configuration
  readonly checklistUrl: string = `${environment.apiUrl}checklists`;

  // Method to fetch the list of checklists from the API, with optional filtering parameters. It constructs the appropriate HTTP request and returns an Observable of an array of Checklist objects.
  getChecklists(): Observable<Checklist[]> {
    const httpParams: HttpParams = new HttpParams();
    return this.httpClient.get<Checklist[]>(this.checklistUrl, {
      params: httpParams,
    });
  }

  generateChecklists(): Observable<Checklist[]> {
    return this.httpClient.post<Checklist[]>(this.checklistUrl, {});
  }

  // Method to fetch the details of a specific checklist by its ID from the API. It constructs the appropriate HTTP request and returns an Observable of a Checklist object.
  getChecklistById(id: string): Observable<Checklist> {
    return this.httpClient.get<Checklist>(`${this.checklistUrl}/${id}`);
  }

  // Method to export checklist data in CSV format by sending a GET request to the API endpoint for exporting. It returns an Observable of the CSV data as a string.
  // exportChecklists(): Observable<string> {
  //   return this.httpClient.get(`${this.checklistUrl}/export`, {
  //     responseType: 'text'
  //   });
  // }
}
