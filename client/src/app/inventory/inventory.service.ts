// Angular Imports
import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

// RxJS Imports
import { map, Observable } from 'rxjs';

// Inventory Imports
import { Inventory } from './inventory';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})

/**
 * InventoryService is an Angular service responsible for managing all interactions with the backend API related to inventory data.
 * It provides methods to fetch the list of inventory items with optional filtering parameters, delete an inventory item by ID, and add a new inventory item.
 * The service uses Angular's HttpClient to make HTTP requests to the API endpoints defined in the environment configuration, and it handles the necessary query parameters for filtering and data retrieval as needed.
 * Each method returns an Observable that can be subscribed to by components or other services that require access to inventory data.
 */
export class InventoryService {
  private httpClient = inject(HttpClient);

  // Define the base URL for the inventory API endpoint using the environment configuration
  readonly inventoryUrl: string = `${environment.apiUrl}inventory`;

  // Define keys for the inventory item properties to be used in constructing HTTP query parameters for filtering
  private readonly itemKey = 'item';
  private readonly descriptionKey = 'description';
  private readonly brandKey = 'brand';
  private readonly colorKey = 'color';
  private readonly countKey = 'count';
  private readonly sizeKey = 'size';
  private readonly typeKey = 'type';
  private readonly materialKey = 'material';
  private readonly quantityKey = 'quantity';
  private readonly notesKey = 'notes';

  // Method to fetch the list of inventory items from the API, with optional filtering parameters. It constructs the appropriate HTTP request and returns an Observable of an array of Inventory objects.
  getInventory(filters?: {item?: string; description?: string; brand?: string; color?: string;
    count?: number; size?: string; type?: string; material?: string; quantity?: number; notes?: string}): Observable<Inventory[]> {

    // Construct HTTP query parameters based on the provided filters, setting each parameter only if the corresponding filter value is defined. Then, make a GET request to the inventory API endpoint with the constructed parameters and return an Observable of an array of Inventory objects.
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
      if (filters.type) {
        httpParams = httpParams.set(this.typeKey, filters.type);
      }
      if (filters.material) {
        httpParams = httpParams.set(this.materialKey, filters.material);
      }

    }
    // Make a GET request to the inventory API endpoint with the constructed query parameters and return an Observable of an array of Inventory objects.
    return this.httpClient.get<Inventory[]>(this.inventoryUrl, { params: httpParams });
  }

  // Method to delete an inventory item from the database by sending a DELETE request to the API with the item's ID. It returns an Observable that can be subscribed to for handling the response.
  deleteInventory(id: string): Observable<unknown> {
    return this.httpClient.delete<void>(`${this.inventoryUrl}/${id}`);
  }

  // Method to add a new inventory item to the database by sending a POST request to the API with the inventory data. It returns an Observable of the newly created inventory item's ID as a string.
  addInventory(newInventory: Partial<Inventory>): Observable<string> {
    return this.httpClient.post<{ id: string }>(this.inventoryUrl, newInventory).pipe(map(response => response.id));
  }

  // Method to edit an existing inventory item in the database by sending a PUT request to the API with the item's ID and the updated inventory data. It returns an Observable that can be subscribed to for handling the response.
  editInventory(id: string, updatedInventory: Partial<Inventory>): Observable<void> {
    return this.httpClient.put<void>(`${this.inventoryUrl}/${id}`, updatedInventory);
  }
}
