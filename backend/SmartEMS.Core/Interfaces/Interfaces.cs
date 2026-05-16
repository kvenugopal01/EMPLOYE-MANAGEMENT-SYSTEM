using SmartEMS.Core.DTOs;
using SmartEMS.Core.Entities;
using SmartEMS.Core.Enums;

namespace SmartEMS.Core.Interfaces
{
    public interface IRepository<T> where T : BaseEntity
    {
        Task<T?> GetByIdAsync(int id);
        Task<IEnumerable<T>> GetAllAsync();
        Task<T> AddAsync(T entity);
        Task<T> UpdateAsync(T entity);
        Task DeleteAsync(int id);
    }

    public interface IEmployeeRepository : IRepository<Employee>
    {
        Task<PagedResult<Employee>> GetPagedAsync(EmployeeQueryParams query);
        Task<Employee?> GetByEmailAsync(string email);
        Task<Employee?> GetByEmployeeCodeAsync(string code);
        Task<Employee?> GetWithDetailsAsync(int id);
        Task<List<Employee>> GetRecentlyJoinedAsync(int count = 5);
        Task<List<Employee>> GetArchivedAsync();
        Task<string> GenerateEmployeeCodeAsync();
        Task<int> GetTotalCountAsync();
        Task<int> GetActiveCountAsync();
        Task<int> GetOnLeaveCountAsync();
        Task<int> GetNewHiresThisMonthAsync();
        // Strongly typed — replaces old List<object>
        Task<List<DeptEmployeeCountDto>> GetEmployeesByDepartmentAsync();
        Task<List<MonthlyHiringDto>> GetMonthlyHiringAsync();
        Task<List<GenderDistributionDto>> GetGenderDistributionAsync();
        Task<List<StatusDistributionDto>> GetStatusDistributionAsync();
    }

    public interface IDepartmentRepository : IRepository<Department>
    {
        Task<Department?> GetByCodeAsync(string code);
        Task<Department?> GetWithManagerAsync(int id);
        Task<List<Department>> GetAllWithCountAsync();
    }

    public interface IUserRepository : IRepository<User>
    {
        Task<User?> GetByEmailAsync(string email);
        Task<User?> GetByUsernameAsync(string username);
        Task<User?> GetByRefreshTokenAsync(string refreshToken);
    }

    public interface IActivityRepository : IRepository<EmployeeActivity>
    {
        Task<List<EmployeeActivity>> GetByEmployeeIdAsync(int employeeId);
        Task<List<EmployeeActivity>> GetRecentActivitiesAsync(int count = 20);
        Task LogActivityAsync(int employeeId, ActivityType activityType,
            string description, string? performedBy = null,
            string? oldValue = null, string? newValue = null);
    }

    public interface IAttendanceRepository : IRepository<Attendance>
    {
        Task<AttendanceSummaryDto> GetSummaryAsync(int employeeId, int year, int month);
        Task<List<Attendance>> GetByEmployeeAsync(int employeeId, DateTime from, DateTime to);
    }

    // ─── Services ─────────────────────────────────────────────────────────────

    public interface IAuthService
    {
        Task<AuthResponseDto?> LoginAsync(LoginDto dto);
        Task<AuthResponseDto?> RegisterAsync(RegisterDto dto);
        Task<AuthResponseDto?> RefreshTokenAsync(string refreshToken);
        Task LogoutAsync(int userId);
    }

    public interface IEmployeeService
    {
        Task<PagedResult<EmployeeListDto>> GetAllAsync(EmployeeQueryParams query);
        Task<EmployeeDto?> GetByIdAsync(int id);
        Task<EmployeeDto> CreateAsync(CreateEmployeeDto dto, string createdBy);
        Task<EmployeeDto?> UpdateAsync(int id, UpdateEmployeeDto dto, string updatedBy);
        Task<bool> ArchiveAsync(int id, string archivedBy);
        Task<bool> RestoreAsync(int id, string restoredBy);
        Task<List<EmployeeDto>> GetArchivedAsync();
        Task<bool> UpdatePhotoAsync(int id, string photoPath);
        Task<DashboardStatsDto> GetDashboardStatsAsync();
        Task<List<ActivityDto>> GetActivitiesAsync(int employeeId);
        Task<AttendanceSummaryDto> GetAttendanceSummaryAsync(int employeeId, int year, int month);
    }

    public interface IDepartmentService
    {
        Task<List<DepartmentDto>> GetAllAsync();
        Task<DepartmentDto?> GetByIdAsync(int id);
        Task<DepartmentDto> CreateAsync(CreateDepartmentDto dto);
        Task<DepartmentDto?> UpdateAsync(int id, CreateDepartmentDto dto);
        Task<bool> DeleteAsync(int id);
    }
}
