-- =============================================
-- SmartEMS Database Setup Script
-- Run this in SQL Server Management Studio
-- =============================================

-- Create Database
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'SmartEMSDb')
BEGIN
    CREATE DATABASE SmartEMSDb;
END
GO

USE SmartEMSDb;
GO

-- =============================================
-- This script is for reference only.
-- EF Core migrations will auto-create tables.
-- Run from backend:
--   dotnet ef database update
-- =============================================

-- Manual seed verification query:
SELECT 'Departments' AS TableName, COUNT(*) AS Records FROM Departments
UNION ALL
SELECT 'Users', COUNT(*) FROM Users
UNION ALL
SELECT 'Employees', COUNT(*) FROM Employees
UNION ALL
SELECT 'EmployeeActivities', COUNT(*) FROM EmployeeActivities
UNION ALL
SELECT 'Attendances', COUNT(*) FROM Attendances;

-- View all employees with department:
SELECT 
    e.EmployeeCode,
    e.FullName,
    e.Email,
    d.Name AS Department,
    e.Designation,
    e.Status,
    e.JoiningDate
FROM Employees e
LEFT JOIN Departments d ON e.DepartmentId = d.Id
WHERE e.IsDeleted = 0
ORDER BY e.JoiningDate DESC;

-- View all users:
SELECT Id, Username, Email, Role, IsActive, CreatedAt FROM Users;
