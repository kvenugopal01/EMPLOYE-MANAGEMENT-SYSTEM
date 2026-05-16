import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { EmployeeService, DepartmentService } from '../../../core/services/services';
import { Department, Employee } from '../../../core/models/models';

@Component({
  selector: 'app-employee-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="animate-in">
      <div class="section-header">
        <div>
          <h1 class="page-title">Edit Employee</h1>
          <p class="page-subtitle" *ngIf="employee">Updating: {{ employee.fullName }}</p>
        </div>
        <a [routerLink]="['/employees', employeeId]" class="btn btn-secondary btn-sm">Cancel</a>
      </div>

      <div class="loading-container" *ngIf="loading"><div class="spinner"></div></div>

      <div class="card" *ngIf="!loading && form">
        <div class="card-body">
          <form [formGroup]="form" (ngSubmit)="submit()">
            <h3 style="font-size:16px;font-weight:600;color:var(--text-primary);margin-bottom:20px">Personal Information</h3>
            <div class="grid-2">
              <div class="form-field">
                <label class="form-label">Full Name *</label>
                <input class="form-control" formControlName="fullName">
              </div>
              <div class="form-field">
                <label class="form-label">Email *</label>
                <input class="form-control" type="email" formControlName="email">
              </div>
              <div class="form-field">
                <label class="form-label">Phone *</label>
                <input class="form-control" formControlName="phone">
              </div>
              <div class="form-field">
                <label class="form-label">Gender</label>
                <select class="form-control" formControlName="gender">
                  <option value="1">Male</option><option value="2">Female</option><option value="3">Other</option>
                </select>
              </div>
              <div class="form-field">
                <label class="form-label">Date of Birth</label>
                <input class="form-control" type="date" formControlName="dateOfBirth">
              </div>
              <div class="form-field">
                <label class="form-label">Emergency Contact</label>
                <input class="form-control" formControlName="emergencyContact">
              </div>
              <div class="form-field" style="grid-column:1/-1">
                <label class="form-label">Address</label>
                <textarea class="form-control" formControlName="address" rows="2"></textarea>
              </div>
            </div>

            <h3 style="font-size:16px;font-weight:600;color:var(--text-primary);margin:24px 0 20px">Professional Details</h3>
            <div class="grid-2">
              <div class="form-field">
                <label class="form-label">Department</label>
                <select class="form-control" formControlName="departmentId">
                  <option value="">None</option>
                  <option *ngFor="let d of departments" [value]="d.id">{{ d.name }}</option>
                </select>
              </div>
              <div class="form-field">
                <label class="form-label">Designation *</label>
                <input class="form-control" formControlName="designation">
              </div>
              <div class="form-field">
                <label class="form-label">Joining Date</label>
                <input class="form-control" type="date" formControlName="joiningDate">
              </div>
              <div class="form-field">
                <label class="form-label">Employment Type</label>
                <select class="form-control" formControlName="employmentType">
                  <option value="1">Full Time</option><option value="2">Part Time</option>
                  <option value="3">Contract</option><option value="4">Intern</option>
                </select>
              </div>
              <div class="form-field">
                <label class="form-label">Work Location</label>
                <input class="form-control" formControlName="workLocation">
              </div>
              <div class="form-field">
                <label class="form-label">Status</label>
                <select class="form-control" formControlName="status">
                  <option value="1">Active</option><option value="2">Inactive</option>
                  <option value="3">On Leave</option>
                </select>
              </div>
              <div class="form-field">
                <label class="form-label">Annual Salary (₹)</label>
                <input class="form-control" type="number" formControlName="salary">
              </div>
              <div class="form-field">
                <label class="form-label">Role</label>
                <select class="form-control" formControlName="role">
                  <option value="3">Employee</option><option value="2">HR</option><option value="1">Admin</option>
                </select>
              </div>
              <div class="form-field">
                <label class="form-label">Shift Details</label>
                <input class="form-control" formControlName="shiftDetails">
              </div>
              <div class="form-field">
                <label class="form-label">Skills</label>
                <input class="form-control" formControlName="skills">
              </div>
            </div>

            <div *ngIf="errorMsg" style="padding:12px 16px;background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);border-radius:10px;color:#ef4444;font-size:13px;margin-top:16px">
              {{ errorMsg }}
            </div>

            <div style="display:flex;justify-content:flex-end;gap:12px;margin-top:24px;padding-top:20px;border-top:1px solid var(--border-color)">
              <a [routerLink]="['/employees', employeeId]" class="btn btn-secondary">Cancel</a>
              <button type="submit" class="btn btn-primary" [disabled]="submitting || form.invalid">
                {{ submitting ? 'Saving...' : 'Save Changes' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class EmployeeEditComponent implements OnInit {
  form!: FormGroup;
  employee: Employee | null = null;
  departments: Department[] = [];
  loading = true;
  submitting = false;
  errorMsg = '';
  employeeId!: number;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private employeeService: EmployeeService,
    private deptService: DepartmentService
  ) {}

  ngOnInit(): void {
    this.employeeId = +this.route.snapshot.params['id'];
    this.deptService.getAll().subscribe(res => { if (res.success) this.departments = res.data!; });
    this.employeeService.getById(this.employeeId).subscribe(res => {
      if (res.success && res.data) {
        this.employee = res.data;
        this.buildForm(res.data);
      }
      this.loading = false;
    });
  }

  buildForm(e: Employee): void {
    const genderMap: Record<string, string> = { 'Male': '1', 'Female': '2', 'Other': '3' };
    const empTypeMap: Record<string, string> = { 'FullTime': '1', 'PartTime': '2', 'Contract': '3', 'Intern': '4' };
    const roleMap: Record<string, string> = { 'Admin': '1', 'HR': '2', 'Employee': '3' };
    const statusMap: Record<string, string> = { 'Active': '1', 'Inactive': '2', 'OnLeave': '3', 'Terminated': '4' };

    this.form = this.fb.group({
      fullName: [e.fullName, Validators.required],
      dateOfBirth: [e.dateOfBirth.split('T')[0], Validators.required],
      gender: [genderMap[e.gender] || '1'],
      phone: [e.phone, Validators.required],
      email: [e.email, [Validators.required, Validators.email]],
      address: [e.address, Validators.required],
      emergencyContact: [e.emergencyContact],
      departmentId: [e.departmentId || ''],
      designation: [e.designation, Validators.required],
      joiningDate: [e.joiningDate.split('T')[0], Validators.required],
      employmentType: [empTypeMap[e.employmentType] || '1'],
      workLocation: [e.workLocation],
      salary: [e.salary, [Validators.required, Validators.min(1)]],
      role: [roleMap[e.role] || '3'],
      reportingManagerId: [e.reportingManagerId || ''],
      shiftDetails: [e.shiftDetails],
      skills: [e.skills],
      status: [statusMap[e.status] || '1']
    });
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.submitting = true;
    const v = this.form.value;
    const dto = {
      ...v,
      gender: +v.gender,
      employmentType: +v.employmentType,
      role: +v.role,
      status: +v.status,
      departmentId: v.departmentId || null,
      reportingManagerId: v.reportingManagerId || null
    };
    this.employeeService.update(this.employeeId, dto).subscribe({
      next: (res) => {
        if (res.success) this.router.navigate(['/employees', this.employeeId]);
        else { this.errorMsg = res.message || 'Update failed'; this.submitting = false; }
      },
      error: (err) => { this.errorMsg = err.error?.message || 'Update failed'; this.submitting = false; }
    });
  }
}
