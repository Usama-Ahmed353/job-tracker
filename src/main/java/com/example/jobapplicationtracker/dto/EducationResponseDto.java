package com.example.jobapplicationtracker.dto;

import java.time.LocalDate;

public class EducationResponseDto {
    private Long id;
    private String institution;
    private String degree;
    private String fieldOfStudy;
    private LocalDate startDate;
    private LocalDate endDate;

    public EducationResponseDto(Long id, String institution, String degree, String fieldOfStudy,
                                LocalDate startDate, LocalDate endDate) {
        this.id = id;
        this.institution = institution;
        this.degree = degree;
        this.fieldOfStudy = fieldOfStudy;
        this.startDate = startDate;
        this.endDate = endDate;
    }

    public Long getId() { return id; }
    public String getInstitution() { return institution; }
    public String getDegree() { return degree; }
    public String getFieldOfStudy() { return fieldOfStudy; }
    public LocalDate getStartDate() { return startDate; }
    public LocalDate getEndDate() { return endDate; }
}