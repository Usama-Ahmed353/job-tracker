package com.example.jobapplicationtracker.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public class CertificationRequestDto {

    @NotBlank(message = "Certification name is required")
    private String name;
    @NotBlank(message = "Issuing organization is required")
    private String issuingOrganization;
    @NotNull(message = "Issue date is required")
    private LocalDate issueDate;
    private LocalDate expirationDate;
    private String credentialUrl;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getIssuingOrganization() { return issuingOrganization; }
    public void setIssuingOrganization(String issuingOrganization) { this.issuingOrganization = issuingOrganization; }
    public LocalDate getIssueDate() { return issueDate; }
    public void setIssueDate(LocalDate issueDate) { this.issueDate = issueDate; }
    public LocalDate getExpirationDate() { return expirationDate; }
    public void setExpirationDate(LocalDate expirationDate) { this.expirationDate = expirationDate; }
    public String getCredentialUrl() { return credentialUrl; }
    public void setCredentialUrl(String credentialUrl) { this.credentialUrl = credentialUrl; }
}
