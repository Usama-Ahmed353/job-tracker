package com.example.jobapplicationtracker.controller;

import com.example.jobapplicationtracker.dto.AwardRequestDto;
import com.example.jobapplicationtracker.dto.AwardResponseDto;
import com.example.jobapplicationtracker.security.SecurityUtils;
import com.example.jobapplicationtracker.service.AwardService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/awards")
public class AwardController {

    private final AwardService awardService;

    public AwardController(AwardService awardService) {
        this.awardService = awardService;
    }

    @GetMapping
    public ResponseEntity<List<AwardResponseDto>> list() {
        return ResponseEntity.ok(awardService.listForUser(SecurityUtils.getCurrentUserEmail()));
    }

    @PostMapping
    public ResponseEntity<AwardResponseDto> create(@Valid @RequestBody AwardRequestDto request) {
        return ResponseEntity.ok(awardService.create(request, SecurityUtils.getCurrentUserEmail()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AwardResponseDto> update(@PathVariable Long id, @Valid @RequestBody AwardRequestDto request) {
        return ResponseEntity.ok(awardService.update(id, request, SecurityUtils.getCurrentUserEmail()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        awardService.delete(id, SecurityUtils.getCurrentUserEmail());
        return ResponseEntity.noContent().build();
    }
}
