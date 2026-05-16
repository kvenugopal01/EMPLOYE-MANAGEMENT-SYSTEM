import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { EmployeeService, NotificationService } from '../../../core/services/services';
import { AuthService } from '../../../core/services/auth.service';
import { Employee, Activity, AttendanceSummary } from '../../../core/models/models';

@Component({
  selector: 'app-employee-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="animate-in">

      <!-- Header always visible -->
      <div class="section-header">
        <button class="btn btn-secondary btn-sm" (click)="router.navigate(['/employees'])">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
          Back
        </button>
        <div class="section-actions" *ngIf="isHR && employee">
          <a [routerLink]="['/employees', employee.id, 'edit']" class="btn btn-secondary btn-sm">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            Edit
          </a>
          <button class="btn btn-danger btn-sm" (click)="showArchiveModal = true">Archive</button>
        </div>
      </div>

      <!-- Loading Skeleton -->
      <div class="profile-grid" *ngIf="loading">
        <div class="card"><div class="card-body" style="padding:32px;text-align:center">
          <div class="skeleton-circle" style="width:100px;height:100px;margin:0 auto 16px"></div>
          <div class="skeleton" style="width:60%;height:20px;margin:0 auto 8px"></div>
          <div class="skeleton" style="width:40%;height:14px;margin:0 auto"></div>
        </div></div>
        <div style="display:flex;flex-direction:column;gap:16px">
          <div class="card"><div class="card-body">
            <div class="skeleton" style="height:16px;width:40%;margin-bottom:20px"></div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
              <div *ngFor="let i of [1,2,3,4]">
                <div class="skeleton" style="height:11px;width:50%;margin-bottom:6px"></div>
                <div class="skeleton" style="height:14px;width:80%"></div>
              </div>
            </div>
          </div></div>
        </div>
      </div>

      <!-- Not Found State -->
      <div class="empty-state" *ngIf="!loading && !employee">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <h3>Employee Not Found</h3>
        <p>This employee may have been archived or doesn't exist</p>
        <button class="btn btn-primary" (click)="router.navigate(['/employees'])">Go Back</button>
      </div>

      <!-- Profile Content -->
      <div class="profile-grid" *ngIf="!loading && employee">
        <!-- Left: Profile Card -->
        <div>
          <div class="card profile-card">
            <div class="card-body" style="text-align:center;padding:32px">
              <div class="profile-photo">
                <img *ngIf="employee.profilePhotoUrl" [src]="employee.profilePhotoUrl" [alt]="employee.fullName"
                  (error)="employee.profilePhotoUrl = undefined">
                <span *ngIf="!employee.profilePhotoUrl">{{ getInitials(employee.fullName) }}</span>
              </div>
              <h2 class="profile-name">{{ employee.fullName }}</h2>
              <p class="profile-desig">{{ employee.designation }}</p>
              <span class="badge" [class]="getStatusBadgeClass(employee.status)" style="margin:8px auto 16px;display:inline-block">{{ employee.status }}</span>
              
              <div class="dept-tag" *ngIf="employee.departmentName">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                </svg>
                {{ employee.departmentName }}
              </div>

              <!-- Profile Completion -->
              <div style="margin-top:20px;text-align:left">
                <div style="display:flex;justify-content:space-between;margin-bottom:6px">
                  <span style="font-size:12px;color:var(--text-muted)">Profile Completion</span>
                  <span style="font-size:12px;font-weight:700;color:var(--accent-color)">{{ employee.profileCompletion }}%</span>
                </div>
                <div class="progress-bar">
                  <div class="progress-fill" [style.width.%]="employee.profileCompletion"
                    [style.background]="employee.profileCompletion >= 80 ? 'var(--success-color)' : employee.profileCompletion >= 50 ? 'var(--warning-color)' : 'var(--danger-color)'">
                  </div>
                </div>
              </div>

              <!-- Employee ID Card -->
              <div class="id-card">
                <div style="font-size:10px;color:var(--text-muted);text-transform:uppercase;letter-spacing:1px">Employee ID</div>
                <div style="font-size:20px;font-weight:700;color:var(--accent-color);font-family:monospace">{{ employee.employeeCode }}</div>
                <div style="font-size:11px;color:var(--text-muted)">Joined {{ employee.joiningDate | date:'MMM d, yyyy' }}</div>
              </div>

              <!-- Quick Stats -->
              <div class="quick-stats">
                <div class="quick-stat">
                  <span class="qs-value">{{ employee.yearsOfExperience }}</span>
                  <span class="qs-label">Years Exp.</span>
                </div>
                <div class="quick-stat-divider"></div>
                <div class="quick-stat">
                  <span class="qs-value">{{ employee.employmentType }}</span>
                  <span class="qs-label">Type</span>
                </div>
                <div class="quick-stat-divider"></div>
                <div class="quick-stat">
                  <span class="qs-value">{{ employee.role }}</span>
                  <span class="qs-label">Role</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Attendance Summary -->
          <div class="card" style="margin-top:16px" *ngIf="attendance">
            <div class="card-header">
              <h4 style="font-size:15px;font-weight:600">This Month's Attendance</h4>
              <span style="font-size:12px;color:var(--text-muted)">{{ currentMonthYear }}</span>
            </div>
            <div class="card-body">
              <div class="attendance-grid">
                <div class="att-item green">
                  <span class="att-value">{{ attendance.presentDays }}</span>
                  <span class="att-label">Present</span>
                </div>
                <div class="att-item yellow">
                  <span class="att-value">{{ attendance.leaveDays }}</span>
                  <span class="att-label">Leave</span>
                </div>
                <div class="att-item red">
                  <span class="att-value">{{ attendance.absentDays }}</span>
                  <span class="att-label">Absent</span>
                </div>
                <div class="att-item blue">
                  <span class="att-value">{{ attendance.attendancePercentage }}%</span>
                  <span class="att-label">Rate</span>
                </div>
              </div>
              <div class="att-progress">
                <div class="att-progress-fill" [style.width.%]="attendance.attendancePercentage"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right: Details -->
        <div style="display:flex;flex-direction:column;gap:16px">
          <!-- Personal Info -->
          <div class="card">
            <div class="card-header">
              <h4 style="font-size:15px;font-weight:600">Personal Information</h4>
            </div>
            <div class="card-body">
              <div class="info-grid">
                <div class="info-item">
                  <span class="info-label">Email</span>
                  <span class="info-value">{{ employee.email }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Phone</span>
                  <span class="info-value">{{ employee.phone }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Gender</span>
                  <span class="info-value">{{ employee.gender }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Date of Birth</span>
                  <span class="info-value">{{ employee.dateOfBirth | date:'MMMM d, yyyy' }}</span>
                </div>
                <div class="info-item" style="grid-column:1/-1">
                  <span class="info-label">Address</span>
                  <span class="info-value">{{ employee.address }}</span>
                </div>
                <div class="info-item" *ngIf="employee.emergencyContact" style="grid-column:1/-1">
                  <span class="info-label">Emergency Contact</span>
                  <span class="info-value">{{ employee.emergencyContact }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Professional Info -->
          <div class="card">
            <div class="card-header">
              <h4 style="font-size:15px;font-weight:600">Professional Information</h4>
            </div>
            <div class="card-body">
              <div class="info-grid">
                <div class="info-item">
                  <span class="info-label">Employment Type</span>
                  <span class="info-value">{{ employee.employmentType }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Work Location</span>
                  <span class="info-value">{{ employee.workLocation || '—' }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Reporting Manager</span>
                  <span class="info-value">{{ employee.reportingManagerName || '—' }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Shift</span>
                  <span class="info-value">{{ employee.shiftDetails || '—' }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Annual Salary</span>
                  <span class="info-value salary">₹{{ employee.salary | number:'1.0-0' }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Experience</span>
                  <span class="info-value">{{ employee.yearsOfExperience }} {{ employee.yearsOfExperience === 1 ? 'year' : 'years' }}</span>
                </div>
                <div class="info-item" style="grid-column:1/-1" *ngIf="employee.skills">
                  <span class="info-label">Skills</span>
                  <div class="skills-list">
                    <span class="skill-tag" *ngFor="let s of getSkills(employee.skills)">{{ s }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Activity Timeline -->
          <div class="card">
            <div class="card-header">
              <h4 style="font-size:15px;font-weight:600">Activity Timeline</h4>
              <span style="font-size:12px;color:var(--text-muted)">{{ activities.length }} events</span>
            </div>
            <div class="card-body">
              <div class="timeline" *ngIf="activities.length > 0">
                <div class="timeline-item" *ngFor="let a of activities">
                  <div class="timeline-dot" [style.background]="getActivityColor(a.activityType)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" width="10" height="10">
                      <polyline *ngIf="a.activityType === 'Created'" points="20 6 9 17 4 12"/>
                      <path *ngIf="a.activityType === 'Updated'" d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <polyline *ngIf="a.activityType === 'Archived'" points="21 8 21 21 3 21 3 8"/>
                      <polyline *ngIf="a.activityType === 'Restored'" points="1 4 1 10 7 10"/>
                    </svg>
                  </div>
                  <div class="timeline-content">
                    <div class="timeline-title">{{ a.description }}</div>
                    <div class="timeline-meta">
                      {{ a.createdAt | date:'MMM d, yyyy · h:mm a' }}
                      <span *ngIf="a.performedBy"> · by {{ a.performedBy }}</span>
                    </div>
                    <div class="timeline-change" *ngIf="a.oldValue && a.newValue">
                      <span class="change-from">{{ a.oldValue }}</span>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12">
                        <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                      </svg>
                      <span class="change-to">{{ a.newValue }}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div class="empty-state" *ngIf="activities.length === 0" style="padding:24px">
                <p>No activity recorded yet</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Archive Confirmation Modal (replaces browser confirm()) -->
      <div class="overlay" *ngIf="showArchiveModal" (click)="showArchiveModal = false">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3 style="font-size:18px;font-weight:600;color:var(--text-primary)">Archive Employee</h3>
            <button (click)="showArchiveModal = false" style="background:none;border:none;cursor:pointer;color:var(--text-muted);font-size:18px">✕</button>
          </div>
          <div class="modal-body">
            <div style="display:flex;align-items:center;gap:16px;padding:16px;background:rgba(245,158,11,0.1);border-radius:12px;border:1px solid rgba(245,158,11,0.2)">
              <svg style="color:#f59e0b;flex-shrink:0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="24" height="24">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              <p style="font-size:14px;color:var(--text-secondary);margin:0">
                Are you sure you want to archive <strong>{{ employee?.fullName }}</strong>? 
                The employee will be moved to the archive and can be restored later.
              </p>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="showArchiveModal = false">Cancel</button>
            <button class="btn btn-danger" (click)="doArchive()" [disabled]="archiving">
              {{ archiving ? 'Archiving...' : 'Archive Employee' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .profile-grid { display: grid; grid-template-columns: 300px 1fr; gap: 20px; align-items: start; }
    @media (max-width: 900px) { .profile-grid { grid-template-columns: 1fr; } }

    /* Skeleton loaders */
    .skeleton { background: linear-gradient(90deg, var(--border-color) 25%, var(--hover-bg) 50%, var(--border-color) 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 6px; }
    .skeleton-circle { background: linear-gradient(90deg, var(--border-color) 25%, var(--hover-bg) 50%, var(--border-color) 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 50%; }
    @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }

    .profile-photo {
      width: 100px; height: 100px;
      border-radius: 50%;
      margin: 0 auto 16px;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      color: white; font-size: 32px; font-weight: 700;
      display: flex; align-items: center; justify-content: center;
      overflow: hidden; border: 3px solid rgba(99,102,241,0.2);
    }
    .profile-photo img { width: 100%; height: 100%; object-fit: cover; }
    .profile-name { font-size: 20px; font-weight: 700; color: var(--text-primary); margin-bottom: 4px; }
    .profile-desig { font-size: 14px; color: var(--text-muted); margin-bottom: 12px; }
    .dept-tag {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 6px 12px;
      background: var(--accent-light); color: var(--accent-color);
      border-radius: 8px; font-size: 13px; font-weight: 500;
    }

    .id-card {
      margin-top: 20px;
      padding: 16px;
      background: linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.08));
      border: 1px solid rgba(99,102,241,0.2);
      border-radius: 12px;
    }

    .quick-stats {
      display: flex; align-items: center; justify-content: space-around;
      margin-top: 20px; padding: 16px 0; border-top: 1px solid var(--border-color);
    }
    .quick-stat { text-align: center; }
    .qs-value { display: block; font-size: 16px; font-weight: 700; color: var(--text-primary); }
    .qs-label { display: block; font-size: 10px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; margin-top: 2px; }
    .quick-stat-divider { width: 1px; height: 36px; background: var(--border-color); }

    .attendance-grid { display: grid; grid-template-columns: repeat(2,1fr); gap: 12px; margin-bottom: 12px; }
    .att-item {
      text-align: center; padding: 16px;
      border-radius: 10px;
      display: flex; flex-direction: column; gap: 4px;
    }
    .att-value { font-size: 22px; font-weight: 700; }
    .att-label { font-size: 11px; font-weight: 500; opacity: 0.8; }
    .att-item.green { background: var(--success-light); color: var(--success-color); }
    .att-item.yellow { background: var(--warning-light); color: var(--warning-color); }
    .att-item.red { background: var(--danger-light); color: var(--danger-color); }
    .att-item.blue { background: var(--info-light); color: var(--info-color); }
    .att-progress { height: 4px; background: var(--border-color); border-radius: 2px; overflow: hidden; }
    .att-progress-fill { height: 100%; background: var(--success-color); border-radius: 2px; transition: width 0.5s ease; }

    .info-grid { display: grid; grid-template-columns: repeat(2,1fr); gap: 20px; }
    @media (max-width: 600px) { .info-grid { grid-template-columns: 1fr; } }
    .info-item { display: flex; flex-direction: column; gap: 4px; }
    .info-label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-muted); }
    .info-value { font-size: 14px; color: var(--text-primary); }
    .info-value.salary { font-size: 18px; font-weight: 700; color: var(--success-color); }

    .skills-list { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 4px; }
    .skill-tag {
      padding: 4px 12px;
      background: var(--accent-light);
      color: var(--accent-color);
      border-radius: 20px;
      font-size: 12px; font-weight: 500;
      border: 1px solid rgba(99,102,241,0.2);
    }

    .timeline { display: flex; flex-direction: column; gap: 0; }
    .timeline-item { display: flex; gap: 16px; position: relative; padding-bottom: 20px; }
    .timeline-item:last-child { padding-bottom: 0; }
    .timeline-item:not(:last-child)::before {
      content: '';
      position: absolute;
      left: 15px; top: 32px;
      width: 2px; bottom: 0;
      background: var(--border-color);
    }
    .timeline-dot {
      width: 32px; height: 32px;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
      z-index: 1;
    }
    .timeline-content { flex: 1; padding-top: 4px; }
    .timeline-title { font-size: 14px; font-weight: 500; color: var(--text-primary); }
    .timeline-meta { font-size: 12px; color: var(--text-muted); margin-top: 2px; }
    .timeline-change { display: flex; align-items: center; gap: 6px; margin-top: 6px; font-size: 12px; }
    .change-from { padding: 2px 8px; background: rgba(239,68,68,0.1); color: #ef4444; border-radius: 4px; }
    .change-to { padding: 2px 8px; background: rgba(16,185,129,0.1); color: #10b981; border-radius: 4px; }
  `]
})
export class EmployeeDetailComponent implements OnInit {
  employee: Employee | null = null;
  activities: Activity[] = [];
  attendance: AttendanceSummary | null = null;
  loading = true;
  showArchiveModal = false;
  archiving = false;
  currentMonthYear = '';

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private employeeService: EmployeeService,
    private authService: AuthService,
    private notifService: NotificationService
  ) {}

  get isHR(): boolean { return this.authService.isHR(); }

  ngOnInit(): void {
    const now = new Date();
    this.currentMonthYear = now.toLocaleString('default', { month: 'long', year: 'numeric' });

    const id = +this.route.snapshot.params['id'];
    if (!id || isNaN(id)) {
      this.loading = false;
      return;
    }

    this.employeeService.getById(id).subscribe({
      next: (res) => {
        if (res.success) this.employee = res.data ?? null;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });

    this.employeeService.getActivities(id).subscribe({
      next: (res) => { if (res.success) this.activities = res.data ?? []; }
    });

    this.employeeService.getAttendance(id, now.getFullYear(), now.getMonth() + 1).subscribe({
      next: (res) => { if (res.success) this.attendance = res.data ?? null; }
    });
  }

  getInitials(name: string): string {
    if (!name) return 'EE';
    const p = name.trim().split(' ');
    return ((p[0]?.charAt(0) ?? '') + (p[1]?.charAt(0) ?? '')).toUpperCase();
  }

  getStatusBadgeClass(s: string): string {
    const m: Record<string, string> = {
      'Active': 'badge-active', 'Inactive': 'badge-inactive',
      'OnLeave': 'badge-on-leave', 'Archived': 'badge-archived', 'Terminated': 'badge-inactive'
    };
    return m[s] ?? 'badge-inactive';
  }

  getActivityColor(type: string): string {
    const m: Record<string, string> = {
      'Created': '#10b981', 'Updated': '#6366f1', 'Archived': '#ef4444',
      'Restored': '#06b6d4', 'SalaryModified': '#f59e0b',
      'DepartmentChanged': '#8b5cf6', 'RoleChanged': '#ec4899', 'StatusChanged': '#f97316'
    };
    return m[type] ?? '#94a3b8';
  }

  getSkills(skills: string): string[] {
    return skills.split(',').map(s => s.trim()).filter(s => s.length > 0);
  }

  doArchive(): void {
    if (!this.employee) return;
    this.archiving = true;
    this.employeeService.archive(this.employee.id).subscribe({
      next: () => {
        this.notifService.success(`${this.employee!.fullName} has been archived`);
        this.router.navigate(['/employees']);
      },
      error: () => {
        this.notifService.error('Failed to archive employee');
        this.archiving = false;
        this.showArchiveModal = false;
      }
    });
  }
}
