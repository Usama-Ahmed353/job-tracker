package com.example.jobapplicationtracker.service;

import com.example.jobapplicationtracker.dto.VolunteerExperienceRequestDto;
import com.example.jobapplicationtracker.dto.VolunteerExperienceResponseDto;
import com.example.jobapplicationtracker.exception.ResourceNotFoundException;
import com.example.jobapplicationtracker.model.VolunteerExperience;
import com.example.jobapplicationtracker.model.User;
import com.example.jobapplicationtracker.repository.VolunteerExperienceRepository;
import com.example.jobapplicationtracker.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class VolunteerExperienceService {

    private final VolunteerExperienceRepository volunteerExperienceRepository;
    private final UserRepository userRepository;

    public VolunteerExperienceService(VolunteerExperienceRepository volunteerExperienceRepository, UserRepository userRepository) {
        this.volunteerExperienceRepository = volunteerExperienceRepository;
        this.userRepository = userRepository;
    }

    public List<VolunteerExperienceResponseDto> listForUser(String email) {
        User user = resolveUser(email);
        return volunteerExperienceRepository.findByUserOrderByStartDateDesc(user)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public VolunteerExperienceResponseDto create(VolunteerExperienceRequestDto request, String email) {
        User user = resolveUser(email);
        VolunteerExperience volunteerExperience = new VolunteerExperience();
        volunteerExperience.setUser(user);
        applyRequest(volunteerExperience, request);
        return toResponse(volunteerExperienceRepository.save(volunteerExperience));
    }

    public VolunteerExperienceResponseDto update(Long id, VolunteerExperienceRequestDto request, String email) {
        VolunteerExperience volunteerExperience = findOwnedOrThrow(id, email);
        applyRequest(volunteerExperience, request);
        return toResponse(volunteerExperienceRepository.save(volunteerExperience));
    }

    public void delete(Long id, String email) {
        VolunteerExperience volunteerExperience = findOwnedOrThrow(id, email);
        volunteerExperienceRepository.delete(volunteerExperience);
    }

    private void applyRequest(VolunteerExperience volunteerExperience, VolunteerExperienceRequestDto request) {
        volunteerExperience.setOrganization(request.getOrganization());
        volunteerExperience.setRole(request.getRole());
        volunteerExperience.setStartDate(request.getStartDate());
        volunteerExperience.setEndDate(request.getEndDate());
        volunteerExperience.setDescription(request.getDescription());
    }

    private User resolveUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));
    }

    private VolunteerExperience findOwnedOrThrow(Long id, String email) {
        User user = resolveUser(email);
        return volunteerExperienceRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException("VolunteerExperience not found with id: " + id));
    }

    private VolunteerExperienceResponseDto toResponse(VolunteerExperience volunteerExperience) {
        return new VolunteerExperienceResponseDto(volunteerExperience.getId(), volunteerExperience.getOrganization(), volunteerExperience.getRole(), volunteerExperience.getStartDate(), volunteerExperience.getEndDate(), volunteerExperience.getDescription());
    }
}
