import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { EmployeeService } from '../../core/services/services';
import { DashboardStats } from '../../core/models/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dashboard animate-in">
      <!-- Page Header -->
      <div class="section-header">
        <div>
          <h1 class="page-title">Dashboard</h1>
          <p class="page-subtitle">Welcome back! Here's what's happening in your organization.</p>
        </div>
        <div class="section-actions">
          <span class="date-badge">{{ today | date:'EEEE, MMMM d, yyyy' }}</span>
        </div>
      </div>

      <!-- Loading Skeleton -->
      <div class="grid-4" *ngIf="loading">
        <div class="stat-card" *ngFor="let i of [1,2,3,4]">
          <div class="skeleton stat-icon"></div>
          <div class="stat-info">
            <div class="skeleton" style="height:28px;width:60px;margin-bottom:8px"></div>
            <div class="skeleton" style="height:14px;width:120px"></div>
          </div>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="grid-4" *ngIf="!loading && stats">
        <div class="stat-card">
          <div class="stat-icon" style="background: rgba(99,102,241,0.1)">
            <svg style="color:#6366f1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.totalEmployees }}</div>
            <div class="stat-label">Total Employees</div>
            <div class="stat-change up">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><polyline points="18 15 12 9 6 15"/></svg>
              {{ stats.newHiresThisMonth }} new this month
            </div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="background: rgba(16,185,129,0.1)">
            <svg style="color:#10b981" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.activeEmployees }}</div>
            <div class="stat-label">Active Employees</div>
            <div class="stat-change up">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><polyline points="18 15 12 9 6 15"/></svg>
              {{ ((stats.activeEmployees / stats.totalEmployees) * 100 | number:'1.0-0') }}% active rate
            </div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="background: rgba(245,158,11,0.1)">
            <svg style="color:#f59e0b" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
            </svg>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.totalDepartments }}</div>
            <div class="stat-label">Departments</div>
            <div class="stat-change up">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><circle cx="12" cy="12" r="10"/></svg>
              Across all locations
            </div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="background: rgba(6,182,212,0.1)">
            <svg style="color:#06b6d4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stats.employeesOnLeave }}</div>
            <div class="stat-label">On Leave</div>
            <div class="stat-change">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><circle cx="12" cy="12" r="10"/></svg>
              Currently on leave
            </div>
          </div>
        </div>
      </div>

      <!-- Charts Section -->
      <div class="grid-2" style="margin-top: 24px" *ngIf="!loading && stats">
        <!-- Department Distribution -->
        <div class="card">
          <div class="card-header">
            <h3 style="font-size:16px;font-weight:600;color:var(--text-primary)">Employees by Department</h3>
            <span style="font-size:12px;color:var(--text-muted)">Current headcount</span>
          </div>
          <div class="card-body">
            <div class="dept-chart">
              <div class="dept-bar-item" *ngFor="let dept of stats.employeesByDepartment; let i = index">
                <div class="dept-bar-label">{{ dept.department }}</div>
                <div class="dept-bar-track">
                  <div class="dept-bar-fill" 
                    [style.width.%]="(dept.count / maxDeptCount) * 100"
                    [style.background]="chartColors[i % chartColors.length]">
                  </div>
                </div>
                <span class="dept-bar-count">{{ dept.count }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Gender & Status Distribution -->
        <div class="card">
          <div class="card-header">
            <h3 style="font-size:16px;font-weight:600;color:var(--text-primary)">Workforce Overview</h3>
            <span style="font-size:12px;color:var(--text-muted)">Demographics</span>
          </div>
          <div class="card-body">
            <div class="overview-grid">
              <div>
                <p style="font-size:12px;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:16px">Gender Distribution</p>
                <div class="donut-chart">
                  <div class="donut-visual">
                    <svg viewBox="0 0 100 100" width="100" height="100">
                      <circle cx="50" cy="50" r="40" fill="none" stroke="var(--border-color)" stroke-width="12"/>
                      <circle *ngFor="let g of genderArcs; let i = index"
                        cx="50" cy="50" r="40" fill="none"
                        [attr.stroke]="g.color"
                        stroke-width="12"
                        stroke-dasharray="251.2"
                        [attr.stroke-dashoffset]="g.offset"
                        [attr.transform]="g.transform"
                        style="transition: stroke-dashoffset 1s ease"/>
                    </svg>
                    <div class="donut-center">
                      <span style="font-size:20px;font-weight:700">{{ stats.totalEmployees }}</span>
                      <span style="font-size:11px;color:var(--text-muted)">Total</span>
                    </div>
                  </div>
                  <div class="donut-legend">
                    <div class="legend-item" *ngFor="let g of stats.genderDistribution; let i = index">
                      <span class="legend-dot" [style.background]="genderColors[i]"></span>
                      <span>{{ g.gender }}</span>
                      <span class="legend-count">{{ g.count }}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <p style="font-size:12px;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:16px">Status Breakdown</p>
                <div class="status-list">
                  <div class="status-row" *ngFor="let s of stats.statusDistribution">
                    <span class="badge" [class]="getStatusBadgeClass(s.status)">{{ s.status }}</span>
                    <div class="status-bar-track">
                      <div class="status-bar-fill" 
                        [style.width.%]="(s.count / stats.totalEmployees) * 100"
                        [class]="getStatusBarClass(s.status)">
                      </div>
                    </div>
                    <span style="font-size:13px;font-weight:600">{{ s.count }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Monthly Hiring Trend -->
      <div class="card" style="margin-top:24px" *ngIf="!loading && stats">
        <div class="card-header">
          <h3 style="font-size:16px;font-weight:600;color:var(--text-primary)">Monthly Hiring Trend</h3>
          <span style="font-size:12px;color:var(--text-muted)">Last 12 months</span>
        </div>
        <div class="card-body">
          <div class="bar-chart">
            <div class="bar-item" *ngFor="let m of stats.monthlyHiring">
              <div class="bar-wrapper">
                <div class="bar-fill" 
                  [style.height.%]="(m.count / maxMonthlyCount) * 100"
                  [title]="m.count + ' hires'">
                </div>
              </div>
              <span class="bar-label">{{ formatMonth(m.month) }}</span>
              <span class="bar-value">{{ m.count }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Recently Joined -->
      <div class="card" style="margin-top:24px" *ngIf="!loading && stats">
        <div class="card-header">
          <h3 style="font-size:16px;font-weight:600;color:var(--text-primary)">Recently Joined</h3>
          <a routerLink="/employees" class="btn btn-sm btn-secondary">View All</a>
        </div>
        <div class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Department</th>
                <th>Designation</th>
                <th>Joining Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let emp of stats.recentlyJoined" [routerLink]="['/employees', emp.id]" style="cursor:pointer">
                <td>
                  <div style="display:flex;align-items:center;gap:12px">
                    <div class="emp-avatar" style="width:36px;height:36px;font-size:13px">
                      {{ getTableInitials(emp.fullName) }}
                    </div>
                    <div>
                      <div style="font-weight:600;color:var(--text-primary);font-size:14px">{{ emp.fullName }}</div>
                      <div style="font-size:12px;color:var(--text-muted)">{{ emp.employeeCode }}</div>
                    </div>
                  </div>
                </td>
                <td>{{ emp.departmentName || '—' }}</td>
                <td>{{ emp.designation }}</td>
                <td>{{ emp.joiningDate | date:'MMM d, yyyy' }}</td>
                <td><span class="badge" [class]="getStatusBadgeClass(emp.status)">{{ emp.status }}</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard { max-width: 1400px; }

    .date-badge {
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 8px 14px;
      font-size: 13px;
      color: var(--text-muted);
    }

    .dept-chart { display: flex; flex-direction: column; gap: 14px; }
    .dept-bar-item { display: flex; align-items: center; gap: 12px; }
    .dept-bar-label { font-size: 13px; color: var(--text-secondary); width: 120px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex-shrink: 0; }
    .dept-bar-track { flex: 1; height: 8px; background: var(--bg-primary); border-radius: 10px; overflow: hidden; }
    .dept-bar-fill { height: 100%; border-radius: 10px; transition: width 1s ease; }
    .dept-bar-count { font-size: 13px; font-weight: 600; color: var(--text-primary); width: 30px; text-align: right; flex-shrink: 0; }

    .overview-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
    @media (max-width: 600px) { .overview-grid { grid-template-columns: 1fr; } }

    .donut-chart { display: flex; align-items: center; gap: 20px; }
    .donut-visual { position: relative; }
    .donut-center {
      position: absolute; inset: 0;
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      font-weight: 700;
    }
    .donut-legend { display: flex; flex-direction: column; gap: 8px; }
    .legend-item { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--text-secondary); }
    .legend-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
    .legend-count { margin-left: auto; font-weight: 600; color: var(--text-primary); }

    .status-list { display: flex; flex-direction: column; gap: 12px; }
    .status-row { display: flex; align-items: center; gap: 10px; }
    .status-bar-track { flex: 1; height: 6px; background: var(--bg-primary); border-radius: 10px; overflow: hidden; }
    .status-bar-fill { height: 100%; border-radius: 10px; transition: width 1s ease; }
    .status-bar-active { background: #10b981; }
    .status-bar-onleave { background: #f59e0b; }
    .status-bar-inactive { background: #ef4444; }
    .status-bar-archived { background: #64748b; }

    .bar-chart {
      display: flex;
      align-items: flex-end;
      gap: 12px;
      height: 160px;
      padding: 0 8px;
    }
    .bar-item { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px; height: 100%; }
    .bar-wrapper { flex: 1; width: 100%; display: flex; align-items: flex-end; }
    .bar-fill {
      width: 100%;
      background: linear-gradient(180deg, #6366f1, #8b5cf6);
      border-radius: 6px 6px 0 0;
      min-height: 4px;
      transition: height 0.8s cubic-bezier(0.4,0,0.2,1);
    }
    .bar-label { font-size: 10px; color: var(--text-muted); white-space: nowrap; }
    .bar-value { font-size: 11px; font-weight: 600; color: var(--text-secondary); }
  `]
})
export class DashboardComponent implements OnInit {
  stats: DashboardStats | null = null;
  loading = true;
  today = new Date();

  chartColors = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];
  genderColors = ['#6366f1', '#f472b6', '#94a3b8'];

  get maxDeptCount(): number {
    return Math.max(...(this.stats?.employeesByDepartment.map(d => d.count) ?? [1]));
  }
  get maxMonthlyCount(): number {
    return Math.max(...(this.stats?.monthlyHiring.map(m => m.count) ?? [1]));
  }

  get genderArcs() {
    if (!this.stats) return [];
    const total = this.stats.totalEmployees || 1;
    const circumference = 2 * Math.PI * 40; // r=40
    let offset = 0;
    return this.stats.genderDistribution.map((g, i) => {
      const pct = g.count / total;
      const arc = { 
        color: this.genderColors[i],
        offset: circumference * (1 - pct),
        transform: `rotate(${-90 + offset * 360}deg, 50, 50)`
      };
      offset += pct;
      return arc;
    });
  }

  constructor(private employeeService: EmployeeService) {}

  ngOnInit(): void {
    this.employeeService.getDashboard().subscribe({
      next: (res) => {
        if (res.success) this.stats = res.data!;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  getStatusBadgeClass(status: string): string {
    const map: Record<string, string> = {
      'Active': 'badge-active', 'Inactive': 'badge-inactive',
      'OnLeave': 'badge-on-leave', 'Archived': 'badge-archived', 'Terminated': 'badge-terminated'
    };
    return map[status] || 'badge-inactive';
  }

  getStatusBarClass(status: string): string {
    const map: Record<string, string> = {
      'Active': 'status-bar-active', 'OnLeave': 'status-bar-onleave',
      'Inactive': 'status-bar-inactive', 'Archived': 'status-bar-archived'
    };
    return map[status] || 'status-bar-inactive';
  }

  formatMonth(m: string): string {
    const [y, mo] = m.split('-');
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return months[parseInt(mo) - 1] ?? mo;
  }

  getTableInitials(name: string): string {
    const parts = name.split(' ');
    return (parts[0].charAt(0) + (parts.length > 1 ? parts[1].charAt(0) : '')).toUpperCase();
  }
}
