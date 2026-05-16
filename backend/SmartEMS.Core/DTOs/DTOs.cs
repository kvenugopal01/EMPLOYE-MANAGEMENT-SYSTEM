using SmartEMS.Core.Enums;

namespace SmartEMS.Core.DTOs
{
    // Auth DTOs
    public class LoginDto
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class AuthResponseDto
    {
        public string Token { get; set; } = string.Empty;
        public string RefreshToken { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public int? EmployeeId { get; set; }
        public string? ProfilePhoto { get; set; }
        public DateTime Expiry { get; set; }
    }

    public class RegisterDto
    {
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public UserRole Role { get; set; } = UserRole.Employee;
    }

    // Employee DTOs
    public class CreateEmployeeDto
    {
        // Step 1: Personal
        public string FullName { get; set; } = string.Empty;
        public DateTime DateOfBirth { get; set; }
        public Gender Gender { get; set; }
        public string Phone { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string? EmergencyContact { get; set; }

        // Step 2: Professional
        public int? DepartmentId { get; set; }
        public string Designation { get; set; } = string.Empty;
        public DateTime JoiningDate { get; set; }
        public EmploymentType EmploymentType { get; set; } = EmploymentType.FullTime;
        public string? WorkLocation { get; set; }

        // Step 3: Salary & Role
        public decimal Salary { get; set; }
        public UserRole Role { get; set; } = UserRole.Employee;
        public int? ReportingManagerId { get; set; }
        public string? ShiftDetails { get; set; }
        public string? Skills { get; set; }
    }

    public class UpdateEmployeeDto
    {
        public string FullName { get; set; } = string.Empty;
        public DateTime DateOfBirth { get; set; }
        public Gender Gender { get; set; }
        public string Phone { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string? EmergencyContact { get; set; }
        public int? DepartmentId { get; set; }
        public string Designation { get; set; } = string.Empty;
        public DateTime JoiningDate { get; set; }
        public EmploymentType EmploymentType { get; set; }
        public string? WorkLocation { get; set; }
        public decimal Salary { get; set; }
        public UserRole Role { get; set; }
        public int? ReportingManagerId { get; set; }
        public string? ShiftDetails { get; set; }
        public string? Skills { get; set; }
        public EmployeeStatus Status { get; set; }
    }

    public class EmployeeDto
    {
        public int Id { get; set; }
        public string EmployeeCode { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public DateTime DateOfBirth { get; set; }
        public string Gender { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string? EmergencyContact { get; set; }
        public int? DepartmentId { get; set; }
        public string? DepartmentName { get; set; }
        public string Designation { get; set; } = string.Empty;
        public DateTime JoiningDate { get; set; }
        public string EmploymentType { get; set; } = string.Empty;
        public string? WorkLocation { get; set; }
        public decimal Salary { get; set; }
        public string Role { get; set; } = string.Empty;
        public int? ReportingManagerId { get; set; }
        public string? ReportingManagerName { get; set; }
        public string? ShiftDetails { get; set; }
        public string? ProfilePhotoUrl { get; set; }
        public string? ResumePath { get; set; }
        public string? IdProofPath { get; set; }
        public string Status { get; set; } = string.Empty;
        public string? Skills { get; set; }
        public int ProfileCompletion { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public int YearsOfExperience { get; set; }
    }

    public class EmployeeListDto
    {
        public int Id { get; set; }
        public string EmployeeCode { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? DepartmentName { get; set; }
        public string Designation { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string? ProfilePhotoUrl { get; set; }
        public string EmploymentType { get; set; } = string.Empty;
        public DateTime JoiningDate { get; set; }
        public string? WorkLocation { get; set; }
    }

    // Department DTOs
    public class CreateDepartmentDto
    {
        public string Name { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int? ManagerId { get; set; }
    }

    public class DepartmentDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int? ManagerId { get; set; }
        public string? ManagerName { get; set; }
        public int EmployeeCount { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    // Dashboard DTOs
    public class DashboardStatsDto
    {
        public int TotalEmployees { get; set; }
        public int ActiveEmployees { get; set; }
        public int TotalDepartments { get; set; }
        public int EmployeesOnLeave { get; set; }
        public int NewHiresThisMonth { get; set; }
        public List<DeptEmployeeCountDto> EmployeesByDepartment { get; set; } = new();
        public List<MonthlyHiringDto> MonthlyHiring { get; set; } = new();
        public List<GenderDistributionDto> GenderDistribution { get; set; } = new();
        public List<StatusDistributionDto> StatusDistribution { get; set; } = new();
        public List<EmployeeListDto> RecentlyJoined { get; set; } = new();
    }

    public class DeptEmployeeCountDto
    {
        public string Department { get; set; } = string.Empty;
        public int Count { get; set; }
    }

    public class MonthlyHiringDto
    {
        public string Month { get; set; } = string.Empty;
        public int Count { get; set; }
    }

    public class GenderDistributionDto
    {
        public string Gender { get; set; } = string.Empty;
        public int Count { get; set; }
    }

    public class StatusDistributionDto
    {
        public string Status { get; set; } = string.Empty;
        public int Count { get; set; }
    }

    // Pagination
    public class PagedResult<T>
    {
        public List<T> Data { get; set; } = new();
        public int TotalCount { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalPages => (int)Math.Ceiling((double)TotalCount / PageSize);
    }

    public class EmployeeQueryParams
    {
        public string? Search { get; set; }
        public int? DepartmentId { get; set; }
        public string? Role { get; set; }
        public string? Status { get; set; }
        public string? EmploymentType { get; set; }
        public DateTime? JoiningDateFrom { get; set; }
        public DateTime? JoiningDateTo { get; set; }
        public string? SortBy { get; set; } = "FullName";
        public string? SortOrder { get; set; } = "asc";
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 10;
    }

    // Activity DTOs
    public class ActivityDto
    {
        public int Id { get; set; }
        public int EmployeeId { get; set; }
        public string EmployeeName { get; set; } = string.Empty;
        public string ActivityType { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string? PerformedBy { get; set; }
        public string? OldValue { get; set; }
        public string? NewValue { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    // Attendance DTO
    public class AttendanceSummaryDto
    {
        public int PresentDays { get; set; }
        public int AbsentDays { get; set; }
        public int LeaveDays { get; set; }
        public int HalfDays { get; set; }
        public double AttendancePercentage { get; set; }
    }
}
