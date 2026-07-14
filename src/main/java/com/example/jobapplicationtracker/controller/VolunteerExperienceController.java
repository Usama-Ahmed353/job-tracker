package com.example.jobapplicationtracker.controller;

import com.example.jobapplicationtracker.dto.VolunteerExperienceRequestDto;
import com.example.jobapplicationtracker.dto.VolunteerExperienceResponseDto;
import com.example.jobapplicationtracker.security.SecurityUtils;
import com.example.jobapplicationtracker.service.VolunteerExperienceService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/volunteering")
public class VolunteerExperienceController {

    private final VolunteerExperienceService volunteerExperienceService;

    public VolunteerExperienceController(VolunteerExperienceService volunteerExperienceService) {
        this.volunteerExperienceService = volunteerExperienceService;
    }

    @GetMapping
    public ResponseEntity<List<VolunteerExperienceResponseDto>> list() {
        return ResponseEntity.ok(volunteerExperienceService.listForUser(SecurityUtils.getCurrentUserEmail()));
    }

    @PostMapping
    public ResponseEntity<VolunteerExperienceResponseDto> create(@Valid @RequestBody VolunteerExperienceRequestDto request) {
        return ResponseEntity.ok(volunteerExperienceService.create(request, SecurityUtils.getCurrentUserEmail()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<VolunteerExperienceResponseDto> update(@PathVariable Long id, @Valid @RequestBody VolunteerExperienceRequestDto request) {
        return ResponseEntity.ok(volunteerExperienceService.update(id, request, SecurityUtils.getCurrentUserEmail()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        volunteerExperienceService.delete(id, SecurityUtils.getCurrentUserEmail());
        return ResponseEntity.noContent().build();
    }
}
