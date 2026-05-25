import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { LoginRequest, LoginResponse } from './models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'sake_admin_token';
  private http = inject(HttpClient);
  private router = inject(Router);

  isLoggedIn = signal<boolean>(false);

  constructor() {
    this.isLoggedIn.set(!!this.getToken());
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    const url = `${environment.apiUrl}${environment.apiEndpoints.authLogin}`;
    return this.http.post<LoginResponse>(url, credentials).pipe(
      tap((response) => {
        this.setToken(response.token);
      })
    );
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    this.isLoggedIn.set(true);
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    this.isLoggedIn.set(false);
    this.router.navigate(['/admin/login']);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}
