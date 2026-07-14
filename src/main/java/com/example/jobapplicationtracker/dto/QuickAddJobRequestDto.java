package com.example.jobapplicationtracker.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Lightweight DTO for the quick-add "Save Job" flow.
 * Only jobDescriptionText is required — company/role are optional
 * and will default to values extracted or "Unknown".
 */
public class QuickAddJobRequestDto {

    @Size(max = 500, message = "Job link must be under 500 characters")
    private String jobLink;

    private String companyName;

    private String jobRole;

    @NotBlank(message = "Job description text is required")
    private String jobDescriptionText;

    // ----- Getters and setters -----
    public String getJobLink() { return jobLink; }
    public void setJobLink(String jobLink) { this.jobLink = jobLink; }

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }

    public String getJobRole() { return jobRole; }
    public void setJobRole(String jobRole) { this.jobRole = jobRole; }

    public String getJobDescriptionText() { return jobDescriptionText; }
    public void setJobDescriptionText(String jobDescriptionText) { this.jobDescriptionText = jobDescriptionText; }
}
