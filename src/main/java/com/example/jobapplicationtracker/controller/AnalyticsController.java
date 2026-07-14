package com.example.jobapplicationtracker.controller;

import com.example.jobapplicationtracker.dto.analytics.*;
import com.example.jobapplicationtracker.security.SecurityUtils;
import com.example.jobapplicationtracker.service.AnalyticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/summary")
    public ResponseEntity<SummaryDto> summary() {
        String email = SecurityUtils.getCurrentUserEmail();
        return ResponseEntity.ok(analyticsService.getSummary(email));
    }

    @GetMapping("/trends")
    public ResponseEntity<List<TrendPointDto>> trends(@RequestParam(defaultValue = "monthly") String period) {
        String email = SecurityUtils.getCurrentUserEmail();
        return ResponseEntity.ok(analyticsService.getTrends(email, period));
    }

    @GetMapping("/by-platform")
    public ResponseEntity<List<PlatformStatsDto>> byPlatform() {
        String email = SecurityUtils.getCurrentUserEmail();
        return ResponseEntity.ok(analyticsService.getByPlatform(email));
    }

    @GetMapping("/by-status")
    public ResponseEntity<List<StatusCountDto>> byStatus() {
        String email = SecurityUtils.getCurrentUserEmail();
        return ResponseEntity.ok(analyticsService.getByStatus(email));
    }

    @GetMapping("/goals-progress")
    public ResponseEntity<GoalsProgressDto> goalsProgress() {
        String email = SecurityUtils.getCurrentUserEmail();
        return ResponseEntity.ok(analyticsService.getGoalsProgress(email));
    }
}