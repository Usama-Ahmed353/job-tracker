package com.example.jobapplicationtracker.controller;

import com.example.jobapplicationtracker.dto.CertificationRequestDto;
import com.example.jobapplicationtracker.dto.CertificationResponseDto;
import com.example.jobapplicationtracker.security.SecurityUtils;
import com.example.jobapplicationtracker.service.CertificationService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/certifications")
public class CertificationController {

    private final CertificationService certificationService;

    public CertificationController(CertificationService certificationService) {
        this.certificationService = certificationService;
    }

    @GetMapping
    public ResponseEntity<List<CertificationResponseDto>> list() {
        return ResponseEntity.ok(certificationService.listForUser(SecurityUtils.getCurrentUserEmail()));
    }

    @PostMapping
    public ResponseEntity<CertificationResponseDto> create(@Valid @RequestBody CertificationRequestDto request) {
        return ResponseEntity.ok(certificationService.create(request, SecurityUtils.getCurrentUserEmail()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CertificationResponseDto> update(@PathVariable Long id, @Valid @RequestBody CertificationRequestDto request) {
        return ResponseEntity.ok(certificationService.update(id, request, SecurityUtils.getCurrentUserEmail()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        certificationService.delete(id, SecurityUtils.getCurrentUserEmail());
        return ResponseEntity.noContent().build();
    }
}
