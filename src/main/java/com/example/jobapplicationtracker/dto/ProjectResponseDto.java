package com.example.jobapplicationtracker.dto;

import java.time.LocalDate;

public class ProjectResponseDto {

    private Long id;
    private String name;
    private String description;
    private String technologies;
    private String projectUrl;
    private LocalDate startDate;
    private LocalDate endDate;

    public ProjectResponseDto(Long id, String name, String description, String technologies, String projectUrl, LocalDate startDate, LocalDate endDate) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.technologies = technologies;
        this.projectUrl = projectUrl;
        this.startDate = startDate;
        this.endDate = endDate;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getDescription() { return description; }
    public String getTechnologies() { return technologies; }
    public String getProjectUrl() { return projectUrl; }
    public LocalDate getStartDate() { return startDate; }
    public LocalDate getEndDate() { return endDate; }
}
