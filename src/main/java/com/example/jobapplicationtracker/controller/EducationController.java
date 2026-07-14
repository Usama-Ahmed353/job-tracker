package com.example.jobapplicationtracker.controller;

import com.example.jobapplicationtracker.dto.EducationRequestDto;
import com.example.jobapplicationtracker.dto.EducationResponseDto;
import com.example.jobapplicationtracker.security.SecurityUtils;
import com.example.jobapplicationtracker.service.EducationService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/education")
public class EducationController {

    private final EducationService educationService;

    public EducationController(EducationService educationService) {
        this.educationService = educationService;
    }

    @GetMapping
    public ResponseEntity<List<EducationResponseDto>> list() {
        return ResponseEntity.ok(educationService.listForUser(SecurityUtils.getCurrentUserEmail()));
    }

    @PostMapping
    public ResponseEntity<EducationResponseDto> create(@Valid @RequestBody EducationRequestDto request) {
        return ResponseEntity.ok(educationService.create(request, SecurityUtils.getCurrentUserEmail()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<EducationResponseDto> update(@PathVariable Long id, @Valid @RequestBody EducationRequestDto request) {
        return ResponseEntity.ok(educationService.update(id, request, SecurityUtils.getCurrentUserEmail()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        educationService.delete(id, SecurityUtils.getCurrentUserEmail());
        return ResponseEntity.noContent().build();
    }
}