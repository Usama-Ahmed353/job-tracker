package com.example.jobapplicationtracker.dto;

import java.time.LocalDate;
import java.util.List;

public class WorkExperienceResponseDto {
    private Long id;
    private String companyName;
    private String jobTitle;
    private LocalDate startDate;
    private LocalDate endDate;
    private String location;
    private List<BulletResponseDto> bullets;

    public WorkExperienceResponseDto(Long id, String companyName, String jobTitle, LocalDate startDate,
                                     LocalDate endDate, String location, List<BulletResponseDto> bullets) {
        this.id = id;
        this.companyName = companyName;
        this.jobTitle = jobTitle;
        this.startDate = startDate;
        this.endDate = endDate;
        this.location = location;
        this.bullets = bullets;
    }

    public Long getId() { return id; }
    public String getCompanyName() { return companyName; }
    public String getJobTitle() { return jobTitle; }
    public LocalDate getStartDate() { return startDate; }
    public LocalDate getEndDate() { return endDate; }
    public String getLocation() { return location; }
    public List<BulletResponseDto> getBullets() { return bullets; }
}