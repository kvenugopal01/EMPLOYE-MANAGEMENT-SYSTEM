using Microsoft.EntityFrameworkCore;
using SmartEMS.Core.DTOs;
using SmartEMS.Core.Entities;
using SmartEMS.Core.Enums;
using SmartEMS.Core.Interfaces;
using SmartEMS.Infrastructure.Data;

namespace SmartEMS.Infrastructure.Repositories
{
    public class BaseRepository<T> : IRepository<T> where T : BaseEntity
    {
        protected readonly AppDbContext _context;
        protected readonly DbSet<T> _dbSet;

        public BaseRepository(AppDbContext context)
        {
            _context = context;
            _dbSet = context.Set<T>();
        }

        public virtual async Task<T?> GetByIdAsync(int id) =>
            await _dbSet.FirstOrDefaultAsync(e => e.Id == id);

        public virtual async Task<IEnumerable<T>> GetAllAsync() =>
            await _dbSet.ToListAsync();

        public virtual async Task<T> AddAsync(T entity)
        {
            await _dbSet.AddAsync(entity);
            await _context.SaveChangesAsync();
            return entity;
        }

        public virtual async Task<T> UpdateAsync(T entity)
        {
            entity.UpdatedAt = DateTime.UtcNow;
            _context.Entry(entity).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return entity;
        }

        public virtual async Task DeleteAsync(int id)
        {
            var entity = await GetByIdAsync(id);
            if (entity != null)
            {
                entity.IsDeleted = true;
                entity.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();
            }
        }
    }

    public class EmployeeRepository : BaseRepository<Employee>, IEmployeeRepository
    {
        public EmployeeRepository(AppDbContext context) : base(context) { }

        public override async Task<Employee?> GetByIdAsync(int id) =>
            await _context.Employees
                .Include(e => e.Department)
                .Include(e => e.ReportingManager)
                .FirstOrDefaultAsync(e => e.Id == id);

        public async Task<Employee?> GetWithDetailsAsync(int id) =>
            await _context.Employees
                .Include(e => e.Department)
                .Include(e => e.ReportingManager)
                .Include(e => e.Activities.OrderByDescending(a => a.CreatedAt).Take(10))
                .Include(e => e.Attendances.OrderByDescending(a => a.Date).Take(30))
                .FirstOrDefaultAsync(e => e.Id == id);

        public async Task<Employee?> GetByEmailAsync(string email) =>
            await _context.Employees.FirstOrDefaultAsync(e => e.Email == email);

        public async Task<Employee?> GetByEmployeeCodeAsync(string code) =>
            await _context.Employees.FirstOrDefaultAsync(e => e.EmployeeCode == code);

        public async Task<PagedResult<Employee>> GetPagedAsync(EmployeeQueryParams query)
        {
            var q = _context.Employees
                .Include(e => e.Department)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(query.Search))
            {
                var s = query.Search.Trim().ToLower();
                q = q.Where(e =>
                    e.FullName.ToLower().Contains(s) ||
                    e.Email.ToLower().Contains(s) ||
                    e.EmployeeCode.ToLower().Contains(s) ||
                    e.Designation.ToLower().Contains(s) ||
                    (e.Department != null && e.Department.Name.ToLower().Contains(s)));
            }

            if (query.DepartmentId.HasValue)
                q = q.Where(e => e.DepartmentId == query.DepartmentId);

            if (!string.IsNullOrEmpty(query.Status) &&
                Enum.TryParse<EmployeeStatus>(query.Status, out var status))
                q = q.Where(e => e.Status == status);

            if (!string.IsNullOrEmpty(query.EmploymentType) &&
                Enum.TryParse<EmploymentType>(query.EmploymentType, out var empType))
                q = q.Where(e => e.EmploymentType == empType);

            if (query.JoiningDateFrom.HasValue)
                q = q.Where(e => e.JoiningDate >= query.JoiningDateFrom);
            if (query.JoiningDateTo.HasValue)
                q = q.Where(e => e.JoiningDate <= query.JoiningDateTo);

            var total = await q.CountAsync();
            var pageSize = query.PageSize > 0 ? query.PageSize : 10;
            var page = query.Page > 0 ? query.Page : 1;

            q = query.SortBy?.ToLower() switch
            {
                "joiningdate" => query.SortOrder == "desc" ? q.OrderByDescending(e => e.JoiningDate) : q.OrderBy(e => e.JoiningDate),
                "salary" => query.SortOrder == "desc" ? q.OrderByDescending(e => e.Salary) : q.OrderBy(e => e.Salary),
                "designation" => query.SortOrder == "desc" ? q.OrderByDescending(e => e.Designation) : q.OrderBy(e => e.Designation),
                _ => query.SortOrder == "desc" ? q.OrderByDescending(e => e.FullName) : q.OrderBy(e => e.FullName)
            };

            var data = await q
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return new PagedResult<Employee>
            {
                Data = data,
                TotalCount = total,
                Page = page,
                PageSize = pageSize
            };
        }

        public async Task<List<Employee>> GetRecentlyJoinedAsync(int count = 5) =>
            await _context.Employees
                .Include(e => e.Department)
                .OrderByDescending(e => e.JoiningDate)
                .Take(count)
                .ToListAsync();

        public async Task<List<Employee>> GetArchivedAsync() =>
            await _context.Employees
                .IgnoreQueryFilters()
                .Include(e => e.Department)
                .Where(e => e.IsDeleted)
                .OrderByDescending(e => e.UpdatedAt)
                .ToListAsync();

        public async Task<string> GenerateEmployeeCodeAsync()
        {
            // Use count + 1 with a buffer, more reliable than MaxId + 1
            var count = await _context.Employees
                .IgnoreQueryFilters()
                .CountAsync();
            return $"EMP{(count + 1):D4}";
        }

        public async Task<int> GetTotalCountAsync() =>
            await _context.Employees.CountAsync();

        public async Task<int> GetActiveCountAsync() =>
            await _context.Employees.CountAsync(e => e.Status == EmployeeStatus.Active);

        public async Task<int> GetOnLeaveCountAsync() =>
            await _context.Employees.CountAsync(e => e.Status == EmployeeStatus.OnLeave);

        public async Task<int> GetNewHiresThisMonthAsync()
        {
            var now = DateTime.UtcNow;
            return await _context.Employees
                .CountAsync(e => e.JoiningDate.Year == now.Year && e.JoiningDate.Month == now.Month);
        }

        // Strongly-typed — no more dynamic casts
        public async Task<List<DeptEmployeeCountDto>> GetEmployeesByDepartmentAsync() =>
            await _context.Employees
                .Include(e => e.Department)
                .Where(e => e.DepartmentId != null)
                .GroupBy(e => e.Department!.Name)
                .Select(g => new DeptEmployeeCountDto { Department = g.Key, Count = g.Count() })
                .OrderByDescending(x => x.Count)
                .ToListAsync();

        public async Task<List<MonthlyHiringDto>> GetMonthlyHiringAsync()
        {
            var since = DateTime.UtcNow.AddMonths(-11);
            return await _context.Employees
                .Where(e => e.JoiningDate >= since)
                .GroupBy(e => new { e.JoiningDate.Year, e.JoiningDate.Month })
                .Select(g => new MonthlyHiringDto
                {
                    Month = $"{g.Key.Year}-{g.Key.Month:D2}",
                    Count = g.Count()
                })
                .OrderBy(x => x.Month)
                .ToListAsync();
        }

        public async Task<List<GenderDistributionDto>> GetGenderDistributionAsync() =>
            await _context.Employees
                .GroupBy(e => e.Gender)
                .Select(g => new GenderDistributionDto { Gender = g.Key.ToString(), Count = g.Count() })
                .ToListAsync();

        public async Task<List<StatusDistributionDto>> GetStatusDistributionAsync() =>
            await _context.Employees
                .IgnoreQueryFilters()
                .GroupBy(e => e.Status)
                .Select(g => new StatusDistributionDto { Status = g.Key.ToString(), Count = g.Count() })
                .ToListAsync();
    }

    public class DepartmentRepository : BaseRepository<Department>, IDepartmentRepository
    {
        public DepartmentRepository(AppDbContext context) : base(context) { }

        public async Task<Department?> GetByCodeAsync(string code) =>
            await _context.Departments.FirstOrDefaultAsync(d => d.Code == code);

        public async Task<Department?> GetWithManagerAsync(int id) =>
            await _context.Departments
                .Include(d => d.Manager)
                .Include(d => d.Employees)
                .FirstOrDefaultAsync(d => d.Id == id);

        public async Task<List<Department>> GetAllWithCountAsync() =>
            await _context.Departments
                .Include(d => d.Manager)
                .Include(d => d.Employees)
                .OrderBy(d => d.Name)
                .ToListAsync();
    }

    public class UserRepository : BaseRepository<User>, IUserRepository
    {
        public UserRepository(AppDbContext context) : base(context) { }

        public async Task<User?> GetByEmailAsync(string email) =>
            await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == email.ToLower());

        public async Task<User?> GetByUsernameAsync(string username) =>
            await _context.Users.FirstOrDefaultAsync(u => u.Username == username);

        public async Task<User?> GetByRefreshTokenAsync(string refreshToken) =>
            await _context.Users.FirstOrDefaultAsync(u => u.RefreshToken == refreshToken);
    }

    public class ActivityRepository : BaseRepository<EmployeeActivity>, IActivityRepository
    {
        public ActivityRepository(AppDbContext context) : base(context) { }

        public async Task<List<EmployeeActivity>> GetByEmployeeIdAsync(int employeeId) =>
            await _context.EmployeeActivities
                .Where(a => a.EmployeeId == employeeId)
                .OrderByDescending(a => a.CreatedAt)
                .Take(50)
                .ToListAsync();

        public async Task<List<EmployeeActivity>> GetRecentActivitiesAsync(int count = 20) =>
            await _context.EmployeeActivities
                .Include(a => a.Employee)
                .OrderByDescending(a => a.CreatedAt)
                .Take(count)
                .ToListAsync();

        public async Task LogActivityAsync(int employeeId, ActivityType activityType,
            string description, string? performedBy = null,
            string? oldValue = null, string? newValue = null)
        {
            var activity = new EmployeeActivity
            {
                EmployeeId = employeeId,
                ActivityType = activityType,
                Description = description,
                PerformedBy = performedBy,
                OldValue = oldValue,
                NewValue = newValue,
                CreatedAt = DateTime.UtcNow
            };
            await _context.EmployeeActivities.AddAsync(activity);
            await _context.SaveChangesAsync();
        }
    }

    public class AttendanceRepository : BaseRepository<Attendance>, IAttendanceRepository
    {
        public AttendanceRepository(AppDbContext context) : base(context) { }

        public async Task<AttendanceSummaryDto> GetSummaryAsync(int employeeId, int year, int month)
        {
            var records = await _context.Attendances
                .Where(a => a.EmployeeId == employeeId &&
                           a.Date.Year == year &&
                           a.Date.Month == month)
                .ToListAsync();

            var daysInMonth = DateTime.DaysInMonth(year, month);
            var present = records.Count(r => r.Status == "Present");
            var absent = records.Count(r => r.Status == "Absent");
            var leave = records.Count(r => r.Status == "Leave");
            var halfDay = records.Count(r => r.Status == "Half-day");

            return new AttendanceSummaryDto
            {
                PresentDays = present,
                AbsentDays = absent,
                LeaveDays = leave,
                HalfDays = halfDay,
                AttendancePercentage = daysInMonth > 0
                    ? Math.Round((present + halfDay * 0.5) / daysInMonth * 100, 1)
                    : 0
            };
        }

        public async Task<List<Attendance>> GetByEmployeeAsync(int employeeId, DateTime from, DateTime to) =>
            await _context.Attendances
                .Where(a => a.EmployeeId == employeeId && a.Date >= from && a.Date <= to)
                .OrderByDescending(a => a.Date)
                .ToListAsync();
    }
}
