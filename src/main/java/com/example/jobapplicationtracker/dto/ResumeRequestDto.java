package com.example.jobapplicationtracker.dto;

import jakarta.validation.constraints.NotBlank;

public class ResumeRequestDto {

    @NotBlank(message = "Title is required")
    private String title;

    // ----- Getters and setters -----
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
}
