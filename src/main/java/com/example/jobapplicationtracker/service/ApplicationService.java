package com.example.jobapplicationtracker.service;
import com.example.jobapplicationtracker.model.ApplicationPlatform;
import com.example.jobapplicationtracker.dto.ApplicationRequestDto;
import com.example.jobapplicationtracker.dto.QuickAddJobRequestDto;
import com.example.jobapplicationtracker.dto.ApplicationResponseDto;
import com.example.jobapplicationtracker.model.ApplicationStatus;
import com.example.jobapplicationtracker.model.JobApplication;
import com.example.jobapplicationtracker.model.User;
import com.example.jobapplicationtracker.exception.ResourceNotFoundException;
import com.example.jobapplicationtracker.repository.ApplicationRepository;
import com.example.jobapplicationtracker.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final UserRepository userRepository;

    public ApplicationService(ApplicationRepository applicationRepository, UserRepository userRepository) {
        this.applicationRepository = applicationRepository;
        this.userRepository = userRepository;
    }

    public List<ApplicationResponseDto> getAllForUser(String email) {
        User currentUser = resolveUser(email);
        return applicationRepository.findByUserId(currentUser.getId())
                .stream()
                .map(this::toResponseDto)
                .toList();
    }

    public ApplicationResponseDto getOneForUser(Long id, String email) {
        User currentUser = resolveUser(email);
        JobApplication app = findOwnedOrThrow(id, currentUser);
        return toResponseDto(app);
    }

    public ApplicationResponseDto create(ApplicationRequestDto request, String email) {
        User currentUser = resolveUser(email);

        JobApplication app = new JobApplication();
        applyRequestToEntity(app, request);
        app.setUser(currentUser);
        app.setCreatedAt(LocalDateTime.now());
        app.setUpdatedAt(LocalDateTime.now());

        JobApplication saved = applicationRepository.save(app);
        return toResponseDto(saved);
    }

    public ApplicationResponseDto update(Long id, ApplicationRequestDto request, String email) {
        User currentUser = resolveUser(email);
        JobApplication app = findOwnedOrThrow(id, currentUser);
        applyRequestToEntity(app, request);
        app.setUpdatedAt(LocalDateTime.now());

        JobApplication saved = applicationRepository.save(app);
        return toResponseDto(saved);
    }

    public void delete(Long id, String email) {
        User currentUser = resolveUser(email);
        JobApplication app = findOwnedOrThrow(id, currentUser);
        applicationRepository.delete(app);
    }

    // ----- Helpers -----

    private User resolveUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));
    }

    private JobApplication findOwnedOrThrow(Long id, User currentUser) {
        JobApplication app = applicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found with id: " + id));

        if (!app.getUser().getId().equals(currentUser.getId())) {
            throw new ResourceNotFoundException("Application not found with id: " + id);
        }
        return app;
    }

    private void applyRequestToEntity(JobApplication app, ApplicationRequestDto request) {
        app.setCompanyName(request.getCompanyName());
        app.setJobRole(request.getJobRole());
        app.setStatus(ApplicationStatus.valueOf(request.getStatus()));
        app.setPlatform(request.getPlatform() != null
                ? ApplicationPlatform.valueOf(request.getPlatform())
                : ApplicationPlatform.OTHER);
        app.setDateApplied(request.getDateApplied());
        app.setJobLink(request.getJobLink());
        app.setLocation(request.getLocation());
        app.setSalaryMin(request.getSalaryMin());
        app.setSalaryMax(request.getSalaryMax());
        app.setNotes(request.getNotes());
        app.setJobDescription(request.getJobDescription());
    }


    private ApplicationResponseDto toResponseDto(JobApplication app) {
        return new ApplicationResponseDto(
                app.getId(),
                app.getCompanyName(),
                app.getJobRole(),
                app.getStatus().name(),
                app.getPlatform().name(),
                app.getDateApplied(),
                app.getJobLink(),
                app.getLocation(),
                app.getSalaryMin(),
                app.getSalaryMax(),
                app.getNotes(),
                app.getJobDescription(),
                app.getCreatedAt(),
                app.getUpdatedAt()
        );
    }

    public ApplicationResponseDto updateStatus(Long id, String status, String email) {
        User currentUser = resolveUser(email);
        JobApplication app = findOwnedOrThrow(id, currentUser);
        ApplicationStatus newStatus = ApplicationStatus.valueOf(status);
        app.setStatus(newStatus);
        if (newStatus == ApplicationStatus.APPLIED && app.getDateApplied() == null) {
            app.setDateApplied(java.time.LocalDate.now());
        }
        app.setUpdatedAt(LocalDateTime.now());
        return toResponseDto(applicationRepository.save(app));
    }

    /**
     * Quick-add flow: creates a WISHLIST application from a pasted job description.
     * Company and role are optional — defaults to "Unknown" if not provided.
     */
    public ApplicationResponseDto quickAdd(QuickAddJobRequestDto request, String email) {
        User currentUser = resolveUser(email);

        JobApplication app = new JobApplication();
        app.setUser(currentUser);
        app.setCompanyName(
                request.getCompanyName() != null && !request.getCompanyName().isBlank()
                        ? request.getCompanyName()
                        : "Unknown");
        app.setJobRole(
                request.getJobRole() != null && !request.getJobRole().isBlank()
                        ? request.getJobRole()
                        : "Unknown");
        app.setStatus(ApplicationStatus.WISHLIST);
        app.setPlatform(ApplicationPlatform.OTHER);
        app.setJobLink(request.getJobLink());
        app.setJobDescription(request.getJobDescriptionText());
        app.setCreatedAt(LocalDateTime.now());
        app.setUpdatedAt(LocalDateTime.now());

        return toResponseDto(applicationRepository.save(app));
    }
}

/*
 * REQUIRES: UserRepository must have a findByEmail(String email) method
 * returning Optional<User>. You almost certainly already have this, since
 * CustomUserDetailsService calls the exact same method. If the method name
 * differs, adjust resolveUser() above to match.
 */