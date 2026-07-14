package com.example.jobapplicationtracker.service;

import com.example.jobapplicationtracker.dto.ProjectRequestDto;
import com.example.jobapplicationtracker.dto.ProjectResponseDto;
import com.example.jobapplicationtracker.exception.ResourceNotFoundException;
import com.example.jobapplicationtracker.model.Project;
import com.example.jobapplicationtracker.model.User;
import com.example.jobapplicationtracker.repository.ProjectRepository;
import com.example.jobapplicationtracker.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    public ProjectService(ProjectRepository projectRepository, UserRepository userRepository) {
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
    }

    public List<ProjectResponseDto> listForUser(String email) {
        User user = resolveUser(email);
        return projectRepository.findByUserOrderByStartDateDesc(user)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public ProjectResponseDto create(ProjectRequestDto request, String email) {
        User user = resolveUser(email);
        Project project = new Project();
        project.setUser(user);
        applyRequest(project, request);
        return toResponse(projectRepository.save(project));
    }

    public ProjectResponseDto update(Long id, ProjectRequestDto request, String email) {
        Project project = findOwnedOrThrow(id, email);
        applyRequest(project, request);
        return toResponse(projectRepository.save(project));
    }

    public void delete(Long id, String email) {
        Project project = findOwnedOrThrow(id, email);
        projectRepository.delete(project);
    }

    private void applyRequest(Project project, ProjectRequestDto request) {
        project.setName(request.getName());
        project.setDescription(request.getDescription());
        project.setTechnologies(request.getTechnologies());
        project.setProjectUrl(request.getProjectUrl());
        project.setStartDate(request.getStartDate());
        project.setEndDate(request.getEndDate());
    }

    private User resolveUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));
    }

    private Project findOwnedOrThrow(Long id, String email) {
        User user = resolveUser(email);
        return projectRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + id));
    }

    private ProjectResponseDto toResponse(Project project) {
        return new ProjectResponseDto(project.getId(), project.getName(), project.getDescription(), project.getTechnologies(), project.getProjectUrl(), project.getStartDate(), project.getEndDate());
    }
}
