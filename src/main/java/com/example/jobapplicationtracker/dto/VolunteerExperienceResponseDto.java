package com.example.jobapplicationtracker.dto;

import java.time.LocalDate;

public class VolunteerExperienceResponseDto {

    private Long id;
    private String organization;
    private String role;
    private LocalDate startDate;
    private LocalDate endDate;
    private String description;

    public VolunteerExperienceResponseDto(Long id, String organization, String role, LocalDate startDate, LocalDate endDate, String description) {
        this.id = id;
        this.organization = organization;
        this.role = role;
        this.startDate = startDate;
        this.endDate = endDate;
        this.description = description;
    }

    public Long getId() { return id; }
    public String getOrganization() { return organization; }
    public String getRole() { return role; }
    public LocalDate getStartDate() { return startDate; }
    public LocalDate getEndDate() { return endDate; }
    public String getDescription() { return description; }
}
