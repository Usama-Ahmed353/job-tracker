package com.example.jobapplicationtracker.controller;

import com.example.jobapplicationtracker.dto.MatchScoreRequestDto;
import com.example.jobapplicationtracker.dto.MatchScoreResponseDto;
import com.example.jobapplicationtracker.dto.ResumeRequestDto;
import com.example.jobapplicationtracker.dto.ResumeResponseDto;
import com.example.jobapplicationtracker.dto.ResumeSummaryDto;
import com.example.jobapplicationtracker.security.SecurityUtils;
import com.example.jobapplicationtracker.service.MatchScoreService;
import com.example.jobapplicationtracker.service.ResumeService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/resumes")
public class ResumeController {

    private final ResumeService resumeService;
    private final MatchScoreService matchScoreService;

    public ResumeController(ResumeService resumeService, MatchScoreService matchScoreService) {
        this.resumeService = resumeService;
        this.matchScoreService = matchScoreService;
    }

    @PostMapping
    public ResponseEntity<ResumeSummaryDto> create(@Valid @RequestBody ResumeRequestDto request) {
        String email = SecurityUtils.getCurrentUserEmail();
        return ResponseEntity.ok(resumeService.createResume(request, email));
    }

    @GetMapping
    public ResponseEntity<List<ResumeSummaryDto>> list() {
        String email = SecurityUtils.getCurrentUserEmail();
        return ResponseEntity.ok(resumeService.listResumes(email));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResumeResponseDto> get(@PathVariable Long id) {
        String email = SecurityUtils.getCurrentUserEmail();
        return ResponseEntity.ok(resumeService.getResumeWithContent(id, email));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ResumeSummaryDto> update(@PathVariable Long id,
                                                   @Valid @RequestBody ResumeRequestDto request) {
        String email = SecurityUtils.getCurrentUserEmail();
        return ResponseEntity.ok(resumeService.updateResume(id, request, email));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        String email = SecurityUtils.getCurrentUserEmail();
        resumeService.deleteResume(id, email);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/toggle-bullet/{bulletId}")
    public ResponseEntity<Map<String, Boolean>> toggleBullet(@PathVariable Long id,
                                                             @PathVariable Long bulletId) {
        String email = SecurityUtils.getCurrentUserEmail();
        boolean selected = resumeService.toggleBulletForResume(id, bulletId, email);
        return ResponseEntity.ok(Map.of("selected", selected));
    }

    @PostMapping("/{id}/duplicate")
    public ResponseEntity<ResumeSummaryDto> duplicate(@PathVariable Long id) {
        String email = SecurityUtils.getCurrentUserEmail();
        return ResponseEntity.ok(resumeService.duplicateResume(id, email));
    }

    @PostMapping("/{id}/match-score")
    public ResponseEntity<MatchScoreResponseDto> matchScore(@PathVariable Long id,
                                                            @Valid @RequestBody MatchScoreRequestDto request) {
        String email = SecurityUtils.getCurrentUserEmail();
        return ResponseEntity.ok(matchScoreService.computeMatchScore(id, request.getJobDescriptionText(), email));
    }
}
