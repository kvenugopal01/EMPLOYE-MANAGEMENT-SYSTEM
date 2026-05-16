import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="login-wrapper">
      <!-- Animated background -->
      <div class="bg-animation">
        <div class="orb orb-1"></div>
        <div class="orb orb-2"></div>
        <div class="orb orb-3"></div>
      </div>

      <div class="login-container">
        <!-- Brand -->
        <div class="brand">
          <div class="brand-icon">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="10" fill="#6366f1"/>
              <path d="M16 8C12.686 8 10 10.686 10 14C10 17.314 12.686 20 16 20C19.314 20 22 17.314 22 14C22 10.686 19.314 8 16 8Z" fill="white"/>
              <path d="M8 26C8 22.686 11.582 20 16 20C20.418 20 24 22.686 24 26" stroke="white" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </div>
          <div>
            <h1 class="brand-name">SmartEMS</h1>
            <p class="brand-tagline">Enterprise HR Platform</p>
          </div>
        </div>

        <div class="login-card">
          <div class="login-header">
            <h2>Welcome back</h2>
            <p>Sign in to your account to continue</p>
          </div>

          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="login-form">
            <div class="form-group" [class.error]="getError('email')">
              <label for="email">Email Address</label>
              <div class="input-wrapper">
                <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                <input id="email" type="email" formControlName="email" placeholder="admin&#64;smartems.com" autocomplete="email"/>
              </div>
              <span class="error-msg" *ngIf="getError('email')">Please enter a valid email address</span>
            </div>

            <div class="form-group" [class.error]="getError('password')">
              <label for="password">Password</label>
              <div class="input-wrapper">
                <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <input id="password" [type]="showPassword ? 'text' : 'password'" 
                  formControlName="password" placeholder="Enter your password" autocomplete="current-password"/>
                <button type="button" class="toggle-password" (click)="showPassword = !showPassword">
                  <svg *ngIf="!showPassword" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                  <svg *ngIf="showPassword" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                </button>
              </div>
              <span class="error-msg" *ngIf="getError('password')">Password is required</span>
            </div>

            <div class="alert alert-error" *ngIf="errorMsg">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {{ errorMsg }}
            </div>

            <button type="submit" class="btn-login" [disabled]="loading || loginForm.invalid">
              <span class="btn-text" *ngIf="!loading">Sign In</span>
              <span class="spinner" *ngIf="loading">
                <span class="spinner-ring"></span>
                Signing in...
              </span>
            </button>
          </form>

          <div class="demo-creds">
            <p class="demo-title">Demo Credentials</p>
            <div class="cred-grid">
              <button class="cred-btn" (click)="fillCreds('admin&#64;smartems.com', 'Admin&#64;123')">
                <span class="cred-role admin">Admin</span>
                <span>admin&#64;smartems.com</span>
              </button>
              <button class="cred-btn" (click)="fillCreds('hr&#64;smartems.com', 'Hr&#64;123456')">
                <span class="cred-role hr">HR</span>
                <span>hr&#64;smartems.com</span>
              </button>
            </div>
          </div>
        </div>

        <p class="footer-text">© 2025 SmartEMS. Enterprise HR Management Platform.</p>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; height: 100vh; }

    .login-wrapper {
      min-height: 100vh;
      background: #0f0f1a;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: hidden;
      font-family: 'Inter', sans-serif;
    }

    .bg-animation { position: absolute; inset: 0; overflow: hidden; }
    .orb {
      position: absolute;
      border-radius: 50%;
      filter: blur(80px);
      opacity: 0.15;
      animation: float 8s ease-in-out infinite;
    }
    .orb-1 { width: 500px; height: 500px; background: #6366f1; top: -150px; right: -100px; }
    .orb-2 { width: 400px; height: 400px; background: #8b5cf6; bottom: -100px; left: -100px; animation-delay: -3s; }
    .orb-3 { width: 300px; height: 300px; background: #06b6d4; top: 40%; left: 40%; animation-delay: -6s; }
    @keyframes float {
      0%, 100% { transform: translateY(0) scale(1); }
      50% { transform: translateY(-30px) scale(1.05); }
    }

    .login-container {
      position: relative;
      z-index: 1;
      width: 100%;
      max-width: 460px;
      padding: 24px;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 32px;
    }
    .brand-icon { 
      width: 48px; height: 48px;
      display: flex; align-items: center; justify-content: center;
    }
    .brand-name { font-size: 24px; font-weight: 700; color: #fff; margin: 0; letter-spacing: -0.5px; }
    .brand-tagline { font-size: 12px; color: #94a3b8; margin: 2px 0 0; }

    .login-card {
      background: rgba(255,255,255,0.05);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 20px;
      padding: 36px;
      box-shadow: 0 25px 50px rgba(0,0,0,0.4);
    }

    .login-header { margin-bottom: 28px; }
    .login-header h2 { font-size: 22px; font-weight: 700; color: #fff; margin: 0 0 6px; }
    .login-header p { color: #94a3b8; font-size: 14px; margin: 0; }

    .form-group { margin-bottom: 20px; }
    label { display: block; font-size: 13px; font-weight: 500; color: #cbd5e1; margin-bottom: 8px; }
    
    .input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }
    .input-icon {
      position: absolute;
      left: 14px;
      width: 18px;
      height: 18px;
      color: #64748b;
      pointer-events: none;
    }
    input {
      width: 100%;
      padding: 12px 44px 12px 44px;
      background: rgba(255,255,255,0.07);
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 12px;
      color: #fff;
      font-size: 14px;
      transition: all 0.2s;
      box-sizing: border-box;
      font-family: 'Inter', sans-serif;
    }
    input::placeholder { color: #475569; }
    input:focus {
      outline: none;
      border-color: #6366f1;
      background: rgba(99,102,241,0.1);
      box-shadow: 0 0 0 3px rgba(99,102,241,0.15);
    }
    .form-group.error input { border-color: #ef4444; }
    .error-msg { font-size: 12px; color: #ef4444; margin-top: 6px; display: block; }

    .toggle-password {
      position: absolute; right: 12px;
      background: none; border: none; cursor: pointer;
      color: #64748b; padding: 4px;
      display: flex; align-items: center;
    }
    .toggle-password svg { width: 18px; height: 18px; }
    .toggle-password:hover { color: #94a3b8; }

    .alert {
      display: flex; align-items: center; gap: 10px;
      padding: 12px 16px;
      border-radius: 10px;
      font-size: 13px;
      margin-bottom: 20px;
      animation: slideIn 0.3s ease;
    }
    .alert svg { width: 18px; height: 18px; flex-shrink: 0; }
    .alert-error { background: rgba(239,68,68,0.15); border: 1px solid rgba(239,68,68,0.3); color: #fca5a5; }
    @keyframes slideIn { from { opacity:0; transform: translateY(-10px); } to { opacity:1; transform:none; } }

    .btn-login {
      width: 100%;
      padding: 14px;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      border: none;
      border-radius: 12px;
      color: #fff;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      font-family: 'Inter', sans-serif;
      display: flex; align-items: center; justify-content: center; gap: 8px;
    }
    .btn-login:hover:not(:disabled) { 
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(99,102,241,0.4);
    }
    .btn-login:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
    
    .spinner { display: flex; align-items: center; gap: 10px; }
    .spinner-ring {
      width: 18px; height: 18px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    .demo-creds {
      margin-top: 24px;
      padding-top: 20px;
      border-top: 1px solid rgba(255,255,255,0.08);
    }
    .demo-title { font-size: 12px; color: #64748b; margin: 0 0 10px; text-transform: uppercase; letter-spacing: 0.5px; }
    .cred-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    .cred-btn {
      display: flex; flex-direction: column; gap: 4px;
      padding: 10px 12px;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 10px;
      cursor: pointer;
      text-align: left;
      color: #94a3b8;
      font-size: 11px;
      transition: all 0.2s;
      font-family: 'Inter', sans-serif;
    }
    .cred-btn:hover { background: rgba(255,255,255,0.08); border-color: rgba(99,102,241,0.4); }
    .cred-role {
      font-size: 11px; font-weight: 600;
      padding: 2px 8px; border-radius: 4px;
      display: inline-block;
    }
    .cred-role.admin { background: rgba(99,102,241,0.2); color: #818cf8; }
    .cred-role.hr { background: rgba(16,185,129,0.2); color: #34d399; }

    .footer-text { text-align: center; color: #334155; font-size: 12px; margin-top: 20px; }
  `]
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  loading = false;
  errorMsg = '';
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  getError(field: string): boolean {
    const control = this.loginForm.get(field);
    return !!(control?.invalid && control?.touched);
  }

  fillCreds(email: string, password: string): void {
    this.loginForm.setValue({ email, password });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMsg = '';

    this.authService.login(this.loginForm.value).subscribe({
      next: (res) => {
        if (res.success) {
          this.router.navigate(['/dashboard']);
        } else {
          this.errorMsg = res.message || 'Login failed';
          this.loading = false;
        }
      },
      error: (err) => {
        this.errorMsg = err.error?.message || 'Invalid email or password';
        this.loading = false;
      }
    });
  }
}
