package com.example.jobapplicationtracker.controller;

import com.example.jobapplicationtracker.dto.StatusUpdateRequest;
import com.example.jobapplicationtracker.dto.ApplicationRequestDto;
import com.example.jobapplicationtracker.dto.ApplicationResponseDto;
import com.example.jobapplicationtracker.dto.QuickAddJobRequestDto;
import com.example.jobapplicationtracker.model.JobListing;
import com.example.jobapplicationtracker.repository.JobListingRepository;
import com.example.jobapplicationtracker.security.SecurityUtils;
import com.example.jobapplicationtracker.service.ApplicationService;
import com.example.jobapplicationtracker.service.GeminiService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/applications")
public class ApplicationController {

    private final ApplicationService applicationService;
    private final JobListingRepository jobListingRepository; // Injected repository
    private final GeminiService geminiService; // Powers AI Job Search

    public ApplicationController(ApplicationService applicationService,
                                 JobListingRepository jobListingRepository,
                                 GeminiService geminiService) {
        this.applicationService = applicationService;
        this.jobListingRepository = jobListingRepository;
        this.geminiService = geminiService;
    }

    // Dynamic Database-Backed External Search (manual keyword/company/country filters)
    // Used by the "Search Jobs" sidebar page, over your own saved JobListing rows.
    @GetMapping("/external-search")
    public ResponseEntity<List<JobListing>> searchExternalJobs(
            @RequestParam(required = false, defaultValue = "") String keywords,
            @RequestParam(required = false, defaultValue = "") String company,
            @RequestParam(required = false, defaultValue = "") String country) {

        List<JobListing> activeListings = jobListingRepository.searchJobs(keywords, company, country);
        return ResponseEntity.ok(activeListings);
    }

    // AI-assisted DB search -- takes a free-text query, asks Gemini to turn it into
    // keywords/company/country, then reuses the same searchJobs() query. Still DB-backed.
    @GetMapping("/ai-search")
    public ResponseEntity<List<JobListing>> aiSearchJobs(@RequestParam String query) {
        GeminiService.JobSearchFilters filters = geminiService.parseJobQuery(query);
        List<JobListing> activeListings = jobListingRepository.searchJobs(
                filters.getKeywords(), filters.getCompany(), filters.getCountry());
        return ResponseEntity.ok(activeListings);
    }

    // AI Job Search -- live, web-grounded search (Gemini + Google Search tool).
    // Returns REAL job postings found on the web right now, not rows from our database.
    // Used by the dedicated "AI Job Search" sidebar page.
    @GetMapping("/live-search")
    public ResponseEntity<?> liveSearchJobs(@RequestParam String query) {
        try {
            List<GeminiService.LiveJobResult> results = geminiService.searchLiveJobs(query);
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                    .body(Map.of("error", "AI job search failed: " + e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<List<ApplicationResponseDto>> getAll() {
        String email = SecurityUtils.getCurrentUserEmail();
        return ResponseEntity.ok(applicationService.getAllForUser(email));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApplicationResponseDto> getOne(@PathVariable Long id) {
        String email = SecurityUtils.getCurrentUserEmail();
        return ResponseEntity.ok(applicationService.getOneForUser(id, email));
    }

    @PostMapping
    public ResponseEntity<ApplicationResponseDto> create(@Valid @RequestBody ApplicationRequestDto request) {
        String email = SecurityUtils.getCurrentUserEmail();
        ApplicationResponseDto created = applicationService.create(request, email);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApplicationResponseDto> update(@PathVariable Long id,
                                                         @Valid @RequestBody ApplicationRequestDto request) {
        String email = SecurityUtils.getCurrentUserEmail();
        return ResponseEntity.ok(applicationService.update(id, request, email));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        String email = SecurityUtils.getCurrentUserEmail();
        applicationService.delete(id, email);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApplicationResponseDto> updateStatus(@PathVariable Long id,
                                                               @RequestBody StatusUpdateRequest request) {
        String email = SecurityUtils.getCurrentUserEmail();
        return ResponseEntity.ok(applicationService.updateStatus(id, request.getStatus(), email));
    }

    @PostMapping("/quick-add")
    public ResponseEntity<ApplicationResponseDto> quickAdd(@Valid @RequestBody QuickAddJobRequestDto request) {
        String email = SecurityUtils.getCurrentUserEmail();
        ApplicationResponseDto created = applicationService.quickAdd(request, email);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
    @PostMapping("/generate-cover-letter")
    public ResponseEntity<Map<String, String>> generateCoverLetter(@RequestBody Map<String, String> requestPayload) {
        String email = com.example.jobapplicationtracker.security.SecurityUtils.getCurrentUserEmail();
        String jobDescription = requestPayload.get("jobDescription");

        if (jobDescription == null || jobDescription.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Job description cannot be empty"));
        }

        // Fix: Use a pure Java fallback logic string slice instead of browser references
        String fullName = "Applicant";
        if (email != null && email.contains("@")) {
            fullName = email.split("@")[0];
        }

        String generatedText = geminiService.generateCoverLetterText(fullName, email, jobDescription);
        return ResponseEntity.ok(Map.of("content", generatedText));
    }
}