package com.example.jobapplicationtracker.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public class AwardRequestDto {

    @NotBlank(message = "Award title is required")
    private String title;
    @NotBlank(message = "Issuer is required")
    private String issuer;
    @NotNull(message = "Date received is required")
    private LocalDate dateReceived;
    private String description;

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getIssuer() { return issuer; }
    public void setIssuer(String issuer) { this.issuer = issuer; }
    public LocalDate getDateReceived() { return dateReceived; }
    public void setDateReceived(LocalDate dateReceived) { this.dateReceived = dateReceived; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
