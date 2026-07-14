package com.example.jobapplicationtracker.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public class PublicationRequestDto {

    @NotBlank(message = "Title is required")
    private String title;
    @NotBlank(message = "Publisher is required")
    private String publisher;
    @NotNull(message = "Publication date is required")
    private LocalDate publicationDate;
    private String url;
    private String description;

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getPublisher() { return publisher; }
    public void setPublisher(String publisher) { this.publisher = publisher; }
    public LocalDate getPublicationDate() { return publicationDate; }
    public void setPublicationDate(LocalDate publicationDate) { this.publicationDate = publicationDate; }
    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
