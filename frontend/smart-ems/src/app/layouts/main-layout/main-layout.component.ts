import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService, NotificationService } from '../../core/services/services';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="app-shell" [class.dark]="isDark">
      <!-- Mobile overlay (closes sidebar) -->
      <div class="mobile-overlay" *ngIf="!sidebarCollapsed" (click)="sidebarCollapsed = true"></div>

      <!-- Sidebar -->
      <aside class="sidebar" [class.collapsed]="sidebarCollapsed">
        <div class="sidebar-brand">
          <div class="brand-icon">
            <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="10" fill="#6366f1"/>
              <path d="M16 8C12.686 8 10 10.686 10 14C10 17.314 12.686 20 16 20C19.314 20 22 17.314 22 14C22 10.686 19.314 8 16 8Z" fill="white"/>
              <path d="M8 26C8 22.686 11.582 20 16 20C20.418 20 24 22.686 24 26" stroke="white" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </div>
          <span class="brand-text" *ngIf="!sidebarCollapsed">SmartEMS</span>
          <button class="collapse-btn" (click)="sidebarCollapsed = !sidebarCollapsed" [title]="sidebarCollapsed ? 'Expand' : 'Collapse'">
            <svg [style.transform]="sidebarCollapsed ? 'rotate(180deg)' : ''" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
        </div>

        <nav class="sidebar-nav">
          <div class="nav-group">
            <span class="nav-group-label" *ngIf="!sidebarCollapsed">MAIN</span>
            <a routerLink="/dashboard" routerLinkActive="active" class="nav-item" title="Dashboard" (click)="closeMobileSidebar()">
              <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
              </svg>
              <span class="nav-label" *ngIf="!sidebarCollapsed">Dashboard</span>
            </a>
            <a routerLink="/employees" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="nav-item" title="Employees" (click)="closeMobileSidebar()">
              <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              <span class="nav-label" *ngIf="!sidebarCollapsed">Employees</span>
            </a>
            <a routerLink="/departments" routerLinkActive="active" class="nav-item" title="Departments" (click)="closeMobileSidebar()">
              <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
              </svg>
              <span class="nav-label" *ngIf="!sidebarCollapsed">Departments</span>
            </a>
          </div>

          <div class="nav-group" *ngIf="isHR">
            <span class="nav-group-label" *ngIf="!sidebarCollapsed">ACTIONS</span>
            <a routerLink="/employees/add" routerLinkActive="active" class="nav-item" title="Add Employee" (click)="closeMobileSidebar()">
              <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/>
              </svg>
              <span class="nav-label" *ngIf="!sidebarCollapsed">Add Employee</span>
            </a>
            <a routerLink="/employees/archive/list" routerLinkActive="active" class="nav-item" title="Archive" (click)="closeMobileSidebar()">
              <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="21 8 21 21 3 21 3 8"/>
                <rect x="1" y="3" width="22" height="5"/>
                <line x1="10" y1="12" x2="14" y2="12"/>
              </svg>
              <span class="nav-label" *ngIf="!sidebarCollapsed">Archive</span>
            </a>
          </div>
        </nav>

        <!-- User section -->
        <div class="sidebar-user" *ngIf="!sidebarCollapsed">
          <div class="user-avatar">{{ userInitials }}</div>
          <div class="user-info">
            <span class="user-name">{{ username }}</span>
            <span class="user-role">{{ role }}</span>
          </div>
          <button class="logout-btn" (click)="logout()" title="Logout">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>
        <!-- Collapsed logout -->
        <div class="sidebar-user-collapsed" *ngIf="sidebarCollapsed">
          <div class="user-avatar-sm" title="{{ username }} ({{ role }})">{{ userInitials }}</div>
        </div>
      </aside>

      <!-- Main Content -->
      <div class="main-content">
        <!-- Header -->
        <header class="top-header">
          <div class="header-left">
            <button class="mobile-menu-btn" (click)="sidebarCollapsed = !sidebarCollapsed" title="Menu">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
            <div class="breadcrumb">
              <span class="breadcrumb-root">SmartEMS</span>
              <svg class="breadcrumb-sep" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
              <span class="breadcrumb-current">{{ currentPageTitle }}</span>
            </div>
          </div>
          <div class="header-right">
            <button class="theme-toggle" (click)="toggleTheme()" [title]="isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'">
              <svg *ngIf="!isDark" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
              <svg *ngIf="isDark" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            </button>
            <div class="header-user">
              <div class="user-avatar-sm">{{ userInitials }}</div>
              <div class="user-meta">
                <span class="user-name-sm">{{ username }}</span>
                <span class="role-badge" [attr.data-role]="role">{{ role }}</span>
              </div>
            </div>
          </div>
        </header>

        <!-- Page Content -->
        <main class="page-content">
          <router-outlet />
        </main>
      </div>

      <!-- Global Toast Notification -->
      <div class="global-toast-container" *ngIf="toast">
        <div class="global-toast" [class]="'toast-' + toast.type">
          <svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline *ngIf="toast.type === 'success'" points="20 6 9 17 4 12"/>
            <circle *ngIf="toast.type === 'error'" cx="12" cy="12" r="10"/>
            <line *ngIf="toast.type === 'error'" x1="12" y1="8" x2="12" y2="12"/>
            <line *ngIf="toast.type === 'info'" x1="12" y1="16" x2="12.01" y2="16"/>
            <circle *ngIf="toast.type === 'info'" cx="12" cy="12" r="10"/>
            <line *ngIf="toast.type === 'info'" x1="12" y1="8" x2="12" y2="12"/>
          </svg>
          <span>{{ toast.message }}</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; height: 100vh; font-family: 'Inter', sans-serif; }

    .app-shell {
      display: flex;
      height: 100vh;
      background: var(--bg-primary);
      color: var(--text-primary);
      overflow: hidden;
    }

    /* Mobile overlay */
    .mobile-overlay {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.5);
      z-index: 99;
      backdrop-filter: blur(2px);
    }

    /* ─── Sidebar ─────────────────────────────────────────────── */
    .sidebar {
      width: 260px;
      background: var(--sidebar-bg);
      border-right: 1px solid var(--border-color);
      display: flex;
      flex-direction: column;
      transition: width 0.3s cubic-bezier(0.4,0,0.2,1);
      overflow: hidden;
      flex-shrink: 0;
      z-index: 100;
    }
    .sidebar.collapsed { width: 70px; }

    .sidebar-brand {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 20px 16px;
      border-bottom: 1px solid var(--border-color);
      position: relative;
      min-height: 72px;
    }
    .brand-icon { flex-shrink: 0; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; }
    .brand-text { font-size: 18px; font-weight: 700; color: var(--text-primary); white-space: nowrap; letter-spacing: -0.5px; transition: opacity 0.2s; }
    .collapse-btn {
      position: absolute; right: 12px;
      width: 28px; height: 28px;
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      color: var(--text-muted);
      transition: all 0.2s;
    }
    .collapse-btn svg { width: 14px; height: 14px; transition: transform 0.3s; }
    .collapse-btn:hover { background: var(--accent-color); color: white; border-color: var(--accent-color); }

    .sidebar-nav { flex: 1; overflow-y: auto; padding: 16px 12px; overflow-x: hidden; }
    .sidebar-nav::-webkit-scrollbar { width: 4px; }
    .sidebar-nav::-webkit-scrollbar-thumb { background: var(--border-color); border-radius: 2px; }
    .nav-group { margin-bottom: 24px; }
    .nav-group-label {
      font-size: 10px; font-weight: 600; letter-spacing: 1px;
      color: var(--text-muted); text-transform: uppercase;
      padding: 0 8px; margin-bottom: 8px; display: block;
    }
    .nav-item {
      display: flex; align-items: center; gap: 12px;
      padding: 10px 12px;
      border-radius: 10px;
      color: var(--text-secondary);
      text-decoration: none;
      font-size: 14px; font-weight: 500;
      transition: all 0.2s;
      margin-bottom: 2px;
      white-space: nowrap;
      overflow: hidden;
    }
    .nav-item:hover { background: var(--hover-bg); color: var(--text-primary); transform: translateX(2px); }
    .nav-item.active { background: rgba(99,102,241,0.15); color: #818cf8; }
    .nav-item.active .nav-icon { color: #6366f1; }
    .nav-icon { width: 20px; height: 20px; flex-shrink: 0; }
    .nav-label { transition: opacity 0.2s; }

    .sidebar-user {
      display: flex; align-items: center; gap: 10px;
      padding: 16px;
      border-top: 1px solid var(--border-color);
      background: var(--sidebar-bg);
    }
    .sidebar-user-collapsed {
      padding: 12px;
      display: flex; justify-content: center;
      border-top: 1px solid var(--border-color);
    }
    .user-avatar, .user-avatar-sm {
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      color: white; font-weight: 600;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0; cursor: default;
    }
    .user-avatar { width: 36px; height: 36px; font-size: 14px; }
    .user-avatar-sm { width: 34px; height: 34px; font-size: 13px; }
    .user-info { flex: 1; min-width: 0; }
    .user-name { font-size: 13px; font-weight: 600; color: var(--text-primary); display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .user-role { font-size: 11px; color: var(--text-muted); }
    .logout-btn {
      width: 32px; height: 32px; flex-shrink: 0;
      background: none; border: none; cursor: pointer;
      color: var(--text-muted); border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
      transition: all 0.2s;
    }
    .logout-btn svg { width: 16px; height: 16px; }
    .logout-btn:hover { background: rgba(239,68,68,0.1); color: #ef4444; }

    /* ─── Main Content ───────────────────────────────────────── */
    .main-content { flex: 1; display: flex; flex-direction: column; overflow: hidden; min-width: 0; }

    .top-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 0 24px;
      height: 64px;
      background: var(--header-bg);
      border-bottom: 1px solid var(--border-color);
      flex-shrink: 0;
      gap: 16px;
    }
    .header-left { display: flex; align-items: center; gap: 16px; min-width: 0; }
    .mobile-menu-btn {
      display: none;
      width: 36px; height: 36px;
      background: none; border: none; cursor: pointer;
      color: var(--text-secondary);
      border-radius: 8px;
      align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .mobile-menu-btn svg { width: 20px; height: 20px; }

    .breadcrumb { display: flex; align-items: center; gap: 6px; }
    .breadcrumb-root { font-size: 13px; color: var(--text-muted); }
    .breadcrumb-sep { width: 14px; height: 14px; color: var(--text-muted); }
    .breadcrumb-current { font-size: 14px; font-weight: 600; color: var(--text-primary); white-space: nowrap; }

    .header-right { display: flex; align-items: center; gap: 12px; flex-shrink: 0; }
    .theme-toggle {
      width: 38px; height: 38px;
      background: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: 10px;
      cursor: pointer; color: var(--text-secondary);
      display: flex; align-items: center; justify-content: center;
      transition: all 0.2s;
    }
    .theme-toggle svg { width: 18px; height: 18px; }
    .theme-toggle:hover { border-color: var(--accent-color); color: var(--accent-color); background: var(--accent-light); }

    .header-user { display: flex; align-items: center; gap: 10px; }
    .user-name-sm { font-size: 13px; font-weight: 600; color: var(--text-primary); }
    .user-meta { display: flex; flex-direction: column; gap: 2px; }
    .role-badge {
      font-size: 10px; font-weight: 600;
      padding: 2px 8px; border-radius: 4px;
      text-transform: uppercase; letter-spacing: 0.5px;
    }
    .role-badge[data-role="Admin"] { background: rgba(99,102,241,0.15); color: #818cf8; }
    .role-badge[data-role="HR"] { background: rgba(16,185,129,0.15); color: #34d399; }
    .role-badge[data-role="Employee"] { background: rgba(245,158,11,0.15); color: #fbbf24; }

    .page-content { flex: 1; overflow-y: auto; padding: 24px; }
    .page-content::-webkit-scrollbar { width: 6px; }
    .page-content::-webkit-scrollbar-thumb { background: var(--border-color); border-radius: 3px; }

    /* ─── Global Toast ───────────────────────────────────────── */
    .global-toast-container {
      position: fixed; bottom: 24px; right: 24px;
      z-index: 9999;
      pointer-events: none;
    }
    .global-toast {
      display: flex; align-items: center; gap: 10px;
      padding: 14px 18px;
      border-radius: 12px;
      font-size: 14px; font-weight: 500;
      box-shadow: 0 8px 32px rgba(0,0,0,0.25);
      animation: toastIn 0.3s ease;
      pointer-events: all;
      min-width: 280px; max-width: 400px;
    }
    .toast-icon { width: 18px; height: 18px; flex-shrink: 0; }
    .toast-success { background: #10b981; color: white; }
    .toast-error { background: #ef4444; color: white; }
    .toast-info { background: #6366f1; color: white; }
    .toast-warning { background: #f59e0b; color: white; }
    @keyframes toastIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: none; } }

    /* ─── Responsive ─────────────────────────────────────────── */
    @media (max-width: 768px) {
      .sidebar {
        position: fixed;
        height: 100vh;
        left: -260px;
        transition: left 0.3s cubic-bezier(0.4,0,0.2,1);
        width: 260px !important;
      }
      .sidebar:not(.collapsed) {
        left: 0;
        box-shadow: 4px 0 24px rgba(0,0,0,0.3);
      }
      .mobile-overlay { display: block; }
      .mobile-menu-btn { display: flex; }
      .header-user .user-meta { display: none; }
      .breadcrumb-root { display: none; }
      .breadcrumb-sep { display: none; }
      .page-content { padding: 16px; }
    }
  `]
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  sidebarCollapsed = false;
  toast: { message: string; type: string } | null = null;
  private notifSub?: Subscription;

  constructor(
    private authService: AuthService,
    private themeService: ThemeService,
    private notifService: NotificationService
  ) {}

  ngOnInit(): void {
    this.notifSub = this.notifService.notification$.subscribe(n => {
      this.toast = n;
    });

    // Collapse sidebar by default on mobile
    if (window.innerWidth < 768) {
      this.sidebarCollapsed = true;
    }
  }

  ngOnDestroy(): void {
    this.notifSub?.unsubscribe();
  }

  get username(): string { return this.authService.username || this.authService.currentUser?.username || ''; }
  get role(): string { return this.authService.userRole; }
  get isHR(): boolean { return this.authService.isHR(); }
  get isDark(): boolean { return this.themeService.isDark; }
  get userInitials(): string {
    const name = this.username;
    const parts = name.trim().split(' ');
    return ((parts[0]?.charAt(0) ?? '') + (parts[1]?.charAt(0) ?? '')).toUpperCase() || name.substring(0, 2).toUpperCase();
  }

  get currentPageTitle(): string {
    const path = window.location.pathname;
    if (path.includes('/dashboard')) return 'Dashboard';
    if (path.includes('/employees/add')) return 'Add Employee';
    if (path.includes('/archive')) return 'Archive';
    if (path.includes('/edit')) return 'Edit Employee';
    if (path.includes('/employees/') && !path.endsWith('/employees')) return 'Employee Profile';
    if (path.includes('/employees')) return 'Employees';
    if (path.includes('/departments')) return 'Departments';
    return 'SmartEMS';
  }

  closeMobileSidebar(): void {
    if (window.innerWidth < 768) {
      this.sidebarCollapsed = true;
    }
  }

  toggleTheme(): void { this.themeService.toggleTheme(); }
  logout(): void { this.authService.logout(); }
}
