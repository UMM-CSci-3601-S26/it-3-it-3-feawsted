// Angular Imports
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

// RxJS Imports
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// Environment and Family Interface Imports
import { environment } from '../../environments/environment';
import { Family, DashboardStats } from './family';

@Injectable({
  providedIn: 'root'
})

/**
 * FamilyService is an Angular service responsible for managing all interactions with the backend API related to family data.
 * It provides methods to fetch the list of families, retrieve details of a specific family by ID, add a new family, delete a family,
 * fetch dashboard statistics, and export family data in CSV format. The service uses Angular's HttpClient to make HTTP requests to
 * the API endpoints defined in the environment configuration, and it handles the necessary query parameters for filtering and data retrieval as needed.
 * Each method returns an Observable that can be subscribed to by components or other services that require access to family data.
 */
export class FamilyService {
  private httpClient = inject(HttpClient);

  // Define the base URLs for the family and dashboard API endpoints using the environment configuration
  readonly familyUrl: string = `${environment.apiUrl}families`;
  readonly dashboardUrl: string = `${environment.apiUrl}dashboard`;

  // Method to fetch the list of families from the API, with optional filtering parameters. It constructs the appropriate HTTP request and returns an Observable of an array of Family objects.
  getFamilies(): Observable<Family[]> {
    const httpParams: HttpParams = new HttpParams();
    return this.httpClient.get<Family[]>(this.familyUrl, {
      params: httpParams,
    });
  }

  // Method to fetch the details of a specific family by its ID from the API. It constructs the appropriate HTTP request and returns an Observable of a Family object.
  getFamilyById(id: string): Observable<Family> {
    return this.httpClient.get<Family>(`${this.familyUrl}/${id}`);
  }

  // Method to add a new family to the database by sending a POST request to the API with the family data. It returns an Observable of the newly created family's ID as a string.
  addFamily(newFamily: Partial<Family>): Observable<string> {
    return this.httpClient.post<{ id: string }>(this.familyUrl, newFamily).pipe(map(response => response.id));
  }

  // Method to delete a family from the database by sending a DELETE request to the API with the family's ID. It returns an Observable that can be subscribed to for handling the response.
  deleteFamily(id: string): Observable<unknown> {
    return this.httpClient.delete<void>(`${this.familyUrl}/${id}`);
  }

  // Method to fetch dashboard statistics from the API. It constructs the appropriate HTTP request and returns an Observable of a DashboardStats object.
  getDashboardStats(): Observable<DashboardStats> {
    const httpParams: HttpParams = new HttpParams();
    return this.httpClient.get<DashboardStats>(this.dashboardUrl, {
      params: httpParams,
    });
  }

  // Method to export family data in CSV format by sending a GET request to the API endpoint for exporting. It returns an Observable of the CSV data as a string.
  exportFamilies(): Observable<string> {
    return this.httpClient.get(`${this.familyUrl}/export`, {
      responseType: 'text'
    });
  }
  editInventory(id: string, updateFamily: Partial<Family>): Observable<void> {
    return this.httpClient.put<void>(`${this.familyUrl}/${id}`, updateFamily);
  }
}
