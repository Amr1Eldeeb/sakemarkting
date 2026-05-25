import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { MarketingService } from './models';

@Injectable({ providedIn: 'root' })
export class ServiceApiService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}${environment.apiEndpoints.services}`;

  getAll(): Observable<MarketingService[]> {
    return this.http.get<MarketingService[]>(this.baseUrl);
  }

  getById(id: number): Observable<MarketingService> {
    return this.http.get<MarketingService>(`${this.baseUrl}/${id}`);
  }

  create(formData: FormData): Observable<MarketingService> {
    return this.http.post<MarketingService>(this.baseUrl, formData);
  }

  update(id: number, formData: FormData): Observable<MarketingService> {
    return this.http.put<MarketingService>(`${this.baseUrl}/${id}`, formData);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
