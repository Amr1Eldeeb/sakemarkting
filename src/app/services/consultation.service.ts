import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiMessageResponse, ConsultationRequest } from './models';

@Injectable({ providedIn: 'root' })
export class ConsultationService {
  private http = inject(HttpClient);

  submit(request: ConsultationRequest): Observable<ApiMessageResponse> {
    const url = `${environment.apiUrl}${environment.apiEndpoints.consultationRequest}`;
    return this.http.post<ApiMessageResponse>(url, request);
  }
}
