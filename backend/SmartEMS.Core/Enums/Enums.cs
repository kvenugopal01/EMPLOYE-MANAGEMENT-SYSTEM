namespace SmartEMS.Core.Enums
{
    public enum UserRole
    {
        Admin = 1,
        HR = 2,
        Employee = 3
    }

    public enum EmploymentType
    {
        FullTime = 1,
        PartTime = 2,
        Contract = 3,
        Intern = 4
    }

    public enum EmployeeStatus
    {
        Active = 1,
        Inactive = 2,
        OnLeave = 3,
        Terminated = 4,
        Archived = 5
    }

    public enum Gender
    {
        Male = 1,
        Female = 2,
        Other = 3
    }

    public enum DocumentType
    {
        Photo = 1,
        Resume = 2,
        IdProof = 3
    }

    public enum ActivityType
    {
        Created = 1,
        Updated = 2,
        Archived = 3,
        Restored = 4,
        DepartmentChanged = 5,
        SalaryModified = 6,
        RoleChanged = 7,
        StatusChanged = 8
    }
}
