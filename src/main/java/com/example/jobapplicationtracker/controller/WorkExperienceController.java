package com.example.jobapplicationtracker.controller;

import com.example.jobapplicationtracker.dto.WorkExperienceRequestDto;
import com.example.jobapplicationtracker.dto.WorkExperienceResponseDto;
import com.example.jobapplicationtracker.security.SecurityUtils;
import com.example.jobapplicationtracker.service.WorkExperienceService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/work-experiences")
public class WorkExperienceController {

    private final WorkExperienceService workExperienceService;

    public WorkExperienceController(WorkExperienceService workExperienceService) {
        this.workExperienceService = workExperienceService;
    }

    @GetMapping
    public ResponseEntity<List<WorkExperienceResponseDto>> list() {
        return ResponseEntity.ok(workExperienceService.listForUser(SecurityUtils.getCurrentUserEmail()));
    }

    @PostMapping
    public ResponseEntity<WorkExperienceResponseDto> create(@Valid @RequestBody WorkExperienceRequestDto request) {
        return ResponseEntity.ok(workExperienceService.create(request, SecurityUtils.getCurrentUserEmail()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<WorkExperienceResponseDto> update(@PathVariable Long id,
                                                            @Valid @RequestBody WorkExperienceRequestDto request) {
        return ResponseEntity.ok(workExperienceService.update(id, request, SecurityUtils.getCurrentUserEmail()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        workExperienceService.delete(id, SecurityUtils.getCurrentUserEmail());
        return ResponseEntity.noContent().build();
    }
}