using SmartEMS.Core.Enums;

namespace SmartEMS.Core.Entities
{
    public class BaseEntity
    {
        public int Id { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        public bool IsDeleted { get; set; } = false;
    }

    public class User : BaseEntity
    {
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public UserRole Role { get; set; } = UserRole.Employee;
        public bool IsActive { get; set; } = true;
        public string? RefreshToken { get; set; }
        public DateTime? RefreshTokenExpiry { get; set; }
        public int? EmployeeId { get; set; }
        public Employee? Employee { get; set; }
    }

    public class Department : BaseEntity
    {
        public string Name { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int? ManagerId { get; set; }
        public Employee? Manager { get; set; }
        public ICollection<Employee> Employees { get; set; } = new List<Employee>();
    }

    public class Employee : BaseEntity
    {
        public string EmployeeCode { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public DateTime DateOfBirth { get; set; }
        public Gender Gender { get; set; }
        public string Phone { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string? EmergencyContact { get; set; }
        public int? DepartmentId { get; set; }
        public Department? Department { get; set; }
        public string Designation { get; set; } = string.Empty;
        public DateTime JoiningDate { get; set; }
        public EmploymentType EmploymentType { get; set; } = EmploymentType.FullTime;
        public string? WorkLocation { get; set; }
        public decimal Salary { get; set; }
        public UserRole Role { get; set; } = UserRole.Employee;
        public int? ReportingManagerId { get; set; }
        public Employee? ReportingManager { get; set; }
        public string? ShiftDetails { get; set; }
        public string? ProfilePhotoPath { get; set; }
        public string? ResumePath { get; set; }
        public string? IdProofPath { get; set; }
        public EmployeeStatus Status { get; set; } = EmployeeStatus.Active;
        public string? Skills { get; set; }
        public int ProfileCompletion { get; set; } = 0;
        public ICollection<EmployeeActivity> Activities { get; set; } = new List<EmployeeActivity>();
        public ICollection<Attendance> Attendances { get; set; } = new List<Attendance>();
    }

    public class EmployeeActivity : BaseEntity
    {
        public int EmployeeId { get; set; }
        public Employee Employee { get; set; } = null!;
        public ActivityType ActivityType { get; set; }
        public string Description { get; set; } = string.Empty;
        public string? PerformedBy { get; set; }
        public string? OldValue { get; set; }
        public string? NewValue { get; set; }
    }

    public class Attendance : BaseEntity
    {
        public int EmployeeId { get; set; }
        public Employee Employee { get; set; } = null!;
        public DateTime Date { get; set; }
        public TimeSpan? CheckIn { get; set; }
        public TimeSpan? CheckOut { get; set; }
        public string Status { get; set; } = "Present"; // Present, Absent, Leave, Half-day
        public string? Notes { get; set; }
    }
}
