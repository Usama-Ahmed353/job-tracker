package com.example.jobapplicationtracker.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public class VolunteerExperienceRequestDto {

    @NotBlank(message = "Organization is required")
    private String organization;
    @NotBlank(message = "Role is required")
    private String role;
    @NotNull(message = "Start date is required")
    private LocalDate startDate;
    private LocalDate endDate;
    private String description;

    public String getOrganization() { return organization; }
    public void setOrganization(String organization) { this.organization = organization; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
