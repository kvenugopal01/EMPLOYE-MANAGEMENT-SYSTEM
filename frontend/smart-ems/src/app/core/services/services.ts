import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  Employee, EmployeeListItem, CreateEmployeeDto, UpdateEmployeeDto,
  PagedResult, EmployeeQueryParams, DashboardStats, Activity,
  AttendanceSummary, Department, CreateDepartmentDto, ApiResponse
} from '../models/models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class EmployeeService {
  private apiUrl = `${environment.apiUrl}/employees`;

  constructor(private http: HttpClient) {}

  getAll(params: EmployeeQueryParams): Observable<ApiResponse<PagedResult<EmployeeListItem>>> {
    let httpParams = new HttpParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        httpParams = httpParams.set(key, val.toString());
      }
    });
    return this.http.get<ApiResponse<PagedResult<EmployeeListItem>>>(this.apiUrl, { params: httpParams });
  }

  getById(id: number): Observable<ApiResponse<Employee>> {
    return this.http.get<ApiResponse<Employee>>(`${this.apiUrl}/${id}`);
  }

  create(dto: CreateEmployeeDto): Observable<ApiResponse<Employee>> {
    return this.http.post<ApiResponse<Employee>>(this.apiUrl, dto);
  }

  update(id: number, dto: UpdateEmployeeDto): Observable<ApiResponse<Employee>> {
    return this.http.put<ApiResponse<Employee>>(`${this.apiUrl}/${id}`, dto);
  }

  archive(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${id}`);
  }

  restore(id: number): Observable<ApiResponse<any>> {
    return this.http.patch<ApiResponse<any>>(`${this.apiUrl}/${id}/restore`, {});
  }

  getArchived(): Observable<ApiResponse<Employee[]>> {
    return this.http.get<ApiResponse<Employee[]>>(`${this.apiUrl}/archived`);
  }

  getDashboard(): Observable<ApiResponse<DashboardStats>> {
    return this.http.get<ApiResponse<DashboardStats>>(`${this.apiUrl}/dashboard`);
  }

  getActivities(id: number): Observable<ApiResponse<Activity[]>> {
    return this.http.get<ApiResponse<Activity[]>>(`${this.apiUrl}/${id}/activities`);
  }

  getAttendance(id: number, year: number, month: number): Observable<ApiResponse<AttendanceSummary>> {
    return this.http.get<ApiResponse<AttendanceSummary>>(
      `${this.apiUrl}/${id}/attendance?year=${year}&month=${month}`
    );
  }

  uploadPhoto(id: number, file: File): Observable<any> {
    const form = new FormData();
    form.append('file', file);
    return this.http.post(`${this.apiUrl}/${id}/photo`, form);
  }

  uploadResume(id: number, file: File): Observable<any> {
    const form = new FormData();
    form.append('file', file);
    return this.http.post(`${this.apiUrl}/${id}/resume`, form);
  }

  exportExcel(params: EmployeeQueryParams): Observable<Blob> {
    let httpParams = new HttpParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        httpParams = httpParams.set(key, val.toString());
      }
    });
    return this.http.get(`${this.apiUrl}/export/excel`, {
      params: httpParams,
      responseType: 'blob'
    });
  }
}

@Injectable({ providedIn: 'root' })
export class DepartmentService {
  private apiUrl = `${environment.apiUrl}/departments`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<ApiResponse<Department[]>> {
    return this.http.get<ApiResponse<Department[]>>(this.apiUrl);
  }

  getById(id: number): Observable<ApiResponse<Department>> {
    return this.http.get<ApiResponse<Department>>(`${this.apiUrl}/${id}`);
  }

  create(dto: CreateDepartmentDto): Observable<ApiResponse<Department>> {
    return this.http.post<ApiResponse<Department>>(this.apiUrl, dto);
  }

  update(id: number, dto: CreateDepartmentDto): Observable<ApiResponse<Department>> {
    return this.http.put<ApiResponse<Department>>(`${this.apiUrl}/${id}`, dto);
  }

  delete(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${id}`);
  }
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private snackBarSubject = new BehaviorSubject<{message: string; type: string; id: number} | null>(null);
  public notification$ = this.snackBarSubject.asObservable();
  private counter = 0;

  success(message: string): void {
    this.snackBarSubject.next({ message, type: 'success', id: ++this.counter });
    setTimeout(() => this.snackBarSubject.next(null), 4000);
  }

  error(message: string): void {
    this.snackBarSubject.next({ message, type: 'error', id: ++this.counter });
    setTimeout(() => this.snackBarSubject.next(null), 5000);
  }

  info(message: string): void {
    this.snackBarSubject.next({ message, type: 'info', id: ++this.counter });
    setTimeout(() => this.snackBarSubject.next(null), 3500);
  }

  warning(message: string): void {
    this.snackBarSubject.next({ message, type: 'warning', id: ++this.counter });
    setTimeout(() => this.snackBarSubject.next(null), 4000);
  }
}

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private isDarkMode = new BehaviorSubject<boolean>(false);
  isDarkMode$ = this.isDarkMode.asObservable();

  constructor() {
    const stored = localStorage.getItem('ems_dark_mode');
    if (stored === 'true') {
      this.isDarkMode.next(true);
      document.body.classList.add('dark-theme');
    }
  }

  toggleTheme(): void {
    const current = this.isDarkMode.value;
    this.isDarkMode.next(!current);
    document.body.classList.toggle('dark-theme', !current);
    localStorage.setItem('ems_dark_mode', (!current).toString());
  }

  get isDark(): boolean {
    return this.isDarkMode.value;
  }
}
