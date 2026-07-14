package com.example.jobapplicationtracker.controller;

import com.example.jobapplicationtracker.dto.BulletAiRequestDto;
import com.example.jobapplicationtracker.dto.BulletAiResponseDto;
import com.example.jobapplicationtracker.security.SecurityUtils;
import com.example.jobapplicationtracker.service.BulletAiService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/bullets")
public class BulletAiController {

    private final BulletAiService bulletAiService;

    public BulletAiController(BulletAiService bulletAiService) {
        this.bulletAiService = bulletAiService;
    }

    @PostMapping("/{id}/improve")
    public ResponseEntity<BulletAiResponseDto> improve(@PathVariable Long id,
                                                       @RequestBody(required = false) BulletAiRequestDto request) {
        String email = SecurityUtils.getCurrentUserEmail();
        String jobDescription = (request != null) ? request.getJobDescription() : null;
        return ResponseEntity.ok(bulletAiService.improveBullet(id, jobDescription, email));
    }
}