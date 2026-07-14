package com.example.jobapplicationtracker.dto;

import java.time.LocalDate;

public class CertificationResponseDto {

    private Long id;
    private String name;
    private String issuingOrganization;
    private LocalDate issueDate;
    private LocalDate expirationDate;
    private String credentialUrl;

    public CertificationResponseDto(Long id, String name, String issuingOrganization, LocalDate issueDate, LocalDate expirationDate, String credentialUrl) {
        this.id = id;
        this.name = name;
        this.issuingOrganization = issuingOrganization;
        this.issueDate = issueDate;
        this.expirationDate = expirationDate;
        this.credentialUrl = credentialUrl;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getIssuingOrganization() { return issuingOrganization; }
    public LocalDate getIssueDate() { return issueDate; }
    public LocalDate getExpirationDate() { return expirationDate; }
    public String getCredentialUrl() { return credentialUrl; }
}
