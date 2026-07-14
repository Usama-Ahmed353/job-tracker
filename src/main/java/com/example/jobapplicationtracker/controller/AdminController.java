package com.example.jobapplicationtracker.controller;

import com.example.jobapplicationtracker.model.JobListing;
import com.example.jobapplicationtracker.model.Role;
import com.example.jobapplicationtracker.model.User;
import com.example.jobapplicationtracker.repository.JobListingRepository;
import com.example.jobapplicationtracker.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserRepository userRepository;
    private final JobListingRepository jobListingRepository;

    // Fixed constructor to inject BOTH required repositories correctly
    public AdminController(UserRepository userRepository, JobListingRepository jobListingRepository) {
        this.userRepository = userRepository;
        this.jobListingRepository = jobListingRepository;
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @PatchMapping("/users/{id}/role")
    public ResponseEntity<User> updateUserRole(@PathVariable Long id, @RequestBody RoleUpdateRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setRole(Role.valueOf(request.getRole()));
        return ResponseEntity.ok(userRepository.save(user));
    }

    // Single consolidated endpoint for creating dynamic job openings
    @PostMapping("/jobs")
    public ResponseEntity<JobListing> createJobListing(@Valid @RequestBody JobListing jobListing) {
        JobListing savedJob = jobListingRepository.save(jobListing);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedJob);
    }

    public static class RoleUpdateRequest {
        private String role;
        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
    }
}