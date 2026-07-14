package com.example.jobapplicationtracker.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public class ApplicationRequestDto {

    @NotBlank(message = "Company name is required")
    @Size(max = 150, message = "Company name must be under 150 characters")
    private String companyName;

    @NotBlank(message = "Job role is required")
    @Size(max = 150, message = "Job role must be under 150 characters")
    private String jobRole;

    @NotNull(message = "Status is required")
    @Pattern(regexp = "WISHLIST|APPLIED|ASSESSMENT|INTERVIEW|OFFER|REJECTED|WITHDRAWN",
            message = "Invalid status value")
    private String status;

    @Pattern(regexp = "LINKEDIN|INDEED|COMPANY_WEBSITE|REFERRAL|GLASSDOOR|OTHER",
            message = "Invalid platform value")
    private String platform;

    private LocalDate dateApplied;

    @Size(max = 500, message = "Job link must be under 500 characters")
    private String jobLink;

    @Size(max = 255, message = "Location must be under 255 characters")
    private String location;

    private Integer salaryMin;

    private Integer salaryMax;

    @Size(max = 2000, message = "Notes must be under 2000 characters")
    private String notes;

    private String jobDescription;

    // ----- Getters and setters -----
    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }

    public String getJobRole() { return jobRole; }
    public void setJobRole(String jobRole) { this.jobRole = jobRole; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getPlatform() { return platform; }
    public void setPlatform(String platform) { this.platform = platform; }

    public LocalDate getDateApplied() { return dateApplied; }
    public void setDateApplied(LocalDate dateApplied) { this.dateApplied = dateApplied; }

    public String getJobLink() { return jobLink; }
    public void setJobLink(String jobLink) { this.jobLink = jobLink; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public Integer getSalaryMin() { return salaryMin; }
    public void setSalaryMin(Integer salaryMin) { this.salaryMin = salaryMin; }

    public Integer getSalaryMax() { return salaryMax; }
    public void setSalaryMax(Integer salaryMax) { this.salaryMax = salaryMax; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public String getJobDescription() { return jobDescription; }
    public void setJobDescription(String jobDescription) { this.jobDescription = jobDescription; }
}