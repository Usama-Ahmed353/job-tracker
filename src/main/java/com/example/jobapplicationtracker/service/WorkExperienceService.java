package com.example.jobapplicationtracker.service;

import com.example.jobapplicationtracker.dto.BulletResponseDto;
import com.example.jobapplicationtracker.dto.WorkExperienceRequestDto;
import com.example.jobapplicationtracker.dto.WorkExperienceResponseDto;
import com.example.jobapplicationtracker.exception.ResourceNotFoundException;
import com.example.jobapplicationtracker.model.User;
import com.example.jobapplicationtracker.model.WorkExperience;
import com.example.jobapplicationtracker.repository.UserRepository;
import com.example.jobapplicationtracker.repository.WorkExperienceRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class WorkExperienceService {

    private final WorkExperienceRepository workExperienceRepository;
    private final UserRepository userRepository;

    public WorkExperienceService(WorkExperienceRepository workExperienceRepository, UserRepository userRepository) {
        this.workExperienceRepository = workExperienceRepository;
        this.userRepository = userRepository;
    }

    public List<WorkExperienceResponseDto> listForUser(String email) {
        User user = resolveUser(email);
        return workExperienceRepository.findByUserId(user.getId())
                .stream().map(this::toResponseDto).toList();
    }

    public WorkExperienceResponseDto create(WorkExperienceRequestDto request, String email) {
        User user = resolveUser(email);

        WorkExperience exp = new WorkExperience();
        exp.setUser(user);
        exp.setCompanyName(request.getCompanyName());
        exp.setJobTitle(request.getJobTitle());
        exp.setStartDate(request.getStartDate());
        exp.setEndDate(request.getEndDate());
        exp.setLocation(request.getLocation());

        return toResponseDto(workExperienceRepository.save(exp));
    }

    public WorkExperienceResponseDto update(Long id, WorkExperienceRequestDto request, String email) {
        WorkExperience exp = findOwnedOrThrow(id, email);
        exp.setCompanyName(request.getCompanyName());
        exp.setJobTitle(request.getJobTitle());
        exp.setStartDate(request.getStartDate());
        exp.setEndDate(request.getEndDate());
        exp.setLocation(request.getLocation());
        return toResponseDto(workExperienceRepository.save(exp));
    }

    public void delete(Long id, String email) {
        WorkExperience exp = findOwnedOrThrow(id, email);
        workExperienceRepository.delete(exp); // cascades to bullets via orphanRemoval
    }

    private User resolveUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));
    }

    private WorkExperience findOwnedOrThrow(Long id, String email) {
        User user = resolveUser(email);
        WorkExperience exp = workExperienceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Work experience not found: " + id));
        if (!exp.getUser().getId().equals(user.getId())) {
            throw new ResourceNotFoundException("Work experience not found: " + id);
        }
        return exp;
    }

    private WorkExperienceResponseDto toResponseDto(WorkExperience exp) {
        List<BulletResponseDto> bulletDtos = exp.getBullets().stream()
                .map(b -> new BulletResponseDto(b.getId(), b.getContent(), b.getDisplayOrder()))
                .toList();
        return new WorkExperienceResponseDto(exp.getId(), exp.getCompanyName(), exp.getJobTitle(),
                exp.getStartDate(), exp.getEndDate(), exp.getLocation(), bulletDtos);
    }
}