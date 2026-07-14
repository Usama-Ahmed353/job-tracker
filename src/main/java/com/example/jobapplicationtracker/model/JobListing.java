package com.example.jobapplicationtracker.model;

import jakarta.persistence.*;

@Entity
@Table(name = "job_listings")
public class JobListing {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String jobRole;
    private String companyName;
    private String location;
    private String workload;
    private String salaryRange;
    private Integer salaryMin;
    private Integer salaryMax;
    private String jobLink;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getJobRole() { return jobRole; }
    public void setJobRole(String jobRole) { this.jobRole = jobRole; }

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getWorkload() { return workload; }
    public void setWorkload(String workload) { this.workload = workload; }

    public String getSalaryRange() { return salaryRange; }
    public void setSalaryRange(String salaryRange) { this.salaryRange = salaryRange; }

    public Integer getSalaryMin() { return salaryMin; }
    public void setSalaryMin(Integer salaryMin) { this.salaryMin = salaryMin; }

    public Integer getSalaryMax() { return salaryMax; }
    public void setSalaryMax(Integer salaryMax) { this.salaryMax = salaryMax; }

    public String getJobLink() { return jobLink; }
    public void setJobLink(String jobLink) { this.jobLink = jobLink; }
}