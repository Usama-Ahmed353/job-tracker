package com.example.jobapplicationtracker.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class ApplicationResponseDto {

    private Long id;
    private String companyName;
    private String jobRole;
    private String status;
    private String platform;
    private LocalDate dateApplied;
    private String jobLink;
    private String location;
    private Integer salaryMin;
    private Integer salaryMax;
    private String notes;
    private String jobDescription;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public ApplicationResponseDto(Long id, String companyName, String jobRole, String status,
                                  String platform, LocalDate dateApplied, String jobLink,
                                  String location, Integer salaryMin, Integer salaryMax,
                                  String notes, String jobDescription,
                                  LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.companyName = companyName;
        this.jobRole = jobRole;
        this.status = status;
        this.platform = platform;
        this.dateApplied = dateApplied;
        this.jobLink = jobLink;
        this.location = location;
        this.salaryMin = salaryMin;
        this.salaryMax = salaryMax;
        this.notes = notes;
        this.jobDescription = jobDescription;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // ----- Getters -----
    public Long getId() { return id; }
    public String getCompanyName() { return companyName; }
    public String getJobRole() { return jobRole; }
    public String getStatus() { return status; }
    public String getPlatform() { return platform; }
    public LocalDate getDateApplied() { return dateApplied; }
    public String getJobLink() { return jobLink; }
    public String getLocation() { return location; }
    public Integer getSalaryMin() { return salaryMin; }
    public Integer getSalaryMax() { return salaryMax; }
    public String getNotes() { return notes; }
    public String getJobDescription() { return jobDescription; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}