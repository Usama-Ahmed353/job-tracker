package com.example.jobapplicationtracker.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Full resume response including only the SELECTED bullets per work experience,
 * plus skills, education, and the additional content-bank sections (certifications,
 * awards, projects, volunteering, publications) — everything the frontend needs to
 * render one resume version.
 */
public class ResumeResponseDto {

    private Long id;
    private String title;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<WorkExperienceDto> workExperiences;
    private List<SkillDto> skills;
    private List<EducationDto> education;
    private List<CertificationDto> certifications;
    private List<AwardDto> awards;
    private List<ProjectDto> projects;
    private List<VolunteerExperienceDto> volunteering;
    private List<PublicationDto> publications;

    // ----- Getters and setters -----
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public List<WorkExperienceDto> getWorkExperiences() { return workExperiences; }
    public void setWorkExperiences(List<WorkExperienceDto> workExperiences) { this.workExperiences = workExperiences; }

    public List<SkillDto> getSkills() { return skills; }
    public void setSkills(List<SkillDto> skills) { this.skills = skills; }

    public List<EducationDto> getEducation() { return education; }
    public void setEducation(List<EducationDto> education) { this.education = education; }

    public List<CertificationDto> getCertifications() { return certifications; }
    public void setCertifications(List<CertificationDto> certifications) { this.certifications = certifications; }

    public List<AwardDto> getAwards() { return awards; }
    public void setAwards(List<AwardDto> awards) { this.awards = awards; }

    public List<ProjectDto> getProjects() { return projects; }
    public void setProjects(List<ProjectDto> projects) { this.projects = projects; }

    public List<VolunteerExperienceDto> getVolunteering() { return volunteering; }
    public void setVolunteering(List<VolunteerExperienceDto> volunteering) { this.volunteering = volunteering; }

    public List<PublicationDto> getPublications() { return publications; }
    public void setPublications(List<PublicationDto> publications) { this.publications = publications; }

    // ----- Nested DTOs (existing, unchanged) -----

    public static class WorkExperienceDto {
        private Long id;
        private String companyName;
        private String jobTitle;
        private LocalDate startDate;
        private LocalDate endDate;
        private String location;
        private List<BulletDto> selectedBullets;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getCompanyName() { return companyName; }
        public void setCompanyName(String companyName) { this.companyName = companyName; }

        public String getJobTitle() { return jobTitle; }
        public void setJobTitle(String jobTitle) { this.jobTitle = jobTitle; }

        public LocalDate getStartDate() { return startDate; }
        public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

        public LocalDate getEndDate() { return endDate; }
        public void setEndDate(LocalDate endDate) { this.endDate = endDate; }

        public String getLocation() { return location; }
        public void setLocation(String location) { this.location = location; }

        public List<BulletDto> getSelectedBullets() { return selectedBullets; }
        public void setSelectedBullets(List<BulletDto> selectedBullets) { this.selectedBullets = selectedBullets; }
    }

    public static class BulletDto {
        private Long id;
        private String content;
        private Integer displayOrder;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }

        public Integer getDisplayOrder() { return displayOrder; }
        public void setDisplayOrder(Integer displayOrder) { this.displayOrder = displayOrder; }
    }

    public static class SkillDto {
        private Long id;
        private String name;
        private String category;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }
    }

    public static class EducationDto {
        private Long id;
        private String institution;
        private String degree;
        private String fieldOfStudy;
        private LocalDate startDate;
        private LocalDate endDate;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getInstitution() { return institution; }
        public void setInstitution(String institution) { this.institution = institution; }

        public String getDegree() { return degree; }
        public void setDegree(String degree) { this.degree = degree; }

        public String getFieldOfStudy() { return fieldOfStudy; }
        public void setFieldOfStudy(String fieldOfStudy) { this.fieldOfStudy = fieldOfStudy; }

        public LocalDate getStartDate() { return startDate; }
        public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

        public LocalDate getEndDate() { return endDate; }
        public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
    }

    // ----- Nested DTOs (new sections) -----

    public static class CertificationDto {
        private Long id;
        private String name;
        private String issuingOrganization;
        private LocalDate issueDate;
        private LocalDate expirationDate;
        private String credentialUrl;

        public CertificationDto(Long id, String name, String issuingOrganization, LocalDate issueDate,
                                 LocalDate expirationDate, String credentialUrl) {
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

    public static class AwardDto {
        private Long id;
        private String title;
        private String issuer;
        private LocalDate dateReceived;
        private String description;

        public AwardDto(Long id, String title, String issuer, LocalDate dateReceived, String description) {
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

    public static class ProjectDto {
        private Long id;
        private String name;
        private String description;
        private String technologies;
        private String projectUrl;
        private LocalDate startDate;
        private LocalDate endDate;

        public ProjectDto(Long id, String name, String description, String technologies,
                           String projectUrl, LocalDate startDate, LocalDate endDate) {
            this.id = id;
            this.name = name;
            this.description = description;
            this.technologies = technologies;
            this.projectUrl = projectUrl;
            this.startDate = startDate;
            this.endDate = endDate;
        }

        public Long getId() { return id; }
        public String getName() { return name; }
        public String getDescription() { return description; }
        public String getTechnologies() { return technologies; }
        public String getProjectUrl() { return projectUrl; }
        public LocalDate getStartDate() { return startDate; }
        public LocalDate getEndDate() { return endDate; }
    }

    public static class VolunteerExperienceDto {
        private Long id;
        private String organization;
        private String role;
        private LocalDate startDate;
        private LocalDate endDate;
        private String description;

        public VolunteerExperienceDto(Long id, String organization, String role, LocalDate startDate,
                                       LocalDate endDate, String description) {
            this.id = id;
            this.organization = organization;
            this.role = role;
            this.startDate = startDate;
            this.endDate = endDate;
            this.description = description;
        }

        public Long getId() { return id; }
        public String getOrganization() { return organization; }
        public String getRole() { return role; }
        public LocalDate getStartDate() { return startDate; }
        public LocalDate getEndDate() { return endDate; }
        public String getDescription() { return description; }
    }

    public static class PublicationDto {
        private Long id;
        private String title;
        private String publisher;
        private LocalDate publicationDate;
        private String url;
        private String description;

        public PublicationDto(Long id, String title, String publisher, LocalDate publicationDate,
                               String url, String description) {
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
}
