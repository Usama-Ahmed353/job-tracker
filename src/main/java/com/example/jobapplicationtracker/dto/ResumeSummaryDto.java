package com.example.jobapplicationtracker.dto;

import java.time.LocalDateTime;

/**
 * Lightweight resume summary for list views (no nested content).
 */
public class ResumeSummaryDto {

    private Long id;
    private String title;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public ResumeSummaryDto(Long id, String title, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.title = title;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // ----- Getters -----
    public Long getId() { return id; }
    public String getTitle() { return title; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
