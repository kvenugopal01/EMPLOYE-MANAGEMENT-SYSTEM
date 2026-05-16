import { Routes } from '@angular/router';
import { AuthGuard, GuestGuard, RoleGuard } from './core/guards/guards';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  {
    path: 'login',
    canActivate: [GuestGuard],
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: '',
    loadComponent: () => import('./layouts/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    canActivate: [AuthGuard],
    children: [
      {
        path: 'dashboard',
        title: 'Dashboard — SmartEMS',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      // IMPORTANT: Specific routes BEFORE parameterized routes
      {
        path: 'employees/add',
        title: 'Add Employee — SmartEMS',
        canActivate: [RoleGuard],
        data: { roles: ['Admin', 'HR'] },
        loadComponent: () => import('./features/employees/employee-add/employee-add.component').then(m => m.EmployeeAddComponent)
      },
      {
        path: 'employees/archive/list',
        title: 'Archive — SmartEMS',
        canActivate: [RoleGuard],
        data: { roles: ['Admin', 'HR'] },
        loadComponent: () => import('./features/employees/employee-archive/employee-archive.component').then(m => m.EmployeeArchiveComponent)
      },
      {
        path: 'employees/:id/edit',
        title: 'Edit Employee — SmartEMS',
        canActivate: [RoleGuard],
        data: { roles: ['Admin', 'HR'] },
        loadComponent: () => import('./features/employees/employee-edit/employee-edit.component').then(m => m.EmployeeEditComponent)
      },
      {
        path: 'employees/:id',
        title: 'Employee Profile — SmartEMS',
        loadComponent: () => import('./features/employees/employee-detail/employee-detail.component').then(m => m.EmployeeDetailComponent)
      },
      {
        path: 'employees',
        title: 'Employees — SmartEMS',
        loadComponent: () => import('./features/employees/employee-list/employee-list.component').then(m => m.EmployeeListComponent)
      },
      {
        path: 'departments',
        title: 'Departments — SmartEMS',
        loadComponent: () => import('./features/departments/departments.component').then(m => m.DepartmentsComponent)
      }
    ]
  },
  { path: '**', redirectTo: '/dashboard' }
];
