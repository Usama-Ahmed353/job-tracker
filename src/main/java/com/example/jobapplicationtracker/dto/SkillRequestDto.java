package com.example.jobapplicationtracker.dto;

import jakarta.validation.constraints.NotBlank;

public class SkillRequestDto {

    @NotBlank(message = "Skill name is required")
    private String name;

    private String category; // e.g. "Technical", "Soft" — optional

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
}