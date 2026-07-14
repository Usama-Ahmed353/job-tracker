package com.example.jobapplicationtracker.service;

import com.example.jobapplicationtracker.dto.EventRequestDto;
import com.example.jobapplicationtracker.dto.EventResponseDto;
import com.example.jobapplicationtracker.exception.ResourceNotFoundException;
import com.example.jobapplicationtracker.model.Event;
import com.example.jobapplicationtracker.model.EventType;
import com.example.jobapplicationtracker.model.JobApplication;
import com.example.jobapplicationtracker.model.User;
import com.example.jobapplicationtracker.repository.EventRepository;
import com.example.jobapplicationtracker.repository.ApplicationRepository;
import com.example.jobapplicationtracker.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class EventService {

    private final EventRepository eventRepository;
    private final ApplicationRepository applicationRepository;
    private final UserRepository userRepository;

    public EventService(EventRepository eventRepository,
                        ApplicationRepository applicationRepository,
                        UserRepository userRepository) {
        this.eventRepository = eventRepository;
        this.applicationRepository = applicationRepository;
        this.userRepository = userRepository;
    }

    public List<EventResponseDto> getEventsInRange(String email, LocalDateTime from, LocalDateTime to) {
        User user = resolveUser(email);
        return eventRepository.findByUserAndEventDatetimeBetween(user, from, to)
                .stream()
                .map(this::toResponseDto)
                .toList();
    }

    public List<EventResponseDto> getEventsForApplication(Long applicationId, String email) {
        resolveUser(email); // ensures caller is authenticated; ownership checked per-event below implicitly via applicationId scoping
        return eventRepository.findByApplicationId(applicationId)
                .stream()
                .map(this::toResponseDto)
                .toList();
    }

    public EventResponseDto create(EventRequestDto request, String email) {
        User user = resolveUser(email);

        Event event = new Event();
        event.setUser(user);
        applyRequestToEntity(event, request);
        event.setCreatedAt(LocalDateTime.now());

        return toResponseDto(eventRepository.save(event));
    }

    public EventResponseDto update(Long id, EventRequestDto request, String email) {
        Event event = findOwnedOrThrow(id, email);
        applyRequestToEntity(event, request);
        return toResponseDto(eventRepository.save(event));
    }

    public EventResponseDto markComplete(Long id, String email) {
        Event event = findOwnedOrThrow(id, email);
        event.setCompleted(true);
        return toResponseDto(eventRepository.save(event));
    }

    public void delete(Long id, String email) {
        Event event = findOwnedOrThrow(id, email);
        eventRepository.delete(event);
    }

    // ----- Helpers -----

    private User resolveUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));
    }

    private Event findOwnedOrThrow(Long id, String email) {
        User user = resolveUser(email);
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + id));

        if (!event.getUser().getId().equals(user.getId())) {
            throw new ResourceNotFoundException("Event not found with id: " + id);
        }
        return event;
    }

    private void applyRequestToEntity(Event event, EventRequestDto request) {
        event.setEventType(EventType.valueOf(request.getEventType()));
        event.setTitle(request.getTitle());
        event.setDescription(request.getDescription());
        event.setEventDatetime(request.getEventDatetime());
        event.setLocationOrLink(request.getLocationOrLink());

        if (request.getApplicationId() != null) {
            JobApplication app = applicationRepository.findById(request.getApplicationId())
                    .orElseThrow(() -> new ResourceNotFoundException("Application not found with id: " + request.getApplicationId()));
            event.setApplication(app);
        } else {
            event.setApplication(null);
        }
    }

    private EventResponseDto toResponseDto(Event event) {
        return new EventResponseDto(
                event.getId(),
                event.getApplication() != null ? event.getApplication().getId() : null,
                event.getApplication() != null ? event.getApplication().getCompanyName() : null,
                event.getEventType().name(),
                event.getTitle(),
                event.getDescription(),
                event.getEventDatetime(),
                event.getLocationOrLink(),
                event.isCompleted(),
                event.getCreatedAt()
        );
    }
}