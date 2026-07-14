package com.example.jobapplicationtracker.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

import java.time.LocalDateTime;

public class EventRequestDto {

    private Long applicationId; // nullable — event may stand alone

    @NotNull(message = "Event type is required")
    @Pattern(regexp = "INTERVIEW|ASSESSMENT|FOLLOW_UP|DEADLINE|OTHER", message = "Invalid event type")
    private String eventType;

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    @NotNull(message = "Event date/time is required")
    private LocalDateTime eventDatetime;

    private String locationOrLink;

    // ----- Getters and setters -----
    public Long getApplicationId() { return applicationId; }
    public void setApplicationId(Long applicationId) { this.applicationId = applicationId; }

    public String getEventType() { return eventType; }
    public void setEventType(String eventType) { this.eventType = eventType; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public LocalDateTime getEventDatetime() { return eventDatetime; }
    public void setEventDatetime(LocalDateTime eventDatetime) { this.eventDatetime = eventDatetime; }

    public String getLocationOrLink() { return locationOrLink; }
    public void setLocationOrLink(String locationOrLink) { this.locationOrLink = locationOrLink; }
}