package com.example.jobapplicationtracker.service;

import com.example.jobapplicationtracker.dto.SkillRequestDto;
import com.example.jobapplicationtracker.dto.SkillResponseDto;
import com.example.jobapplicationtracker.exception.ResourceNotFoundException;
import com.example.jobapplicationtracker.model.Skill;
import com.example.jobapplicationtracker.model.User;
import com.example.jobapplicationtracker.repository.SkillRepository;
import com.example.jobapplicationtracker.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SkillService {

    private final SkillRepository skillRepository;
    private final UserRepository userRepository;

    public SkillService(SkillRepository skillRepository, UserRepository userRepository) {
        this.skillRepository = skillRepository;
        this.userRepository = userRepository;
    }

    public List<SkillResponseDto> listForUser(String email) {
        User user = resolveUser(email);
        return skillRepository.findByUserOrderByNameAsc(user)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public SkillResponseDto create(SkillRequestDto request, String email) {
        User user = resolveUser(email);
        Skill skill = new Skill();
        skill.setUser(user);
        skill.setName(request.getName());
        skill.setCategory(request.getCategory());
        return toResponse(skillRepository.save(skill));
    }

    public SkillResponseDto update(Long id, SkillRequestDto request, String email) {
        Skill skill = findOwnedOrThrow(id, email);
        skill.setName(request.getName());
        skill.setCategory(request.getCategory());
        return toResponse(skillRepository.save(skill));
    }

    public void delete(Long id, String email) {
        Skill skill = findOwnedOrThrow(id, email);
        skillRepository.delete(skill);
    }

    private User resolveUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));
    }

    private Skill findOwnedOrThrow(Long id, String email) {
        User user = resolveUser(email);
        return skillRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException("Skill not found with id: " + id));
    }

    private SkillResponseDto toResponse(Skill skill) {
        return new SkillResponseDto(skill.getId(), skill.getName(), skill.getCategory());
    }
}