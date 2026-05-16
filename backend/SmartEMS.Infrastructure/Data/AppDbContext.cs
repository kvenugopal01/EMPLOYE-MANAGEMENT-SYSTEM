using Microsoft.EntityFrameworkCore;
using SmartEMS.Core.Entities;
using SmartEMS.Core.Enums;

namespace SmartEMS.Infrastructure.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<Employee> Employees { get; set; }
        public DbSet<Department> Departments { get; set; }
        public DbSet<EmployeeActivity> EmployeeActivities { get; set; }
        public DbSet<Attendance> Attendances { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Global soft delete filter
            modelBuilder.Entity<Employee>().HasQueryFilter(e => !e.IsDeleted);
            modelBuilder.Entity<Department>().HasQueryFilter(d => !d.IsDeleted);
            modelBuilder.Entity<User>().HasQueryFilter(u => !u.IsDeleted);

            // Employee relationships
            modelBuilder.Entity<Employee>()
                .HasOne(e => e.Department)
                .WithMany(d => d.Employees)
                .HasForeignKey(e => e.DepartmentId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<Employee>()
                .HasOne(e => e.ReportingManager)
                .WithMany()
                .HasForeignKey(e => e.ReportingManagerId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<Department>()
                .HasOne(d => d.Manager)
                .WithMany()
                .HasForeignKey(d => d.ManagerId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<User>()
                .HasOne(u => u.Employee)
                .WithMany()
                .HasForeignKey(u => u.EmployeeId)
                .OnDelete(DeleteBehavior.SetNull);

            // Decimal precision
            modelBuilder.Entity<Employee>()
                .Property(e => e.Salary)
                .HasColumnType("decimal(18,2)");

            // Indexes
            modelBuilder.Entity<Employee>().HasIndex(e => e.EmployeeCode).IsUnique();
            modelBuilder.Entity<Employee>().HasIndex(e => e.Email).IsUnique();
            modelBuilder.Entity<User>().HasIndex(u => u.Email).IsUnique();
            modelBuilder.Entity<Department>().HasIndex(d => d.Code).IsUnique();

            // Seed Data
            SeedData(modelBuilder);
        }

        private void SeedData(ModelBuilder modelBuilder)
        {
            // Seed Departments
            modelBuilder.Entity<Department>().HasData(
                new Department { Id = 1, Name = "Engineering", Code = "ENG", Description = "Software Engineering team", CreatedAt = new DateTime(2024, 1, 1) },
                new Department { Id = 2, Name = "Human Resources", Code = "HR", Description = "HR & People Operations", CreatedAt = new DateTime(2024, 1, 1) },
                new Department { Id = 3, Name = "Marketing", Code = "MKT", Description = "Marketing & Growth", CreatedAt = new DateTime(2024, 1, 1) },
                new Department { Id = 4, Name = "Finance", Code = "FIN", Description = "Finance & Accounting", CreatedAt = new DateTime(2024, 1, 1) },
                new Department { Id = 5, Name = "Operations", Code = "OPS", Description = "Operations & Logistics", CreatedAt = new DateTime(2024, 1, 1) }
            );

            // Seed Admin User (password: Admin@123)
            var adminPasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123");
            var hrPasswordHash = BCrypt.Net.BCrypt.HashPassword("Hr@123456");
            
            modelBuilder.Entity<User>().HasData(
                new User
                {
                    Id = 1,
                    Username = "admin",
                    Email = "admin@smartems.com",
                    PasswordHash = adminPasswordHash,
                    Role = UserRole.Admin,
                    IsActive = true,
                    CreatedAt = new DateTime(2024, 1, 1)
                },
                new User
                {
                    Id = 2,
                    Username = "hrmanager",
                    Email = "hr@smartems.com",
                    PasswordHash = hrPasswordHash,
                    Role = UserRole.HR,
                    IsActive = true,
                    CreatedAt = new DateTime(2024, 1, 1)
                }
            );

            // Seed Sample Employees
            modelBuilder.Entity<Employee>().HasData(
                new Employee
                {
                    Id = 1, EmployeeCode = "EMP001", FullName = "Rajesh Kumar", Gender = Gender.Male,
                    DateOfBirth = new DateTime(1990, 5, 15), Phone = "9876543210", Email = "rajesh@smartems.com",
                    Address = "123 MG Road, Bangalore", DepartmentId = 1, Designation = "Senior Software Engineer",
                    JoiningDate = new DateTime(2022, 3, 1), EmploymentType = EmploymentType.FullTime,
                    WorkLocation = "Bangalore HQ", Salary = 1200000, Role = UserRole.Employee,
                    Status = EmployeeStatus.Active, Skills = "C#, .NET, Angular, SQL",
                    ProfileCompletion = 90, CreatedAt = new DateTime(2022, 3, 1)
                },
                new Employee
                {
                    Id = 2, EmployeeCode = "EMP002", FullName = "Priya Sharma", Gender = Gender.Female,
                    DateOfBirth = new DateTime(1993, 8, 22), Phone = "9876543211", Email = "priya@smartems.com",
                    Address = "456 Anna Nagar, Chennai", DepartmentId = 2, Designation = "HR Manager",
                    JoiningDate = new DateTime(2021, 6, 15), EmploymentType = EmploymentType.FullTime,
                    WorkLocation = "Chennai Office", Salary = 900000, Role = UserRole.HR,
                    Status = EmployeeStatus.Active, Skills = "Recruitment, HRMS, Payroll",
                    ProfileCompletion = 85, CreatedAt = new DateTime(2021, 6, 15)
                },
                new Employee
                {
                    Id = 3, EmployeeCode = "EMP003", FullName = "Amit Patel", Gender = Gender.Male,
                    DateOfBirth = new DateTime(1988, 12, 10), Phone = "9876543212", Email = "amit@smartems.com",
                    Address = "789 SG Highway, Ahmedabad", DepartmentId = 3, Designation = "Marketing Lead",
                    JoiningDate = new DateTime(2023, 1, 10), EmploymentType = EmploymentType.FullTime,
                    WorkLocation = "Ahmedabad Office", Salary = 850000, Role = UserRole.Employee,
                    Status = EmployeeStatus.Active, Skills = "Digital Marketing, SEO, Analytics",
                    ProfileCompletion = 80, CreatedAt = new DateTime(2023, 1, 10)
                },
                new Employee
                {
                    Id = 4, EmployeeCode = "EMP004", FullName = "Sneha Reddy", Gender = Gender.Female,
                    DateOfBirth = new DateTime(1995, 3, 18), Phone = "9876543213", Email = "sneha@smartems.com",
                    Address = "321 Jubilee Hills, Hyderabad", DepartmentId = 4, Designation = "Financial Analyst",
                    JoiningDate = new DateTime(2023, 7, 1), EmploymentType = EmploymentType.FullTime,
                    WorkLocation = "Hyderabad HQ", Salary = 780000, Role = UserRole.Employee,
                    Status = EmployeeStatus.OnLeave, Skills = "Excel, Power BI, Finance Modeling",
                    ProfileCompletion = 75, CreatedAt = new DateTime(2023, 7, 1)
                },
                new Employee
                {
                    Id = 5, EmployeeCode = "EMP005", FullName = "Vikram Singh", Gender = Gender.Male,
                    DateOfBirth = new DateTime(1991, 7, 5), Phone = "9876543214", Email = "vikram@smartems.com",
                    Address = "654 Sector 18, Noida", DepartmentId = 1, Designation = "Full Stack Developer",
                    JoiningDate = new DateTime(2024, 2, 15), EmploymentType = EmploymentType.Contract,
                    WorkLocation = "Remote", Salary = 1100000, Role = UserRole.Employee,
                    Status = EmployeeStatus.Active, Skills = "React, Node.js, MongoDB, AWS",
                    ProfileCompletion = 70, CreatedAt = new DateTime(2024, 2, 15)
                }
            );
        }
    }
}
