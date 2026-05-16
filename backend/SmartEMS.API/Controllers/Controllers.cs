using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartEMS.Core.DTOs;
using SmartEMS.Core.Interfaces;
using System.Security.Claims;

namespace SmartEMS.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(new { success = false, message = "Invalid input" });

            var result = await _authService.LoginAsync(dto);
            if (result == null)
                return Unauthorized(new { success = false, message = "Invalid credentials" });

            return Ok(new { success = true, data = result });
        }

        [HttpPost("register")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Register([FromBody] RegisterDto dto)
        {
            var result = await _authService.RegisterAsync(dto);
            if (result == null)
                return BadRequest(new { success = false, message = "User already exists" });

            return Ok(new { success = true, data = result });
        }

        [HttpPost("refresh")]
        public async Task<IActionResult> Refresh([FromBody] string refreshToken)
        {
            var result = await _authService.RefreshTokenAsync(refreshToken);
            if (result == null)
                return Unauthorized(new { success = false, message = "Invalid or expired refresh token" });

            return Ok(new { success = true, data = result });
        }

        [HttpPost("logout")]
        [Authorize]
        public async Task<IActionResult> Logout()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            await _authService.LogoutAsync(userId);
            return Ok(new { success = true, message = "Logged out successfully" });
        }

        [HttpGet("me")]
        [Authorize]
        public IActionResult GetCurrentUser()
        {
            return Ok(new
            {
                success = true,
                data = new
                {
                    id = User.FindFirst(ClaimTypes.NameIdentifier)?.Value,
                    email = User.FindFirst(ClaimTypes.Email)?.Value,
                    username = User.FindFirst(ClaimTypes.Name)?.Value,
                    role = User.FindFirst(ClaimTypes.Role)?.Value
                }
            });
        }
    }

    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class EmployeesController : ControllerBase
    {
        private readonly IEmployeeService _service;
        private readonly IConfiguration _config;

        public EmployeesController(IEmployeeService service, IConfiguration config)
        {
            _service = service;
            _config = config;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] EmployeeQueryParams query)
        {
            var result = await _service.GetAllAsync(query);
            return Ok(new { success = true, data = result });
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var emp = await _service.GetByIdAsync(id);
            if (emp == null) return NotFound(new { success = false, message = "Employee not found" });
            return Ok(new { success = true, data = emp });
        }

        [HttpPost]
        [Authorize(Roles = "Admin,HR")]
        public async Task<IActionResult> Create([FromBody] CreateEmployeeDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(new { success = false, message = "Validation failed", errors = ModelState });

            var createdBy = User.FindFirst(ClaimTypes.Email)?.Value ?? "System";
            var emp = await _service.CreateAsync(dto, createdBy);
            return CreatedAtAction(nameof(GetById), new { id = emp.Id },
                new { success = true, data = emp, message = "Employee created successfully" });
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,HR")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateEmployeeDto dto)
        {
            var updatedBy = User.FindFirst(ClaimTypes.Email)?.Value ?? "System";
            var emp = await _service.UpdateAsync(id, dto, updatedBy);
            if (emp == null) return NotFound(new { success = false, message = "Employee not found" });
            return Ok(new { success = true, data = emp, message = "Employee updated successfully" });
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin,HR")]
        public async Task<IActionResult> Archive(int id)
        {
            var archivedBy = User.FindFirst(ClaimTypes.Email)?.Value ?? "System";
            var result = await _service.ArchiveAsync(id, archivedBy);
            if (!result) return NotFound(new { success = false, message = "Employee not found" });
            return Ok(new { success = true, message = "Employee archived successfully" });
        }

        [HttpPatch("{id}/restore")]
        [Authorize(Roles = "Admin,HR")]
        public async Task<IActionResult> Restore(int id)
        {
            var restoredBy = User.FindFirst(ClaimTypes.Email)?.Value ?? "System";
            var result = await _service.RestoreAsync(id, restoredBy);
            if (!result) return NotFound(new { success = false, message = "Employee not found in archive" });
            return Ok(new { success = true, message = "Employee restored successfully" });
        }

        [HttpGet("archived")]
        [Authorize(Roles = "Admin,HR")]
        public async Task<IActionResult> GetArchived()
        {
            var archived = await _service.GetArchivedAsync();
            return Ok(new { success = true, data = archived });
        }

        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboard()
        {
            var stats = await _service.GetDashboardStatsAsync();
            return Ok(new { success = true, data = stats });
        }

        [HttpGet("{id}/activities")]
        public async Task<IActionResult> GetActivities(int id)
        {
            var activities = await _service.GetActivitiesAsync(id);
            return Ok(new { success = true, data = activities });
        }

        [HttpGet("{id}/attendance")]
        public async Task<IActionResult> GetAttendance(int id, [FromQuery] int year = 0, [FromQuery] int month = 0)
        {
            if (year == 0) year = DateTime.UtcNow.Year;
            if (month == 0) month = DateTime.UtcNow.Month;
            var summary = await _service.GetAttendanceSummaryAsync(id, year, month);
            return Ok(new { success = true, data = summary });
        }

        [HttpPost("{id}/photo")]
        [Authorize(Roles = "Admin,HR")]
        public async Task<IActionResult> UploadPhoto(int id, IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest(new { success = false, message = "No file uploaded" });

            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp" };
            var ext = Path.GetExtension(file.FileName).ToLower();
            if (!allowedExtensions.Contains(ext))
                return BadRequest(new { success = false, message = "Invalid file type. Only JPG, PNG allowed." });

            if (file.Length > 5 * 1024 * 1024)
                return BadRequest(new { success = false, message = "File size exceeds 5MB limit." });

            var uploadsPath = Path.Combine(Directory.GetCurrentDirectory(), "Uploads", "photos");
            Directory.CreateDirectory(uploadsPath);
            var fileName = $"{id}_{Guid.NewGuid()}{ext}";
            var filePath = Path.Combine(uploadsPath, fileName);

            using var stream = new FileStream(filePath, FileMode.Create);
            await file.CopyToAsync(stream);

            await _service.UpdatePhotoAsync(id, $"photos/{fileName}");
            var baseUrl = _config["AppSettings:BaseUrl"];
            return Ok(new { success = true, photoUrl = $"{baseUrl}/uploads/photos/{fileName}" });
        }

        [HttpPost("{id}/resume")]
        [Authorize(Roles = "Admin,HR")]
        public async Task<IActionResult> UploadResume(int id, IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest(new { success = false, message = "No file uploaded" });

            var allowedExtensions = new[] { ".pdf", ".doc", ".docx" };
            var ext = Path.GetExtension(file.FileName).ToLower();
            if (!allowedExtensions.Contains(ext))
                return BadRequest(new { success = false, message = "Invalid file type." });

            if (file.Length > 10 * 1024 * 1024)
                return BadRequest(new { success = false, message = "File size exceeds 10MB limit." });

            var uploadsPath = Path.Combine(Directory.GetCurrentDirectory(), "Uploads", "resumes");
            Directory.CreateDirectory(uploadsPath);
            var fileName = $"{id}_{Guid.NewGuid()}{ext}";
            var filePath = Path.Combine(uploadsPath, fileName);

            using var stream = new FileStream(filePath, FileMode.Create);
            await file.CopyToAsync(stream);

            return Ok(new { success = true, resumeUrl = $"resumes/{fileName}" });
        }

        [HttpGet("export/excel")]
        [Authorize(Roles = "Admin,HR")]
        public async Task<IActionResult> ExportToExcel([FromQuery] EmployeeQueryParams query)
        {
            query.PageSize = 10000;
            var result = await _service.GetAllAsync(query);
            
            using var workbook = new ClosedXML.Excel.XLWorkbook();
            var ws = workbook.Worksheets.Add("Employees");

            // Header
            var headers = new[] { "Code", "Name", "Email", "Department", "Designation", 
                "Employment Type", "Status", "Joining Date", "Work Location" };
            for (int i = 0; i < headers.Length; i++)
            {
                var cell = ws.Cell(1, i + 1);
                cell.Value = headers[i];
                cell.Style.Font.Bold = true;
                cell.Style.Fill.BackgroundColor = ClosedXML.Excel.XLColor.FromHtml("#1a1a2e");
                cell.Style.Font.FontColor = ClosedXML.Excel.XLColor.White;
            }

            // Data
            for (int i = 0; i < result.Data.Count; i++)
            {
                var emp = result.Data[i];
                var row = i + 2;
                ws.Cell(row, 1).Value = emp.EmployeeCode;
                ws.Cell(row, 2).Value = emp.FullName;
                ws.Cell(row, 3).Value = emp.Email;
                ws.Cell(row, 4).Value = emp.DepartmentName ?? "";
                ws.Cell(row, 5).Value = emp.Designation;
                ws.Cell(row, 6).Value = emp.EmploymentType;
                ws.Cell(row, 7).Value = emp.Status;
                ws.Cell(row, 8).Value = emp.JoiningDate.ToString("yyyy-MM-dd");
                ws.Cell(row, 9).Value = emp.WorkLocation ?? "";
            }

            ws.Columns().AdjustToContents();

            using var stream = new MemoryStream();
            workbook.SaveAs(stream);
            stream.Seek(0, SeekOrigin.Begin);

            return File(stream.ToArray(), 
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", 
                $"employees_{DateTime.Now:yyyyMMdd}.xlsx");
        }
    }

    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class DepartmentsController : ControllerBase
    {
        private readonly IDepartmentService _service;

        public DepartmentsController(IDepartmentService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var depts = await _service.GetAllAsync();
            return Ok(new { success = true, data = depts });
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var dept = await _service.GetByIdAsync(id);
            if (dept == null) return NotFound(new { success = false, message = "Department not found" });
            return Ok(new { success = true, data = dept });
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Create([FromBody] CreateDepartmentDto dto)
        {
            var dept = await _service.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = dept.Id },
                new { success = true, data = dept });
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update(int id, [FromBody] CreateDepartmentDto dto)
        {
            var dept = await _service.UpdateAsync(id, dto);
            if (dept == null) return NotFound(new { success = false, message = "Department not found" });
            return Ok(new { success = true, data = dept });
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _service.DeleteAsync(id);
            if (!result) return NotFound(new { success = false, message = "Department not found" });
            return Ok(new { success = true, message = "Department deleted" });
        }
    }
}
