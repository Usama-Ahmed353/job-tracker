package com.example.jobapplicationtracker.dto;

import java.time.LocalDateTime;

public class EventResponseDto {

    private Long id;
    private Long applicationId;
    private String companyName; // convenience field, so frontend doesn't need a second lookup
    private String eventType;
    private String title;
    private String description;
    private LocalDateTime eventDatetime;
    private String locationOrLink;
    private boolean completed;
    private LocalDateTime createdAt;

    public EventResponseDto(Long id, Long applicationId, String companyName, String eventType,
                            String title, String description, LocalDateTime eventDatetime,
                            String locationOrLink, boolean completed, LocalDateTime createdAt) {
        this.id = id;
        this.applicationId = applicationId;
        this.companyName = companyName;
        this.eventType = eventType;
        this.title = title;
        this.description = description;
        this.eventDatetime = eventDatetime;
        this.locationOrLink = locationOrLink;
        this.completed = completed;
        this.createdAt = createdAt;
    }

    // ----- Getters -----
    public Long getId() { return id; }
    public Long getApplicationId() { return applicationId; }
    public String getCompanyName() { return companyName; }
    public String getEventType() { return eventType; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public LocalDateTime getEventDatetime() { return eventDatetime; }
    public String getLocationOrLink() { return locationOrLink; }
    public boolean isCompleted() { return completed; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}