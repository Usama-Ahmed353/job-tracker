package com.example.jobapplicationtracker.dto;

import jakarta.validation.constraints.NotBlank;

public class MatchScoreRequestDto {

    @NotBlank(message = "Job description text is required")
    private String jobDescriptionText;

    // ----- Getters and setters -----
    public String getJobDescriptionText() { return jobDescriptionText; }
    public void setJobDescriptionText(String jobDescriptionText) { this.jobDescriptionText = jobDescriptionText; }
}
