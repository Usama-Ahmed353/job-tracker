package com.example.jobapplicationtracker.dto;

import java.time.LocalDate;

public class PublicationResponseDto {

    private Long id;
    private String title;
    private String publisher;
    private LocalDate publicationDate;
    private String url;
    private String description;

    public PublicationResponseDto(Long id, String title, String publisher, LocalDate publicationDate, String url, String description) {
        this.id = id;
        this.title = title;
        this.publisher = publisher;
        this.publicationDate = publicationDate;
        this.url = url;
        this.description = description;
    }

    public Long getId() { return id; }
    public String getTitle() { return title; }
    public String getPublisher() { return publisher; }
    public LocalDate getPublicationDate() { return publicationDate; }
    public String getUrl() { return url; }
    public String getDescription() { return description; }
}
