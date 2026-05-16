import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { AuthResponse, LoginRequest, ApiResponse } from '../models/models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private currentUserSubject = new BehaviorSubject<AuthResponse | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem('ems_user');
      if (stored) {
        const user: AuthResponse = JSON.parse(stored);
        if (new Date(user.expiry) > new Date()) {
          this.currentUserSubject.next(user);
        } else {
          this.clearStorage();
        }
      }
    } catch {
      this.clearStorage();
    }
  }

  get currentUser(): AuthResponse | null {
    return this.currentUserSubject.value;
  }

  get isLoggedIn(): boolean {
    return !!this.currentUserSubject.value;
  }

  get userRole(): string {
    return this.currentUserSubject.value?.role ?? '';
  }

  get token(): string {
    return this.currentUserSubject.value?.token ?? '';
  }

  get username(): string {
    return this.currentUserSubject.value?.username ?? '';
  }

  get userEmail(): string {
    return this.currentUserSubject.value?.email ?? '';
  }

  isAdmin(): boolean { return this.userRole === 'Admin'; }
  isHR(): boolean { return this.userRole === 'HR' || this.isAdmin(); }
  isEmployee(): boolean { return this.userRole === 'Employee'; }

  login(credentials: LoginRequest): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.apiUrl}/login`, credentials).pipe(
      tap(res => {
        if (res.success && res.data) {
          localStorage.setItem('ems_user', JSON.stringify(res.data));
          localStorage.setItem('ems_token', res.data.token);
          this.currentUserSubject.next(res.data);
        }
      })
    );
  }

  logout(): void {
    this.http.post(`${this.apiUrl}/logout`, {}).subscribe({ error: () => {} });
    this.clearStorage();
    this.router.navigate(['/login']);
  }

  private clearStorage(): void {
    localStorage.removeItem('ems_user');
    localStorage.removeItem('ems_token');
    this.currentUserSubject.next(null);
  }
}
