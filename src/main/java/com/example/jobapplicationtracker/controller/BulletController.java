package com.example.jobapplicationtracker.controller;

import com.example.jobapplicationtracker.dto.BulletRequestDto;
import com.example.jobapplicationtracker.dto.BulletResponseDto;
import com.example.jobapplicationtracker.security.SecurityUtils;
import com.example.jobapplicationtracker.service.BulletService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/bullets")
public class BulletController {

    private final BulletService bulletService;

    public BulletController(BulletService bulletService) {
        this.bulletService = bulletService;
    }

    @PostMapping
    public ResponseEntity<BulletResponseDto> create(@Valid @RequestBody BulletRequestDto request) {
        return ResponseEntity.ok(bulletService.create(request, SecurityUtils.getCurrentUserEmail()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<BulletResponseDto> update(@PathVariable Long id,
                                                    @Valid @RequestBody BulletRequestDto request) {
        return ResponseEntity.ok(bulletService.update(id, request, SecurityUtils.getCurrentUserEmail()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        bulletService.delete(id, SecurityUtils.getCurrentUserEmail());
        return ResponseEntity.noContent().build();
    }
}