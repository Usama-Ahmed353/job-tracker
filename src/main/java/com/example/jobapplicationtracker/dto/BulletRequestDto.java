package com.example.jobapplicationtracker.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class BulletRequestDto {

    @NotNull(message = "workExperienceId is required")
    private Long workExperienceId;

    @NotBlank(message = "Content is required")
    private String content;

    private Integer displayOrder; // optional — service defaults to end of list if omitted

    public Long getWorkExperienceId() { return workExperienceId; }
    public void setWorkExperienceId(Long workExperienceId) { this.workExperienceId = workExperienceId; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public Integer getDisplayOrder() { return displayOrder; }
    public void setDisplayOrder(Integer displayOrder) { this.displayOrder = displayOrder; }
}