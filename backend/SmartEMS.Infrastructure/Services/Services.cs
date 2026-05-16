using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using SmartEMS.Core.DTOs;
using SmartEMS.Core.Entities;
using SmartEMS.Core.Enums;
using SmartEMS.Core.Interfaces;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace SmartEMS.Infrastructure.Services
{
    public class AuthService : IAuthService
    {
        private readonly IUserRepository _userRepo;
        private readonly IConfiguration _config;

        public AuthService(IUserRepository userRepo, IConfiguration config)
        {
            _userRepo = userRepo;
            _config = config;
        }

        public async Task<AuthResponseDto?> LoginAsync(LoginDto dto)
        {
            var user = await _userRepo.GetByEmailAsync(dto.Email);
            if (user == null || !user.IsActive) return null;
            if (!BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash)) return null;

            var token = GenerateJwtToken(user);
            var refreshToken = GenerateRefreshToken();
            var expiryHours = _config.GetValue<int>("Jwt:ExpiryHours", 8);

            user.RefreshToken = refreshToken;
            user.RefreshTokenExpiry = DateTime.UtcNow.AddDays(7);
            await _userRepo.UpdateAsync(user);

            return new AuthResponseDto
            {
                Token = token,
                RefreshToken = refreshToken,
                Username = user.Username,
                Email = user.Email,
                Role = user.Role.ToString(),
                EmployeeId = user.EmployeeId,
                Expiry = DateTime.UtcNow.AddHours(expiryHours)
            };
        }

        public async Task<AuthResponseDto?> RegisterAsync(RegisterDto dto)
        {
            var existing = await _userRepo.GetByEmailAsync(dto.Email);
            if (existing != null) return null;

            var user = new User
            {
                Username = dto.Username,
                Email = dto.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                Role = dto.Role,
                IsActive = true
            };

            await _userRepo.AddAsync(user);
            return await LoginAsync(new LoginDto { Email = dto.Email, Password = dto.Password });
        }

        public async Task<AuthResponseDto?> RefreshTokenAsync(string refreshToken)
        {
            var user = await _userRepo.GetByRefreshTokenAsync(refreshToken);
            if (user == null || user.RefreshTokenExpiry < DateTime.UtcNow) return null;

            var newToken = GenerateJwtToken(user);
            var newRefreshToken = GenerateRefreshToken();
            var expiryHours = _config.GetValue<int>("Jwt:ExpiryHours", 8);

            user.RefreshToken = newRefreshToken;
            user.RefreshTokenExpiry = DateTime.UtcNow.AddDays(7);
            await _userRepo.UpdateAsync(user);

            return new AuthResponseDto
            {
                Token = newToken,
                RefreshToken = newRefreshToken,
                Username = user.Username,
                Email = user.Email,
                Role = user.Role.ToString(),
                EmployeeId = user.EmployeeId,
                Expiry = DateTime.UtcNow.AddHours(expiryHours)
            };
        }

        public async Task LogoutAsync(int userId)
        {
            var user = await _userRepo.GetByIdAsync(userId);
            if (user != null)
            {
                user.RefreshToken = null;
                user.RefreshTokenExpiry = null;
                await _userRepo.UpdateAsync(user);
            }
        }

        private string GenerateJwtToken(User user)
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var expiryHours = _config.GetValue<int>("Jwt:ExpiryHours", 8);

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, user.Email),
                new Claim(JwtRegisteredClaimNames.Name, user.Username),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Role, user.Role.ToString()),
                new Claim("employeeId", user.EmployeeId?.ToString() ?? "")
            };

            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"],
                audience: _config["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddHours(expiryHours),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private static string GenerateRefreshToken()
        {
            var bytes = new byte[64];
            RandomNumberGenerator.Fill(bytes);
            return Convert.ToBase64String(bytes);
        }
    }

    public class EmployeeService : IEmployeeService
    {
        private readonly IEmployeeRepository _empRepo;
        private readonly IDepartmentRepository _deptRepo;
        private readonly IActivityRepository _activityRepo;
        private readonly IAttendanceRepository _attendanceRepo;
        private readonly IConfiguration _config;

        public EmployeeService(
            IEmployeeRepository empRepo,
            IDepartmentRepository deptRepo,
            IActivityRepository activityRepo,
            IAttendanceRepository attendanceRepo,
            IConfiguration config)
        {
            _empRepo = empRepo;
            _deptRepo = deptRepo;
            _activityRepo = activityRepo;
            _attendanceRepo = attendanceRepo;
            _config = config;
        }

        public async Task<PagedResult<EmployeeListDto>> GetAllAsync(EmployeeQueryParams query)
        {
            var result = await _empRepo.GetPagedAsync(query);
            var baseUrl = GetBaseUrl();
            return new PagedResult<EmployeeListDto>
            {
                Data = result.Data.Select(e => MapToListDto(e, baseUrl)).ToList(),
                TotalCount = result.TotalCount,
                Page = result.Page,
                PageSize = result.PageSize
            };
        }

        public async Task<EmployeeDto?> GetByIdAsync(int id)
        {
            var emp = await _empRepo.GetWithDetailsAsync(id);
            if (emp == null) return null;
            return MapToDto(emp, GetBaseUrl());
        }

        public async Task<EmployeeDto> CreateAsync(CreateEmployeeDto dto, string createdBy)
        {
            var code = await _empRepo.GenerateEmployeeCodeAsync();
            var emp = new Employee
            {
                EmployeeCode = code,
                FullName = dto.FullName.Trim(),
                DateOfBirth = dto.DateOfBirth,
                Gender = dto.Gender,
                Phone = dto.Phone.Trim(),
                Email = dto.Email.Trim().ToLower(),
                Address = dto.Address.Trim(),
                EmergencyContact = dto.EmergencyContact,
                DepartmentId = dto.DepartmentId,
                Designation = dto.Designation.Trim(),
                JoiningDate = dto.JoiningDate,
                EmploymentType = dto.EmploymentType,
                WorkLocation = dto.WorkLocation,
                Salary = dto.Salary,
                Role = dto.Role,
                ReportingManagerId = dto.ReportingManagerId,
                ShiftDetails = dto.ShiftDetails,
                Skills = dto.Skills,
                Status = EmployeeStatus.Active
            };

            emp.ProfileCompletion = CalculateProfileCompletion(emp);
            var created = await _empRepo.AddAsync(emp);

            await _activityRepo.LogActivityAsync(created.Id, ActivityType.Created,
                $"Employee {created.FullName} (ID: {created.EmployeeCode}) was added to the system",
                createdBy);

            return (await GetByIdAsync(created.Id))!;
        }

        public async Task<EmployeeDto?> UpdateAsync(int id, UpdateEmployeeDto dto, string updatedBy)
        {
            var emp = await _empRepo.GetByIdAsync(id);
            if (emp == null) return null;

            var oldDept = emp.DepartmentId;
            var oldSalary = emp.Salary;
            var oldRole = emp.Role;
            var oldStatus = emp.Status;

            emp.FullName = dto.FullName.Trim();
            emp.DateOfBirth = dto.DateOfBirth;
            emp.Gender = dto.Gender;
            emp.Phone = dto.Phone.Trim();
            emp.Email = dto.Email.Trim().ToLower();
            emp.Address = dto.Address.Trim();
            emp.EmergencyContact = dto.EmergencyContact;
            emp.DepartmentId = dto.DepartmentId;
            emp.Designation = dto.Designation.Trim();
            emp.JoiningDate = dto.JoiningDate;
            emp.EmploymentType = dto.EmploymentType;
            emp.WorkLocation = dto.WorkLocation;
            emp.Salary = dto.Salary;
            emp.Role = dto.Role;
            emp.ReportingManagerId = dto.ReportingManagerId;
            emp.ShiftDetails = dto.ShiftDetails;
            emp.Skills = dto.Skills;
            emp.Status = dto.Status;
            emp.ProfileCompletion = CalculateProfileCompletion(emp);

            await _empRepo.UpdateAsync(emp);

            // Log specific meaningful changes
            if (oldDept != dto.DepartmentId)
                await _activityRepo.LogActivityAsync(id, ActivityType.DepartmentChanged,
                    "Department was changed", updatedBy,
                    oldDept?.ToString(), dto.DepartmentId?.ToString());

            if (oldSalary != dto.Salary)
                await _activityRepo.LogActivityAsync(id, ActivityType.SalaryModified,
                    "Salary was updated", updatedBy,
                    oldSalary.ToString("C"), dto.Salary.ToString("C"));

            if (oldRole != dto.Role)
                await _activityRepo.LogActivityAsync(id, ActivityType.RoleChanged,
                    $"Role changed from {oldRole} to {dto.Role}", updatedBy,
                    oldRole.ToString(), dto.Role.ToString());

            if (oldStatus != dto.Status)
                await _activityRepo.LogActivityAsync(id, ActivityType.StatusChanged,
                    $"Status changed from {oldStatus} to {dto.Status}", updatedBy,
                    oldStatus.ToString(), dto.Status.ToString());

            await _activityRepo.LogActivityAsync(id, ActivityType.Updated,
                "Employee profile was updated", updatedBy);

            return await GetByIdAsync(id);
        }

        public async Task<bool> ArchiveAsync(int id, string archivedBy)
        {
            var emp = await _empRepo.GetByIdAsync(id);
            if (emp == null) return false;
            emp.Status = EmployeeStatus.Archived;
            await _empRepo.UpdateAsync(emp);
            await _empRepo.DeleteAsync(id);
            await _activityRepo.LogActivityAsync(id, ActivityType.Archived,
                $"Employee {emp.FullName} was archived", archivedBy);
            return true;
        }

        public async Task<bool> RestoreAsync(int id, string restoredBy)
        {
            var archived = await _empRepo.GetArchivedAsync();
            var emp = archived.FirstOrDefault(e => e.Id == id);
            if (emp == null) return false;

            emp.IsDeleted = false;
            emp.Status = EmployeeStatus.Active;
            emp.UpdatedAt = DateTime.UtcNow;
            await _empRepo.UpdateAsync(emp);

            await _activityRepo.LogActivityAsync(id, ActivityType.Restored,
                $"Employee {emp.FullName} was restored from archive", restoredBy);
            return true;
        }

        public async Task<List<EmployeeDto>> GetArchivedAsync()
        {
            var employees = await _empRepo.GetArchivedAsync();
            var baseUrl = GetBaseUrl();
            return employees.Select(e => MapToDto(e, baseUrl)).ToList();
        }

        public async Task<bool> UpdatePhotoAsync(int id, string photoPath)
        {
            var emp = await _empRepo.GetByIdAsync(id);
            if (emp == null) return false;
            emp.ProfilePhotoPath = photoPath;
            emp.ProfileCompletion = CalculateProfileCompletion(emp);
            await _empRepo.UpdateAsync(emp);
            return true;
        }

        public async Task<DashboardStatsDto> GetDashboardStatsAsync()
        {
            var baseUrl = GetBaseUrl();

            // Use parallel async to improve performance
            var totalTask = _empRepo.GetTotalCountAsync();
            var activeTask = _empRepo.GetActiveCountAsync();
            var onLeaveTask = _empRepo.GetOnLeaveCountAsync();
            var newHiresTask = _empRepo.GetNewHiresThisMonthAsync();
            var deptsTask = _deptRepo.GetAllWithCountAsync();
            var recentTask = _empRepo.GetRecentlyJoinedAsync(8);
            var deptDataTask = _empRepo.GetEmployeesByDepartmentAsync();
            var monthlyTask = _empRepo.GetMonthlyHiringAsync();
            var genderTask = _empRepo.GetGenderDistributionAsync();
            var statusTask = _empRepo.GetStatusDistributionAsync();

            await Task.WhenAll(totalTask, activeTask, onLeaveTask, newHiresTask,
                deptsTask, recentTask, deptDataTask, monthlyTask, genderTask, statusTask);

            return new DashboardStatsDto
            {
                TotalEmployees = await totalTask,
                ActiveEmployees = await activeTask,
                TotalDepartments = (await deptsTask).Count,
                EmployeesOnLeave = await onLeaveTask,
                NewHiresThisMonth = await newHiresTask,
                RecentlyJoined = (await recentTask).Select(e => MapToListDto(e, baseUrl)).ToList(),
                EmployeesByDepartment = await deptDataTask,
                MonthlyHiring = await monthlyTask,
                GenderDistribution = await genderTask,
                StatusDistribution = await statusTask
            };
        }

        public async Task<List<ActivityDto>> GetActivitiesAsync(int employeeId)
        {
            var activities = await _activityRepo.GetByEmployeeIdAsync(employeeId);
            return activities.Select(a => new ActivityDto
            {
                Id = a.Id,
                EmployeeId = a.EmployeeId,
                EmployeeName = a.Employee?.FullName ?? "",
                ActivityType = a.ActivityType.ToString(),
                Description = a.Description,
                PerformedBy = a.PerformedBy,
                OldValue = a.OldValue,
                NewValue = a.NewValue,
                CreatedAt = a.CreatedAt
            }).ToList();
        }

        public async Task<AttendanceSummaryDto> GetAttendanceSummaryAsync(int employeeId, int year, int month) =>
            await _attendanceRepo.GetSummaryAsync(employeeId, year, month);

        private string GetBaseUrl() =>
            _config["AppSettings:BaseUrl"] ?? "https://localhost:7001";

        private static int CalculateProfileCompletion(Employee emp)
        {
            var score = 0;
            if (!string.IsNullOrEmpty(emp.FullName)) score += 10;
            if (emp.DateOfBirth != default) score += 5;
            if (!string.IsNullOrEmpty(emp.Phone)) score += 10;
            if (!string.IsNullOrEmpty(emp.Email)) score += 10;
            if (!string.IsNullOrEmpty(emp.Address)) score += 5;
            if (emp.DepartmentId.HasValue) score += 10;
            if (!string.IsNullOrEmpty(emp.Designation)) score += 10;
            if (emp.Salary > 0) score += 10;
            if (!string.IsNullOrEmpty(emp.ProfilePhotoPath)) score += 10;
            if (!string.IsNullOrEmpty(emp.ResumePath)) score += 10;
            if (!string.IsNullOrEmpty(emp.Skills)) score += 5;
            if (!string.IsNullOrEmpty(emp.EmergencyContact)) score += 5;
            return Math.Min(score, 100);
        }

        private static EmployeeListDto MapToListDto(Employee e, string baseUrl) => new()
        {
            Id = e.Id,
            EmployeeCode = e.EmployeeCode,
            FullName = e.FullName,
            Email = e.Email,
            DepartmentName = e.Department?.Name,
            Designation = e.Designation,
            Status = e.Status.ToString(),
            ProfilePhotoUrl = e.ProfilePhotoPath != null
                ? $"{baseUrl}/uploads/{e.ProfilePhotoPath}"
                : null,
            EmploymentType = e.EmploymentType.ToString(),
            JoiningDate = e.JoiningDate,
            WorkLocation = e.WorkLocation
        };

        private static EmployeeDto MapToDto(Employee e, string baseUrl) => new()
        {
            Id = e.Id,
            EmployeeCode = e.EmployeeCode,
            FullName = e.FullName,
            DateOfBirth = e.DateOfBirth,
            Gender = e.Gender.ToString(),
            Phone = e.Phone,
            Email = e.Email,
            Address = e.Address,
            EmergencyContact = e.EmergencyContact,
            DepartmentId = e.DepartmentId,
            DepartmentName = e.Department?.Name,
            Designation = e.Designation,
            JoiningDate = e.JoiningDate,
            EmploymentType = e.EmploymentType.ToString(),
            WorkLocation = e.WorkLocation,
            Salary = e.Salary,
            Role = e.Role.ToString(),
            ReportingManagerId = e.ReportingManagerId,
            ReportingManagerName = e.ReportingManager?.FullName,
            ShiftDetails = e.ShiftDetails,
            ProfilePhotoUrl = e.ProfilePhotoPath != null
                ? $"{baseUrl}/uploads/{e.ProfilePhotoPath}"
                : null,
            ResumePath = e.ResumePath,
            IdProofPath = e.IdProofPath,
            Status = e.Status.ToString(),
            Skills = e.Skills,
            ProfileCompletion = e.ProfileCompletion,
            CreatedAt = e.CreatedAt,
            UpdatedAt = e.UpdatedAt,
            YearsOfExperience = e.JoiningDate != default
                ? Math.Max(0, (int)((DateTime.UtcNow - e.JoiningDate).TotalDays / 365.25))
                : 0
        };
    }

    public class DepartmentService : IDepartmentService
    {
        private readonly IDepartmentRepository _repo;

        public DepartmentService(IDepartmentRepository repo)
        {
            _repo = repo;
        }

        public async Task<List<DepartmentDto>> GetAllAsync()
        {
            var depts = await _repo.GetAllWithCountAsync();
            return depts.Select(d => new DepartmentDto
            {
                Id = d.Id,
                Name = d.Name,
                Code = d.Code,
                Description = d.Description,
                ManagerId = d.ManagerId,
                ManagerName = d.Manager?.FullName,
                EmployeeCount = d.Employees?.Count ?? 0,
                CreatedAt = d.CreatedAt
            }).ToList();
        }

        public async Task<DepartmentDto?> GetByIdAsync(int id)
        {
            var dept = await _repo.GetWithManagerAsync(id);
            if (dept == null) return null;
            return new DepartmentDto
            {
                Id = dept.Id,
                Name = dept.Name,
                Code = dept.Code,
                Description = dept.Description,
                ManagerId = dept.ManagerId,
                ManagerName = dept.Manager?.FullName,
                EmployeeCount = dept.Employees?.Count ?? 0,
                CreatedAt = dept.CreatedAt
            };
        }

        public async Task<DepartmentDto> CreateAsync(CreateDepartmentDto dto)
        {
            var dept = new Department
            {
                Name = dto.Name.Trim(),
                Code = dto.Code.Trim().ToUpper(),
                Description = dto.Description?.Trim(),
                ManagerId = dto.ManagerId
            };
            var created = await _repo.AddAsync(dept);
            return (await GetByIdAsync(created.Id))!;
        }

        public async Task<DepartmentDto?> UpdateAsync(int id, CreateDepartmentDto dto)
        {
            var dept = await _repo.GetByIdAsync(id);
            if (dept == null) return null;
            dept.Name = dto.Name.Trim();
            dept.Code = dto.Code.Trim().ToUpper();
            dept.Description = dto.Description?.Trim();
            dept.ManagerId = dto.ManagerId;
            await _repo.UpdateAsync(dept);
            return await GetByIdAsync(id);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var dept = await _repo.GetWithManagerAsync(id);
            if (dept == null) return false;
            if (dept.Employees?.Any() == true)
                throw new InvalidOperationException($"Cannot delete department with {dept.Employees.Count} employees assigned.");
            await _repo.DeleteAsync(id);
            return true;
        }
    }
}
