package com.example.jobapplicationtracker.controller;

import com.example.jobapplicationtracker.dto.EventRequestDto;
import com.example.jobapplicationtracker.dto.EventResponseDto;
import com.example.jobapplicationtracker.security.SecurityUtils;
import com.example.jobapplicationtracker.service.EventService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api")
public class EventController {

    private final EventService eventService;

    public EventController(EventService eventService) {
        this.eventService = eventService;
    }

    @GetMapping("/events")
    public ResponseEntity<List<EventResponseDto>> getEvents(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to) {
        String email = SecurityUtils.getCurrentUserEmail();
        return ResponseEntity.ok(eventService.getEventsInRange(email, from, to));
    }

    @GetMapping("/applications/{appId}/events")
    public ResponseEntity<List<EventResponseDto>> getEventsForApplication(@PathVariable Long appId) {
        String email = SecurityUtils.getCurrentUserEmail();
        return ResponseEntity.ok(eventService.getEventsForApplication(appId, email));
    }

    @PostMapping("/events")
    public ResponseEntity<EventResponseDto> create(@Valid @RequestBody EventRequestDto request) {
        String email = SecurityUtils.getCurrentUserEmail();
        return ResponseEntity.ok(eventService.create(request, email));
    }

    @PutMapping("/events/{id}")
    public ResponseEntity<EventResponseDto> update(@PathVariable Long id, @Valid @RequestBody EventRequestDto request) {
        String email = SecurityUtils.getCurrentUserEmail();
        return ResponseEntity.ok(eventService.update(id, request, email));
    }

    @PatchMapping("/events/{id}/complete")
    public ResponseEntity<EventResponseDto> markComplete(@PathVariable Long id) {
        String email = SecurityUtils.getCurrentUserEmail();
        return ResponseEntity.ok(eventService.markComplete(id, email));
    }

    @DeleteMapping("/events/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        String email = SecurityUtils.getCurrentUserEmail();
        eventService.delete(id, email);
        return ResponseEntity.noContent().build();
    }
}



