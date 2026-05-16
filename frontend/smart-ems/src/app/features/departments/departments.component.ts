import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { DepartmentService, NotificationService } from '../../core/services/services';
import { AuthService } from '../../core/services/auth.service';
import { Department, CreateDepartmentDto } from '../../core/models/models';

@Component({
  selector: 'app-departments',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="animate-in">
      <div class="section-header">
        <div>
          <h1 class="page-title">Departments</h1>
          <p class="page-subtitle">Manage your organization's departments</p>
        </div>
        <button class="btn btn-primary" (click)="openModal()" *ngIf="isAdmin">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Department
        </button>
      </div>

      <div class="loading-container" *ngIf="loading"><div class="spinner"></div></div>

      <div class="grid-3" *ngIf="!loading">
        <div class="dept-card card" *ngFor="let dept of departments">
          <div class="card-body">
            <div class="dept-header">
              <div class="dept-icon">{{ dept.code.substring(0,2) }}</div>
              <div>
                <h3 class="dept-name">{{ dept.name }}</h3>
                <span class="dept-code">{{ dept.code }}</span>
              </div>
            </div>
            <p class="dept-desc">{{ dept.description || 'No description available' }}</p>
            <div class="dept-stats">
              <div class="dept-stat">
                <span class="dept-stat-value">{{ dept.employeeCount }}</span>
                <span class="dept-stat-label">Employees</span>
              </div>
              <div class="dept-stat">
                <span class="dept-stat-value">{{ dept.managerName || '—' }}</span>
                <span class="dept-stat-label">Manager</span>
              </div>
            </div>
            <div style="display:flex;gap:8px;margin-top:16px" *ngIf="isAdmin">
              <button class="btn btn-secondary btn-sm" style="flex:1" (click)="editDept(dept)">Edit</button>
              <button class="btn btn-danger btn-sm" (click)="confirmDelete(dept)">Delete</button>
            </div>
          </div>
        </div>

        <div class="dept-card card add-dept-card" (click)="openModal()" *ngIf="isAdmin">
          <div class="card-body" style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:180px;cursor:pointer">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="36" height="36" style="color:var(--text-muted)">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            <p style="color:var(--text-muted);margin-top:8px;font-size:14px">Add New Department</p>
          </div>
        </div>
      </div>

      <!-- Edit/Add Modal -->
      <div class="overlay" *ngIf="showModal" (click)="closeModal()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3 style="font-size:18px;font-weight:600;color:var(--text-primary)">{{ editingId ? 'Edit' : 'Add' }} Department</h3>
            <button (click)="closeModal()" style="background:none;border:none;cursor:pointer;color:var(--text-muted);font-size:20px">✕</button>
          </div>
          <div class="modal-body">
            <form [formGroup]="form">
              <div class="form-field">
                <label class="form-label">Department Name *</label>
                <input class="form-control" formControlName="name" placeholder="e.g. Engineering">
              </div>
              <div class="form-field">
                <label class="form-label">Department Code *</label>
                <input class="form-control" formControlName="code" placeholder="e.g. ENG" style="text-transform:uppercase">
              </div>
              <div class="form-field">
                <label class="form-label">Description</label>
                <textarea class="form-control" formControlName="description" rows="3" placeholder="Brief description..."></textarea>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="closeModal()">Cancel</button>
            <button class="btn btn-primary" (click)="save()" [disabled]="form.invalid || saving">
              {{ saving ? 'Saving...' : (editingId ? 'Update' : 'Create') }} Department
            </button>
          </div>
        </div>
      </div>

      <!-- Delete Confirmation Modal -->
      <div class="overlay" *ngIf="showDeleteModal" (click)="showDeleteModal = false">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3 style="font-size:18px;font-weight:600;color:var(--text-primary)">Delete Department</h3>
            <button (click)="showDeleteModal = false" style="background:none;border:none;cursor:pointer;color:var(--text-muted);font-size:20px">✕</button>
          </div>
          <div class="modal-body">
            <div style="display:flex;align-items:center;gap:16px;padding:16px;background:rgba(239,68,68,0.1);border-radius:12px;border:1px solid rgba(239,68,68,0.2)">
              <svg style="color:#ef4444;flex-shrink:0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="24" height="24">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <p style="font-size:14px;color:var(--text-secondary);margin:0">
                Are you sure you want to delete <strong>{{ deletingDept?.name }}</strong>? 
                This action cannot be undone.
              </p>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary" (click)="showDeleteModal = false">Cancel</button>
            <button class="btn btn-danger" (click)="doDelete()" [disabled]="saving">
              {{ saving ? 'Deleting...' : 'Delete Department' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dept-card { transition: all 0.2s; }
    .dept-card:hover { transform: translateY(-3px); box-shadow: var(--card-shadow-hover); }
    .dept-header { display: flex; align-items: center; gap: 14px; margin-bottom: 12px; }
    .dept-icon {
      width: 46px; height: 46px; border-radius: 12px;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      color: white; font-weight: 700; font-size: 14px;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .dept-name { font-size: 16px; font-weight: 600; color: var(--text-primary); }
    .dept-code { font-size: 12px; color: var(--text-muted); font-family: monospace; }
    .dept-desc { font-size: 13px; color: var(--text-muted); margin-bottom: 16px; min-height: 38px; }
    .dept-stats { display: flex; gap: 20px; padding: 12px; background: var(--bg-primary); border-radius: 10px; }
    .dept-stat { display: flex; flex-direction: column; gap: 2px; }
    .dept-stat-value { font-size: 16px; font-weight: 600; color: var(--text-primary); }
    .dept-stat-label { font-size: 11px; color: var(--text-muted); }
    .add-dept-card { border: 2px dashed var(--border-color); }
    .add-dept-card:hover { border-color: var(--accent-color); background: var(--accent-light); }
  `]
})
export class DepartmentsComponent implements OnInit {
  departments: Department[] = [];
  loading = true;
  showModal = false;
  editingId: number | null = null;
  saving = false;
  form!: FormGroup;
  
  showDeleteModal = false;
  deletingDept: Department | null = null;

  constructor(
    private deptService: DepartmentService,
    private authService: AuthService,
    private fb: FormBuilder,
    private notifService: NotificationService
  ) {}

  get isAdmin(): boolean { return this.authService.isAdmin(); }

  ngOnInit(): void {
    this.loadDepts();
    this.initForm();
  }

  initForm(): void {
    this.form = this.fb.group({
      name: ['', Validators.required],
      code: ['', Validators.required],
      description: [''],
      managerId: [null]
    });
  }

  loadDepts(): void {
    this.deptService.getAll().subscribe(res => {
      if (res.success) this.departments = res.data!;
      this.loading = false;
    });
  }

  openModal(): void { this.showModal = true; }
  closeModal(): void { this.showModal = false; this.editingId = null; this.initForm(); }

  editDept(dept: Department): void {
    this.editingId = dept.id;
    this.form.patchValue({ name: dept.name, code: dept.code, description: dept.description || '' });
    this.showModal = true;
  }

  save(): void {
    if (this.form.invalid) return;
    this.saving = true;
    const dto: CreateDepartmentDto = this.form.value;
    const obs = this.editingId
      ? this.deptService.update(this.editingId, dto)
      : this.deptService.create(dto);
    obs.subscribe({
      next: (res) => {
        if (res.success) {
          this.notifService.success(this.editingId ? 'Department updated' : 'Department created');
          this.closeModal();
          this.loadDepts();
        }
        this.saving = false;
      },
      error: () => { this.saving = false; this.notifService.error('Operation failed'); }
    });
  }

  confirmDelete(dept: Department): void {
    if (dept.employeeCount > 0) {
      this.notifService.error(`Cannot delete: ${dept.employeeCount} employees assigned`);
      return;
    }
    this.deletingDept = dept;
    this.showDeleteModal = true;
  }

  doDelete(): void {
    if (!this.deletingDept) return;
    this.saving = true;
    this.deptService.delete(this.deletingDept.id).subscribe({
      next: () => {
        this.notifService.success('Department deleted');
        this.loadDepts();
        this.showDeleteModal = false;
        this.saving = false;
        this.deletingDept = null;
      },
      error: () => {
        this.notifService.error('Failed to delete department');
        this.saving = false;
      }
    });
  }
}
