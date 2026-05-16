// Core Models for SmartEMS Angular Application

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  username: string;
  email: string;
  role: string;
  employeeId?: number;
  profilePhoto?: string;
  expiry: string;
}

export interface Employee {
  id: number;
  employeeCode: string;
  fullName: string;
  dateOfBirth: string;
  gender: string;
  phone: string;
  email: string;
  address: string;
  emergencyContact?: string;
  departmentId?: number;
  departmentName?: string;
  designation: string;
  joiningDate: string;
  employmentType: string;
  workLocation?: string;
  salary: number;
  role: string;
  reportingManagerId?: number;
  reportingManagerName?: string;
  shiftDetails?: string;
  profilePhotoUrl?: string;
  resumePath?: string;
  idProofPath?: string;
  status: string;
  skills?: string;
  profileCompletion: number;
  createdAt: string;
  updatedAt?: string;
  yearsOfExperience: number;
}

export interface EmployeeListItem {
  id: number;
  employeeCode: string;
  fullName: string;
  email: string;
  departmentName?: string;
  designation: string;
  status: string;
  profilePhotoUrl?: string;
  employmentType: string;
  joiningDate: string;
  workLocation?: string;
}

export interface CreateEmployeeDto {
  fullName: string;
  dateOfBirth: string;
  gender: number;
  phone: string;
  email: string;
  address: string;
  emergencyContact?: string;
  departmentId?: number;
  designation: string;
  joiningDate: string;
  employmentType: number;
  workLocation?: string;
  salary: number;
  role: number;
  reportingManagerId?: number;
  shiftDetails?: string;
  skills?: string;
}

export interface UpdateEmployeeDto extends CreateEmployeeDto {
  status: number;
}

export interface Department {
  id: number;
  name: string;
  code: string;
  description?: string;
  managerId?: number;
  managerName?: string;
  employeeCount: number;
  createdAt: string;
}

export interface CreateDepartmentDto {
  name: string;
  code: string;
  description?: string;
  managerId?: number;
}

export interface DashboardStats {
  totalEmployees: number;
  activeEmployees: number;
  totalDepartments: number;
  employeesOnLeave: number;
  newHiresThisMonth: number;
  employeesByDepartment: { department: string; count: number }[];
  monthlyHiring: { month: string; count: number }[];
  genderDistribution: { gender: string; count: number }[];
  statusDistribution: { status: string; count: number }[];
  recentlyJoined: EmployeeListItem[];
}

export interface Activity {
  id: number;
  employeeId: number;
  employeeName: string;
  activityType: string;
  description: string;
  performedBy?: string;
  oldValue?: string;
  newValue?: string;
  createdAt: string;
}

export interface AttendanceSummary {
  presentDays: number;
  absentDays: number;
  leaveDays: number;
  halfDays: number;
  attendancePercentage: number;
}

export interface PagedResult<T> {
  data: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface EmployeeQueryParams {
  search?: string;
  departmentId?: number;
  role?: string;
  status?: string;
  employmentType?: string;
  joiningDateFrom?: string;
  joiningDateTo?: string;
  sortBy?: string;
  sortOrder?: string;
  page?: number;
  pageSize?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: any;
}
