package com.example.jobapplicationtracker.dto;

public class BulletAiRequestDto {
    private String jobDescription; // optional — improves relevance if provided

    public String getJobDescription() { return jobDescription; }
    public void setJobDescription(String jobDescription) { this.jobDescription = jobDescription; }
}