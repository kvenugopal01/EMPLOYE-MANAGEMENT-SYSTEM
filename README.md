<<<<<<< HEAD
# 🚀 SmartEMS — Smart Employee Management System

> **Enterprise-grade HRMS built with ASP.NET Core 8 + Angular 19 + SQL Server**

![SmartEMS](https://img.shields.io/badge/SmartEMS-v1.0-6366f1?style=for-the-badge)
![.NET](https://img.shields.io/badge/.NET-8.0-512BD4?style=for-the-badge&logo=dotnet)
![Angular](https://img.shields.io/badge/Angular-19-DD0031?style=for-the-badge&logo=angular)
![SQL Server](https://img.shields.io/badge/SQL_Server-2019+-CC2927?style=for-the-badge&logo=microsoftsqlserver)

---

## 📋 Prerequisites

| Tool | Minimum Version | Download |
|------|----------------|----------|
| .NET SDK | 8.0 | https://dotnet.microsoft.com/download/dotnet/8 |
| Node.js | 18+ | https://nodejs.org |
| Angular CLI | 19+ | `npm install -g @angular/cli` |
| SQL Server | 2019+ | https://www.microsoft.com/sql-server |
| SQL Server Management Studio | Any | https://aka.ms/ssmsfullsetup |

---

## 🏗️ Project Architecture

```
EMS/
├── backend/
│   ├── SmartEMS.Core/           # Entities, DTOs, Interfaces
│   ├── SmartEMS.Infrastructure/ # EF Core, Repositories, Services
│   ├── SmartEMS.API/            # Controllers, Middleware, Program.cs
│   └── SmartEMS.sln
└── frontend/
    └── smart-ems/               # Angular 19 standalone app
        └── src/app/
            ├── core/            # Guards, Interceptors, Services, Models
            ├── features/        # Auth, Dashboard, Employees, Departments
            ├── layouts/         # Main shell layout
            └── shared/          # Reusable components
```

---

## ⚙️ Backend Setup (ASP.NET Core)

### Step 1 — Install .NET 8 SDK
Download from: https://dotnet.microsoft.com/download/dotnet/8

### Step 2 — Configure SQL Server Connection
Edit `backend/SmartEMS.API/appsettings.json`:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=YOUR_SERVER;Database=SmartEMSDb;Trusted_Connection=True;TrustServerCertificate=True"
  }
}
```
Replace `YOUR_SERVER` with your SQL Server instance name (e.g., `localhost`, `.\SQLEXPRESS`, `(localdb)\MSSQLLocalDB`)

### Step 3 — Restore & Migrate
```powershell
cd backend\SmartEMS.API
dotnet restore
dotnet ef migrations add InitialCreate --project ..\SmartEMS.Infrastructure --startup-project .
dotnet ef database update --project ..\SmartEMS.Infrastructure --startup-project .
```

### Step 4 — Run the API
```powershell
dotnet run
```
API runs at: **https://localhost:7001**  
Swagger UI: **https://localhost:7001/swagger**

---

## 🎨 Frontend Setup (Angular)

### Step 1 — Install Dependencies
```powershell
cd frontend\smart-ems
npm install --legacy-peer-deps
```

### Step 2 — Run Development Server
```powershell
ng serve
```
App runs at: **http://localhost:4200**

---

## 🔐 Default Login Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@smartems.com | Admin@123 |
| **HR Manager** | hr@smartems.com | Hr@123456 |

---

## 📦 Key Features

### Authentication & Security
- ✅ JWT Bearer token authentication
- ✅ Password hashing with BCrypt
- ✅ Role-based authorization (Admin / HR / Employee)
- ✅ HTTP interceptors for auto token injection
- ✅ Route guards for protected pages
- ✅ Refresh token support

### Dashboard
- ✅ Animated stat cards (Total, Active, Departments, On Leave)
- ✅ Department distribution bar chart
- ✅ Gender distribution donut chart
- ✅ Monthly hiring trend bar chart
- ✅ Recently joined employees table

### Employee Management
- ✅ 5-step onboarding wizard with live validation
- ✅ Grid view (cards) + Table view (sortable, paginated)
- ✅ Real-time debounced search
- ✅ Multi-filter (department, status, type, date)
- ✅ Employee profile page with full details
- ✅ Inline edit form with prefill
- ✅ Soft delete (archive) + restore from archive
- ✅ Activity timeline / audit log
- ✅ Attendance summary
- ✅ Profile photo + resume upload
- ✅ Profile completion percentage
- ✅ Excel export

### Departments
- ✅ Card-based department grid
- ✅ Add/Edit via modal
- ✅ Employee count per department
- ✅ Delete protection (blocks if employees assigned)

### UI/UX
- ✅ Dark mode / Light mode toggle (persisted)
- ✅ Animated sidebar (collapsible)
- ✅ Toast notifications
- ✅ Loading spinners & skeleton loaders
- ✅ Empty state screens
- ✅ Confirmation dialogs
- ✅ Fully responsive (mobile-friendly)
- ✅ CSS design system with tokens

---

## 🗄️ Database Schema

| Table | Key Columns |
|-------|-------------|
| `Users` | Id, Username, Email, PasswordHash, Role, RefreshToken |
| `Employees` | Id, EmployeeCode, FullName, Email, DepartmentId, Status |
| `Departments` | Id, Name, Code, Description, ManagerId |
| `EmployeeActivities` | Id, EmployeeId, ActivityType, Description, PerformedBy |
| `Attendances` | Id, EmployeeId, Date, Status, CheckIn, CheckOut |

All tables use soft-delete (IsDeleted flag) and have CreatedAt/UpdatedAt timestamps.

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login & get JWT |
| POST | `/api/auth/register` | Register new user (Admin only) |
| POST | `/api/auth/refresh` | Refresh JWT token |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/me` | Current user info |

### Employees
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/employees` | List (paginated, filtered) |
| GET | `/api/employees/{id}` | Get by ID |
| POST | `/api/employees` | Create employee |
| PUT | `/api/employees/{id}` | Update employee |
| DELETE | `/api/employees/{id}` | Archive (soft delete) |
| PATCH | `/api/employees/{id}/restore` | Restore from archive |
| GET | `/api/employees/archived` | Get archived employees |
| GET | `/api/employees/dashboard` | Dashboard statistics |
| GET | `/api/employees/{id}/activities` | Activity log |
| GET | `/api/employees/{id}/attendance` | Attendance summary |
| POST | `/api/employees/{id}/photo` | Upload profile photo |
| POST | `/api/employees/{id}/resume` | Upload resume |
| GET | `/api/employees/export/excel` | Export to Excel |

### Departments
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/departments` | List all |
| GET | `/api/departments/{id}` | Get by ID |
| POST | `/api/departments` | Create (Admin) |
| PUT | `/api/departments/{id}` | Update (Admin) |
| DELETE | `/api/departments/{id}` | Delete (Admin) |

---

## 🧪 Sample Data

The database is seeded with:
- **5 departments**: Engineering, HR, Marketing, Finance, Operations
- **2 users**: Admin, HR Manager  
- **5 employees**: across departments with different statuses

---

## 🚀 Production Build

```powershell
# Backend
cd backend\SmartEMS.API
dotnet publish -c Release -o ./publish

# Frontend
cd frontend\smart-ems
ng build --configuration production
```

---

## 🛠️ Tech Stack Summary

**Backend:** ASP.NET Core 8 · Entity Framework Core 8 · SQL Server · JWT Authentication · BCrypt · AutoMapper · Serilog · Swagger/OpenAPI · ClosedXML

**Frontend:** Angular 19 · Angular Standalone Components · Reactive Forms · RxJS · TypeScript · SCSS · Chart.js · HTTP Interceptors · Route Guards

**Architecture:** Clean Architecture · Repository Pattern · Service Layer · DTO Pattern · Dependency Injection · Lazy Loading · Soft Delete

---

*Built for placement-level demonstration — SmartEMS 2026*
=======
# EMPLOYE-MANAGEMENT-SYSTEM
>>>>>>> b530491d18178bcb79ef383e2bb6bd5b1288b0b6
