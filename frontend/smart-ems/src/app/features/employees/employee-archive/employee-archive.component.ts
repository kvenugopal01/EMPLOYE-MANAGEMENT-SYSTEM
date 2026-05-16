import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { EmployeeService, NotificationService } from '../../../core/services/services';
import { Employee } from '../../../core/models/models';

@Component({
  selector: 'app-employee-archive',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="animate-in">
      <div class="section-header">
        <div>
          <h1 class="page-title">Employee Archive</h1>
          <p class="page-subtitle">{{ archived.length }} archived employees — restore or permanently review</p>
        </div>
        <a routerLink="/employees" class="btn btn-secondary btn-sm">← Back to Employees</a>
      </div>

      <div class="loading-container" *ngIf="loading"><div class="spinner"></div></div>

      <div class="empty-state" *ngIf="!loading && archived.length === 0">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/>
        </svg>
        <h3>Archive is empty</h3>
        <p>No archived employees found</p>
      </div>

      <div class="card" *ngIf="!loading && archived.length > 0">
        <div class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Department</th>
                <th>Designation</th>
                <th>Archived On</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let emp of archived">
                <td>
                  <div style="display:flex;align-items:center;gap:12px">
                    <div class="emp-avatar" style="background:var(--bg-tertiary);color:var(--text-muted)">
                      {{ getInitials(emp.fullName) }}
                    </div>
                    <div>
                      <div style="font-weight:600;color:var(--text-primary)">{{ emp.fullName }}</div>
                      <div style="font-size:12px;color:var(--text-muted)">{{ emp.employeeCode }} · {{ emp.email }}</div>
                    </div>
                  </div>
                </td>
                <td>{{ emp.departmentName || '—' }}</td>
                <td>{{ emp.designation }}</td>
                <td>{{ emp.updatedAt | date:'MMM d, yyyy' }}</td>
                <td>
                  <button class="btn btn-primary btn-sm" (click)="restore(emp)" [disabled]="restoringId === emp.id">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="1 4 1 10 7 10"/>
                      <path d="M3.51 15a9 9 0 1 0 .49-3.51"/>
                    </svg>
                    {{ restoringId === emp.id ? 'Restoring...' : 'Restore' }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class EmployeeArchiveComponent implements OnInit {
  archived: Employee[] = [];
  loading = true;
  restoringId: number | null = null;

  constructor(
    private employeeService: EmployeeService,
    private notifService: NotificationService
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.employeeService.getArchived().subscribe({
      next: (res) => { if (res.success) this.archived = res.data!; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  restore(emp: Employee): void {
    this.restoringId = emp.id;
    this.employeeService.restore(emp.id).subscribe({
      next: (res) => {
        this.restoringId = null;
        if (res.success) {
          this.notifService.success(`${emp.fullName} has been restored`);
          this.load();
        }
      },
      error: () => { 
        this.restoringId = null; 
        this.notifService.error('Failed to restore employee'); 
      }
    });
  }

  getInitials(name: string): string {
    if (!name) return 'EE';
    const p = name.split(' ');
    return (p[0]?.charAt(0) + (p[1]?.charAt(0) || '')).toUpperCase();
  }
}
