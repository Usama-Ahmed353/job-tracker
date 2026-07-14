package com.example.jobapplicationtracker.controller;

import com.example.jobapplicationtracker.dto.ProjectRequestDto;
import com.example.jobapplicationtracker.dto.ProjectResponseDto;
import com.example.jobapplicationtracker.security.SecurityUtils;
import com.example.jobapplicationtracker.service.ProjectService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    private final ProjectService projectService;

    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    @GetMapping
    public ResponseEntity<List<ProjectResponseDto>> list() {
        return ResponseEntity.ok(projectService.listForUser(SecurityUtils.getCurrentUserEmail()));
    }

    @PostMapping
    public ResponseEntity<ProjectResponseDto> create(@Valid @RequestBody ProjectRequestDto request) {
        return ResponseEntity.ok(projectService.create(request, SecurityUtils.getCurrentUserEmail()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProjectResponseDto> update(@PathVariable Long id, @Valid @RequestBody ProjectRequestDto request) {
        return ResponseEntity.ok(projectService.update(id, request, SecurityUtils.getCurrentUserEmail()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        projectService.delete(id, SecurityUtils.getCurrentUserEmail());
        return ResponseEntity.noContent().build();
    }
}
