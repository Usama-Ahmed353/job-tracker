package com.example.jobapplicationtracker.dto;

import java.time.LocalDate;

public class AwardResponseDto {

    private Long id;
    private String title;
    private String issuer;
    private LocalDate dateReceived;
    private String description;

    public AwardResponseDto(Long id, String title, String issuer, LocalDate dateReceived, String description) {
        this.id = id;
        this.title = title;
        this.issuer = issuer;
        this.dateReceived = dateReceived;
        this.description = description;
    }

    public Long getId() { return id; }
    public String getTitle() { return title; }
    public String getIssuer() { return issuer; }
    public LocalDate getDateReceived() { return dateReceived; }
    public String getDescription() { return description; }
}
