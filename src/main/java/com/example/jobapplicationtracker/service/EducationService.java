package com.example.jobapplicationtracker.service;

import com.example.jobapplicationtracker.dto.EducationRequestDto;
import com.example.jobapplicationtracker.dto.EducationResponseDto;
import com.example.jobapplicationtracker.exception.ResourceNotFoundException;
import com.example.jobapplicationtracker.model.Education;
import com.example.jobapplicationtracker.model.User;
import com.example.jobapplicationtracker.repository.EducationRepository;
import com.example.jobapplicationtracker.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EducationService {

    private final EducationRepository educationRepository;
    private final UserRepository userRepository;

    public EducationService(EducationRepository educationRepository, UserRepository userRepository) {
        this.educationRepository = educationRepository;
        this.userRepository = userRepository;
    }

    public List<EducationResponseDto> listForUser(String email) {
        User user = resolveUser(email);
        return educationRepository.findByUserOrderByStartDateDesc(user)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public EducationResponseDto create(EducationRequestDto request, String email) {
        User user = resolveUser(email);
        Education education = new Education();
        education.setUser(user);
        applyRequest(education, request);
        return toResponse(educationRepository.save(education));
    }

    public EducationResponseDto update(Long id, EducationRequestDto request, String email) {
        Education education = findOwnedOrThrow(id, email);
        applyRequest(education, request);
        return toResponse(educationRepository.save(education));
    }

    public void delete(Long id, String email) {
        Education education = findOwnedOrThrow(id, email);
        educationRepository.delete(education);
    }

    private void applyRequest(Education education, EducationRequestDto request) {
        education.setInstitution(request.getInstitution());
        education.setDegree(request.getDegree());
        education.setFieldOfStudy(request.getFieldOfStudy());
        education.setStartDate(request.getStartDate());
        education.setEndDate(request.getEndDate());
    }

    private User resolveUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));
    }

    private Education findOwnedOrThrow(Long id, String email) {
        User user = resolveUser(email);
        return educationRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException("Education not found with id: " + id));
    }

    private EducationResponseDto toResponse(Education e) {
        return new EducationResponseDto(e.getId(), e.getInstitution(), e.getDegree(),
                e.getFieldOfStudy(), e.getStartDate(), e.getEndDate());
    }
}