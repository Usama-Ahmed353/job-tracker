package com.example.jobapplicationtracker.controller;

import com.example.jobapplicationtracker.dto.PublicationRequestDto;
import com.example.jobapplicationtracker.dto.PublicationResponseDto;
import com.example.jobapplicationtracker.security.SecurityUtils;
import com.example.jobapplicationtracker.service.PublicationService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/publications")
public class PublicationController {

    private final PublicationService publicationService;

    public PublicationController(PublicationService publicationService) {
        this.publicationService = publicationService;
    }

    @GetMapping
    public ResponseEntity<List<PublicationResponseDto>> list() {
        return ResponseEntity.ok(publicationService.listForUser(SecurityUtils.getCurrentUserEmail()));
    }

    @PostMapping
    public ResponseEntity<PublicationResponseDto> create(@Valid @RequestBody PublicationRequestDto request) {
        return ResponseEntity.ok(publicationService.create(request, SecurityUtils.getCurrentUserEmail()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PublicationResponseDto> update(@PathVariable Long id, @Valid @RequestBody PublicationRequestDto request) {
        return ResponseEntity.ok(publicationService.update(id, request, SecurityUtils.getCurrentUserEmail()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        publicationService.delete(id, SecurityUtils.getCurrentUserEmail());
        return ResponseEntity.noContent().build();
    }
}
