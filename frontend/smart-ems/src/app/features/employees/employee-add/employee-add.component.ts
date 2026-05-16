import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { EmployeeService, DepartmentService } from '../../../core/services/services';
import { Department, EmployeeListItem } from '../../../core/models/models';

@Component({
  selector: 'app-employee-add',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="employee-add animate-in">
      <div class="section-header">
        <div>
          <h1 class="page-title">Add New Employee</h1>
          <p class="page-subtitle">Complete all steps to onboard a new team member</p>
        </div>
      </div>

      <!-- Stepper -->
      <div class="stepper">
        <div class="step" *ngFor="let s of steps; let i = index"
          [class.active]="currentStep === i" [class.completed]="currentStep > i">
          <div class="step-circle">
            <svg *ngIf="currentStep > i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" width="16" height="16">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            <span *ngIf="currentStep <= i">{{ i + 1 }}</span>
          </div>
          <span class="step-label">{{ s }}</span>
          <div class="step-line" [class.completed]="currentStep > i" *ngIf="i < steps.length - 1"></div>
        </div>
      </div>

      <div class="card">
        <div class="card-body">

          <!-- STEP 1: Personal Information -->
          <form [formGroup]="step1Form" *ngIf="currentStep === 0">
            <h3 class="step-title">Personal Information</h3>
            <div class="grid-2">
              <div class="form-field">
                <label class="form-label">Full Name *</label>
                <input class="form-control" formControlName="fullName" placeholder="Enter full name">
                <span class="form-error" *ngIf="isInvalid(step1Form, 'fullName')">Full name is required</span>
              </div>
              <div class="form-field">
                <label class="form-label">Date of Birth *</label>
                <input class="form-control" type="date" formControlName="dateOfBirth">
                <span class="form-error" *ngIf="isInvalid(step1Form, 'dateOfBirth')">Date of birth is required</span>
              </div>
              <div class="form-field">
                <label class="form-label">Gender *</label>
                <select class="form-control" formControlName="gender">
                  <option value="">Select gender</option>
                  <option value="1">Male</option>
                  <option value="2">Female</option>
                  <option value="3">Other</option>
                </select>
                <span class="form-error" *ngIf="isInvalid(step1Form, 'gender')">Gender is required</span>
              </div>
              <div class="form-field">
                <label class="form-label">Phone *</label>
                <input class="form-control" formControlName="phone" placeholder="+91 9876543210">
                <span class="form-error" *ngIf="isInvalid(step1Form, 'phone')">Valid phone is required</span>
              </div>
              <div class="form-field">
                <label class="form-label">Email Address *</label>
                <input class="form-control" type="email" formControlName="email" placeholder="employee@company.com">
                <span class="form-error" *ngIf="isInvalid(step1Form, 'email')">Valid email is required</span>
              </div>
              <div class="form-field">
                <label class="form-label">Emergency Contact</label>
                <input class="form-control" formControlName="emergencyContact" placeholder="Name & Phone">
              </div>
            </div>
            <div class="form-field">
              <label class="form-label">Address *</label>
              <textarea class="form-control" formControlName="address" rows="2" placeholder="Full address"></textarea>
              <span class="form-error" *ngIf="isInvalid(step1Form, 'address')">Address is required</span>
            </div>
          </form>

          <!-- STEP 2: Professional Information -->
          <form [formGroup]="step2Form" *ngIf="currentStep === 1">
            <h3 class="step-title">Professional Information</h3>
            <div class="grid-2">
              <div class="form-field">
                <label class="form-label">Department</label>
                <select class="form-control" formControlName="departmentId">
                  <option value="">Select department</option>
                  <option *ngFor="let d of departments" [value]="d.id">{{ d.name }}</option>
                </select>
              </div>
              <div class="form-field">
                <label class="form-label">Designation *</label>
                <input class="form-control" formControlName="designation" placeholder="e.g. Software Engineer">
                <span class="form-error" *ngIf="isInvalid(step2Form, 'designation')">Designation is required</span>
              </div>
              <div class="form-field">
                <label class="form-label">Joining Date *</label>
                <input class="form-control" type="date" formControlName="joiningDate">
                <span class="form-error" *ngIf="isInvalid(step2Form, 'joiningDate')">Joining date is required</span>
              </div>
              <div class="form-field">
                <label class="form-label">Employment Type *</label>
                <select class="form-control" formControlName="employmentType">
                  <option value="1">Full Time</option>
                  <option value="2">Part Time</option>
                  <option value="3">Contract</option>
                  <option value="4">Intern</option>
                </select>
              </div>
              <div class="form-field">
                <label class="form-label">Work Location</label>
                <input class="form-control" formControlName="workLocation" placeholder="e.g. Bangalore HQ">
              </div>
              <div class="form-field">
                <label class="form-label">Reporting Manager</label>
                <select class="form-control" formControlName="reportingManagerId">
                  <option value="">None</option>
                  <option *ngFor="let m of managers" [value]="m.id">{{ m.fullName }}</option>
                </select>
              </div>
            </div>
          </form>

          <!-- STEP 3: Salary & Role -->
          <form [formGroup]="step3Form" *ngIf="currentStep === 2">
            <h3 class="step-title">Salary & Role Information</h3>
            <div class="grid-2">
              <div class="form-field">
                <label class="form-label">Annual Salary (₹) *</label>
                <input class="form-control" type="number" formControlName="salary" placeholder="e.g. 800000">
                <span class="form-error" *ngIf="isInvalid(step3Form, 'salary')">Valid salary is required</span>
              </div>
              <div class="form-field">
                <label class="form-label">Role *</label>
                <select class="form-control" formControlName="role">
                  <option value="3">Employee</option>
                  <option value="2">HR</option>
                  <option value="1">Admin</option>
                </select>
              </div>
              <div class="form-field">
                <label class="form-label">Shift Details</label>
                <input class="form-control" formControlName="shiftDetails" placeholder="e.g. 9AM - 6PM IST">
              </div>
              <div class="form-field">
                <label class="form-label">Skills</label>
                <input class="form-control" formControlName="skills" placeholder="e.g. Angular, .NET, SQL">
              </div>
            </div>
          </form>

          <!-- STEP 4: Documents -->
          <div *ngIf="currentStep === 3">
            <h3 class="step-title">Documents & Profile Photo</h3>
            <div class="grid-2">
              <div class="upload-area" (click)="photoInput.click()" [class.has-file]="photoFile">
                <input #photoInput type="file" accept="image/*" hidden (change)="onFileChange($event, 'photo')">
                <svg *ngIf="!photoPreview" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="40" height="40" style="color:var(--text-muted)">
                  <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21 15 16 10 5 21"/>
                </svg>
                <img *ngIf="photoPreview" [src]="photoPreview" style="max-height:120px;border-radius:8px;object-fit:cover">
                <p style="margin-top:8px;font-size:13px;color:var(--text-muted)">{{ photoFile ? photoFile.name : 'Click to upload profile photo' }}</p>
                <span style="font-size:11px;color:var(--text-muted)">JPG, PNG up to 5MB</span>
              </div>
              <div class="upload-area" (click)="resumeInput.click()" [class.has-file]="resumeFile">
                <input #resumeInput type="file" accept=".pdf,.doc,.docx" hidden (change)="onFileChange($event, 'resume')">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="40" height="40" style="color:var(--text-muted)">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
                </svg>
                <p style="margin-top:8px;font-size:13px;color:var(--text-muted)">{{ resumeFile ? resumeFile.name : 'Click to upload resume' }}</p>
                <span style="font-size:11px;color:var(--text-muted)">PDF, DOC up to 10MB</span>
              </div>
            </div>
          </div>

          <!-- STEP 5: Review -->
          <div *ngIf="currentStep === 4">
            <h3 class="step-title">Review & Submit</h3>
            <div class="review-card">
              <div class="review-photo">
                <div class="emp-card-avatar" style="width:80px;height:80px;margin:0 auto 16px;font-size:28px">
                  <img *ngIf="photoPreview" [src]="photoPreview" style="width:100%;height:100%;border-radius:50%;object-fit:cover">
                  <span *ngIf="!photoPreview">{{ getInitials(step1Form.get('fullName')?.value) }}</span>
                </div>
                <h3 style="text-align:center;font-size:20px;color:var(--text-primary)">{{ step1Form.get('fullName')?.value }}</h3>
                <p style="text-align:center;color:var(--text-muted)">{{ step2Form.get('designation')?.value }}</p>
              </div>
              <div class="review-grid">
                <div class="review-item">
                  <span class="review-label">Email</span>
                  <span class="review-value">{{ step1Form.get('email')?.value }}</span>
                </div>
                <div class="review-item">
                  <span class="review-label">Phone</span>
                  <span class="review-value">{{ step1Form.get('phone')?.value }}</span>
                </div>
                <div class="review-item">
                  <span class="review-label">Department</span>
                  <span class="review-value">{{ getDeptName(step2Form.get('departmentId')?.value) }}</span>
                </div>
                <div class="review-item">
                  <span class="review-label">Joining Date</span>
                  <span class="review-value">{{ step2Form.get('joiningDate')?.value | date }}</span>
                </div>
                <div class="review-item">
                  <span class="review-label">Annual Salary</span>
                  <span class="review-value">₹{{ step3Form.get('salary')?.value | number }}</span>
                </div>
                <div class="review-item">
                  <span class="review-label">Employment Type</span>
                  <span class="review-value">{{ getEmpTypeName(step2Form.get('employmentType')?.value) }}</span>
                </div>
              </div>
            </div>
            <div class="alert-info" *ngIf="errorMsg" style="margin-top:16px;padding:12px 16px;background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);border-radius:10px;color:#ef4444;font-size:13px">
              {{ errorMsg }}
            </div>
          </div>

          <!-- Navigation Buttons -->
          <div class="step-nav">
            <button class="btn btn-secondary" *ngIf="currentStep > 0" (click)="prevStep()">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
              Back
            </button>
            <span style="flex:1"></span>
            <button class="btn btn-primary" *ngIf="currentStep < 4" (click)="nextStep()">
              Next
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
            <button class="btn btn-primary" *ngIf="currentStep === 4" (click)="submit()" [disabled]="submitting">
              <span *ngIf="!submitting">Submit Employee</span>
              <span *ngIf="submitting">Creating...</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .step-title { font-size: 18px; font-weight: 600; color: var(--text-primary); margin-bottom: 24px; }
    .step-nav { display: flex; align-items: center; margin-top: 32px; padding-top: 20px; border-top: 1px solid var(--border-color); }
    textarea.form-control { resize: vertical; }
    
    .upload-area {
      border: 2px dashed var(--border-color);
      border-radius: var(--radius-lg);
      padding: 40px 24px;
      text-align: center;
      cursor: pointer;
      transition: all 0.2s;
      display: flex; flex-direction: column; align-items: center; gap: 4px;
    }
    .upload-area:hover { border-color: var(--accent-color); background: var(--accent-light); }
    .upload-area.has-file { border-color: var(--success-color); background: var(--success-light); }

    .review-card { padding: 24px; background: var(--bg-primary); border-radius: var(--radius-lg); border: 1px solid var(--border-color); }
    .review-photo { text-align: center; margin-bottom: 24px; padding-bottom: 24px; border-bottom: 1px solid var(--border-color); }
    .review-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
    .review-item { display: flex; flex-direction: column; gap: 4px; }
    .review-label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-muted); }
    .review-value { font-size: 14px; font-weight: 500; color: var(--text-primary); }
  `]
})
export class EmployeeAddComponent implements OnInit {
  currentStep = 0;
  steps = ['Personal Info', 'Professional', 'Salary & Role', 'Documents', 'Review'];
  departments: Department[] = [];
  managers: EmployeeListItem[] = [];
  photoFile: File | null = null;
  resumeFile: File | null = null;
  photoPreview: string | null = null;
  submitting = false;
  errorMsg = '';

  step1Form!: FormGroup;
  step2Form!: FormGroup;
  step3Form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private employeeService: EmployeeService,
    private deptService: DepartmentService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.step1Form = this.fb.group({
      fullName: ['', Validators.required],
      dateOfBirth: ['', Validators.required],
      gender: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern(/^\+?[\d\s-]{10,}$/)]],
      email: ['', [Validators.required, Validators.email]],
      address: ['', Validators.required],
      emergencyContact: ['']
    });
    this.step2Form = this.fb.group({
      departmentId: [''],
      designation: ['', Validators.required],
      joiningDate: [new Date().toISOString().split('T')[0], Validators.required],
      employmentType: ['1', Validators.required],
      workLocation: [''],
      reportingManagerId: ['']
    });
    this.step3Form = this.fb.group({
      salary: ['', [Validators.required, Validators.min(1)]],
      role: ['3', Validators.required],
      shiftDetails: [''],
      skills: ['']
    });

    this.deptService.getAll().subscribe(res => { if (res.success) this.departments = res.data!; });
    this.employeeService.getAll({ page: 1, pageSize: 100 }).subscribe(res => {
      if (res.success) this.managers = res.data!.data;
    });
  }

  isInvalid(form: FormGroup, field: string): boolean {
    const c = form.get(field);
    return !!(c?.invalid && c?.touched);
  }

  nextStep(): void {
    const forms = [this.step1Form, this.step2Form, this.step3Form, null, null];
    const form = forms[this.currentStep];
    if (form) { form.markAllAsTouched(); if (form.invalid) return; }
    this.currentStep++;
  }
  prevStep(): void { if (this.currentStep > 0) this.currentStep--; }

  onFileChange(event: Event, type: 'photo' | 'resume'): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    if (type === 'photo') {
      this.photoFile = file;
      const reader = new FileReader();
      reader.onload = e => this.photoPreview = e.target?.result as string;
      reader.readAsDataURL(file);
    } else {
      this.resumeFile = file;
    }
  }

  submit(): void {
    this.submitting = true;
    this.errorMsg = '';
    const dto = {
      ...this.step1Form.value,
      ...this.step2Form.value,
      ...this.step3Form.value,
      gender: +this.step1Form.value.gender,
      employmentType: +this.step2Form.value.employmentType,
      role: +this.step3Form.value.role,
      departmentId: this.step2Form.value.departmentId || null,
      reportingManagerId: this.step2Form.value.reportingManagerId || null
    };

    this.employeeService.create(dto).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          if (this.photoFile) {
            this.employeeService.uploadPhoto(res.data.id, this.photoFile).subscribe();
          }
          if (this.resumeFile) {
            this.employeeService.uploadResume(res.data.id, this.resumeFile).subscribe();
          }
          this.router.navigate(['/employees', res.data.id]);
        } else {
          this.errorMsg = res.message || 'Failed to create employee';
          this.submitting = false;
        }
      },
      error: (err) => {
        this.errorMsg = err.error?.message || 'Something went wrong';
        this.submitting = false;
      }
    });
  }

  getInitials(name: string): string {
    if (!name) return 'EE';
    const p = name.split(' ');
    return (p[0]?.charAt(0) + (p[1]?.charAt(0) || '')).toUpperCase();
  }
  getDeptName(id: any): string {
    return this.departments.find(d => d.id == id)?.name || '—';
  }
  getEmpTypeName(val: any): string {
    const map: Record<string, string> = {'1':'Full Time','2':'Part Time','3':'Contract','4':'Intern'};
    return map[val] || val;
  }
}
