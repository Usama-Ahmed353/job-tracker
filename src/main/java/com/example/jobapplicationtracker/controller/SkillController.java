package com.example.jobapplicationtracker.controller;

import com.example.jobapplicationtracker.dto.SkillRequestDto;
import com.example.jobapplicationtracker.dto.SkillResponseDto;
import com.example.jobapplicationtracker.security.SecurityUtils;
import com.example.jobapplicationtracker.service.SkillService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/skills")
public class SkillController {

    private final SkillService skillService;

    public SkillController(SkillService skillService) {
        this.skillService = skillService;
    }

    @GetMapping
    public ResponseEntity<List<SkillResponseDto>> list() {
        return ResponseEntity.ok(skillService.listForUser(SecurityUtils.getCurrentUserEmail()));
    }

    @PostMapping
    public ResponseEntity<SkillResponseDto> create(@Valid @RequestBody SkillRequestDto request) {
        return ResponseEntity.ok(skillService.create(request, SecurityUtils.getCurrentUserEmail()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SkillResponseDto> update(@PathVariable Long id, @Valid @RequestBody SkillRequestDto request) {
        return ResponseEntity.ok(skillService.update(id, request, SecurityUtils.getCurrentUserEmail()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        skillService.delete(id, SecurityUtils.getCurrentUserEmail());
        return ResponseEntity.noContent().build();
    }
}