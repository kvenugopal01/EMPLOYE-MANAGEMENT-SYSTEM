import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { EmployeeService, DepartmentService, NotificationService } from '../../../core/services/services';
import { AuthService } from '../../../core/services/auth.service';
import { EmployeeListItem, Department, EmployeeQueryParams } from '../../../core/models/models';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="employee-list animate-in">
      <!-- Header -->
      <div class="section-header">
        <div>
          <h1 class="page-title">Employees</h1>
          <p class="page-subtitle">{{ totalCount }} employees in your organization</p>
        </div>
        <div class="section-actions">
          <button class="btn btn-secondary btn-sm" (click)="exportExcel()" title="Export to Excel">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Export
          </button>
          <a routerLink="/employees/add" class="btn btn-primary" *ngIf="isHR">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add Employee
          </a>
        </div>
      </div>

      <!-- Filters Bar -->
      <div class="filters-bar card">
        <div class="card-body" style="padding: 16px 20px">
          <div class="filters-row">
            <!-- Search -->
            <div class="search-bar">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input class="form-control" type="text" [(ngModel)]="searchQuery" 
                (ngModelChange)="onSearchChange($event)"
                placeholder="Search by name, email, or ID..."/>
            </div>

            <!-- Department Filter -->
            <select class="form-control filter-select" [(ngModel)]="query.departmentId" (change)="applyFilters()">
              <option [ngValue]="undefined">All Departments</option>
              <option *ngFor="let dept of departments" [value]="dept.id">{{ dept.name }}</option>
            </select>

            <!-- Status Filter -->
            <select class="form-control filter-select" [(ngModel)]="query.status" (change)="applyFilters()">
              <option value="">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="OnLeave">On Leave</option>
            </select>

            <!-- Employment Type -->
            <select class="form-control filter-select" [(ngModel)]="query.employmentType" (change)="applyFilters()">
              <option value="">All Types</option>
              <option value="FullTime">Full Time</option>
              <option value="PartTime">Part Time</option>
              <option value="Contract">Contract</option>
              <option value="Intern">Intern</option>
            </select>

            <button class="btn btn-secondary btn-sm" (click)="resetFilters()">Reset</button>
          </div>
        </div>
      </div>

      <!-- View Toggle -->
      <div style="display:flex;justify-content:flex-end;margin-bottom:16px">
        <div class="view-toggle">
          <button class="view-btn" [class.active]="viewMode === 'grid'" (click)="viewMode = 'grid'" title="Grid View">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
            </svg>
          </button>
          <button class="view-btn" [class.active]="viewMode === 'table'" (click)="viewMode = 'table'" title="Table View">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
              <line x1="8" y1="18" x2="21" y2="18"/>
              <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/>
              <line x1="3" y1="18" x2="3.01" y2="18"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Loading -->
      <div class="loading-container" *ngIf="loading">
        <div class="spinner"></div>
        <p style="color:var(--text-muted)">Loading employees...</p>
      </div>

      <!-- Empty State -->
      <div class="empty-state" *ngIf="!loading && employees.length === 0">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
        <h3>No employees found</h3>
        <p>Try adjusting your search or filters</p>
        <a routerLink="/employees/add" class="btn btn-primary" *ngIf="isHR">Add First Employee</a>
      </div>

      <!-- GRID VIEW -->
      <div class="grid-3" *ngIf="!loading && employees.length > 0 && viewMode === 'grid'">
        <div class="emp-card" *ngFor="let emp of employees" 
          [routerLink]="['/employees', emp.id]">
          <div class="emp-card-avatar">
            <img *ngIf="emp.profilePhotoUrl" [src]="emp.profilePhotoUrl" [alt]="emp.fullName" 
              (error)="onImageError($event, emp)">
            <span *ngIf="!emp.profilePhotoUrl">{{ getInitials(emp.fullName) }}</span>
          </div>
          <div class="emp-card-name">{{ emp.fullName }}</div>
          <div class="emp-card-role">{{ emp.designation }}</div>
          <div class="emp-card-dept">{{ emp.departmentName || 'No Department' }}</div>
          <span class="badge" [class]="getStatusBadgeClass(emp.status)" style="margin-bottom:16px">{{ emp.status }}</span>
          <div class="emp-card-actions" (click)="$event.stopPropagation()">
            <button class="btn btn-sm btn-secondary" [routerLink]="['/employees', emp.id]" title="View">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            </button>
            <button class="btn btn-sm btn-secondary" [routerLink]="['/employees', emp.id, 'edit']" title="Edit" *ngIf="isHR">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
            <button class="btn btn-sm btn-danger" (click)="archiveEmployee(emp)" title="Archive" *ngIf="isHR">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="21 8 21 21 3 21 3 8"/>
                <rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- TABLE VIEW -->
      <div class="card" *ngIf="!loading && employees.length > 0 && viewMode === 'table'">
        <div class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th (click)="sort('FullName')">
                  Employee
                  <svg *ngIf="query.sortBy === 'FullName'" [style.transform]="query.sortOrder === 'desc' ? 'rotate(180deg)' : ''"
                    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12">
                    <polyline points="18 15 12 9 6 15"/>
                  </svg>
                </th>
                <th>Department</th>
                <th (click)="sort('designation')">Designation</th>
                <th>Type</th>
                <th>Location</th>
                <th (click)="sort('JoiningDate')">Joined</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let emp of employees">
                <td>
                  <div style="display:flex;align-items:center;gap:12px">
                    <div class="emp-avatar">
                      <img *ngIf="emp.profilePhotoUrl" [src]="emp.profilePhotoUrl" [alt]="emp.fullName" (error)="onImageError($event, emp)">
                      <span *ngIf="!emp.profilePhotoUrl">{{ getInitials(emp.fullName) }}</span>
                    </div>
                    <div>
                      <div style="font-weight:600;color:var(--text-primary)">{{ emp.fullName }}</div>
                      <div style="font-size:12px;color:var(--text-muted)">{{ emp.employeeCode }} · {{ emp.email }}</div>
                    </div>
                  </div>
                </td>
                <td>{{ emp.departmentName || '—' }}</td>
                <td>{{ emp.designation }}</td>
                <td>
                  <span class="type-badge" [attr.data-type]="emp.employmentType">{{ emp.employmentType }}</span>
                </td>
                <td>{{ emp.workLocation || '—' }}</td>
                <td style="color:var(--text-muted)">{{ emp.joiningDate | date:'MMM d, yyyy' }}</td>
                <td><span class="badge" [class]="getStatusBadgeClass(emp.status)">{{ emp.status }}</span></td>
                <td>
                  <div style="display:flex;gap:6px">
                    <button class="btn btn-icon btn-sm btn-secondary" [routerLink]="['/employees', emp.id]" title="View">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    </button>
                    <button class="btn btn-icon btn-sm btn-secondary" [routerLink]="['/employees', emp.id, 'edit']" title="Edit" *ngIf="isHR">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </button>
                    <button class="btn btn-icon btn-sm btn-danger" (click)="archiveEmployee(emp)" title="Archive" *ngIf="isHR">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="21 8 21 21 3 21 3 8"/>
                        <rect x="1" y="3" width="22" height="5"/>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div style="display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-top:1px solid var(--border-color)">
          <span style="font-size:13px;color:var(--text-muted)">
            Showing {{ startRecord }}–{{ endRecord }} of {{ totalCount }} employees
          </span>
          <div class="pagination">
            <button class="page-btn" [disabled]="query.page === 1" (click)="changePage(query.page! - 1)">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <button class="page-btn" *ngFor="let p of pages" [class.active]="p === query.page" (click)="changePage(p)">{{ p }}</button>
            <button class="page-btn" [disabled]="query.page === totalPages" (click)="changePage(query.page! + 1)">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
          <select class="form-control" style="width:auto" [(ngModel)]="query.pageSize" (change)="applyFilters()">
            <option [value]="10">10 per page</option>
            <option [value]="25">25 per page</option>
            <option [value]="50">50 per page</option>
          </select>
        </div>
      </div>

      <!-- Archive Confirm Modal -->
      <div class="overlay" *ngIf="showArchiveConfirm" (click)="showArchiveConfirm = false">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3 style="font-size:18px;font-weight:600;color:var(--text-primary)">Archive Employee</h3>
            <button (click)="showArchiveConfirm = false" style="background:none;border:none;cursor:pointer;color:var(--text-muted)">✕</button>
          </div>
          <div class="modal-body">
            <div style="display:flex;align-items:center;gap:16px;padding:16px;background:rgba(245,158,11,0.1);border-radius:12px;border:1px solid rgba(245,158,11,0.2)">
              <svg style="color:#f59e0b;flex-shrink:0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="24" height="24">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              <p style="font-size:14px;color:var(--text-secondary)">
                Are you sure you want to archive <strong>{{ selectedEmployee?.fullName }}</strong>? 
                The employee will be moved to the archive and can be restored later.
              </p>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="showArchiveConfirm = false">Cancel</button>
            <button class="btn btn-danger" (click)="confirmArchive()" [disabled]="archiving">
              <span *ngIf="!archiving">Archive Employee</span>
              <span *ngIf="archiving">Archiving...</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .employee-list { max-width: 1400px; }
    .filters-bar { margin-bottom: 16px; }
    .filters-row { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
    .filter-select { width: auto; min-width: 150px; }
    
    .type-badge {
      display: inline-block;
      padding: 3px 10px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 500;
      background: var(--bg-primary);
      border: 1px solid var(--border-color);
      color: var(--text-secondary);
    }
    .type-badge[data-type="FullTime"] { background: rgba(16,185,129,0.1); color: #10b981; border-color: rgba(16,185,129,0.2); }
    .type-badge[data-type="Contract"] { background: rgba(245,158,11,0.1); color: #f59e0b; border-color: rgba(245,158,11,0.2); }
    .type-badge[data-type="Intern"] { background: rgba(6,182,212,0.1); color: #06b6d4; border-color: rgba(6,182,212,0.2); }
    .type-badge[data-type="PartTime"] { background: rgba(139,92,246,0.1); color: #8b5cf6; border-color: rgba(139,92,246,0.2); }
  `]
})
export class EmployeeListComponent implements OnInit, OnDestroy {
  employees: EmployeeListItem[] = [];
  departments: Department[] = [];
  loading = true;
  viewMode: 'grid' | 'table' = 'table';
  totalCount = 0;
  totalPages = 0;
  searchQuery = '';
  showArchiveConfirm = false;
  selectedEmployee: EmployeeListItem | null = null;
  archiving = false;
  
  query: EmployeeQueryParams = {
    page: 1, pageSize: 10, sortBy: 'FullName', sortOrder: 'asc'
  };

  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(
    private employeeService: EmployeeService,
    private deptService: DepartmentService,
    private authService: AuthService,
    private notifService: NotificationService
  ) {}

  get isHR(): boolean { return this.authService.isHR(); }

  get pages(): number[] {
    const total = this.totalPages;
    const current = this.query.page!;
    const pages = [];
    for (let i = Math.max(1, current - 2); i <= Math.min(total, current + 2); i++) {
      pages.push(i);
    }
    return pages;
  }

  get startRecord(): number {
    if (this.totalCount === 0) return 0;
    return (this.query.page! - 1) * this.query.pageSize! + 1;
  }

  get endRecord(): number {
    return Math.min(this.query.page! * this.query.pageSize!, this.totalCount);
  }

  ngOnInit(): void {
    this.loadDepartments();
    this.loadEmployees();
    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(val => {
      this.query.search = val;
      this.query.page = 1;
      this.loadEmployees();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadDepartments(): void {
    this.deptService.getAll().subscribe(res => {
      if (res.success) this.departments = res.data!;
    });
  }

  loadEmployees(): void {
    this.loading = true;
    this.employeeService.getAll(this.query).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.employees = res.data.data;
          this.totalCount = res.data.totalCount;
          this.totalPages = res.data.totalPages;
        }
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  onSearchChange(val: string): void { this.searchSubject.next(val); }
  applyFilters(): void { this.query.page = 1; this.loadEmployees(); }
  resetFilters(): void {
    this.query = { page: 1, pageSize: 10, sortBy: 'FullName', sortOrder: 'asc' };
    this.searchQuery = '';
    this.loadEmployees();
  }
  sort(field: string): void {
    if (this.query.sortBy === field) {
      this.query.sortOrder = this.query.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.query.sortBy = field;
      this.query.sortOrder = 'asc';
    }
    this.loadEmployees();
  }
  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.query.page = page;
    this.loadEmployees();
  }

  archiveEmployee(emp: EmployeeListItem): void {
    this.selectedEmployee = emp;
    this.showArchiveConfirm = true;
  }

  confirmArchive(): void {
    if (!this.selectedEmployee) return;
    this.archiving = true;
    this.employeeService.archive(this.selectedEmployee.id).subscribe({
      next: () => {
        this.notifService.success(`${this.selectedEmployee!.fullName} has been archived`);
        this.showArchiveConfirm = false;
        this.archiving = false;
        this.loadEmployees();
      },
      error: () => {
        this.notifService.error('Failed to archive employee');
        this.archiving = false;
      }
    });
  }

  exportExcel(): void {
    this.employeeService.exportExcel(this.query).subscribe(blob => {
      saveAs(blob, `employees_${new Date().toISOString().split('T')[0]}.xlsx`);
    });
  }

  getInitials(name: string): string {
    if (!name) return 'EE';
    const parts = name.split(' ');
    return (parts[0]?.charAt(0) + (parts[1]?.charAt(0) || '')).toUpperCase();
  }

  getStatusBadgeClass(status: string): string {
    const map: Record<string, string> = {
      'Active': 'badge-active', 'Inactive': 'badge-inactive',
      'OnLeave': 'badge-on-leave', 'Archived': 'badge-archived', 'Terminated': 'badge-terminated'
    };
    return map[status] || 'badge-inactive';
  }

  onImageError(event: any, emp: EmployeeListItem): void {
    emp.profilePhotoUrl = undefined;
  }
}
