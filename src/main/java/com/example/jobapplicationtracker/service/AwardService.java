package com.example.jobapplicationtracker.service;

import com.example.jobapplicationtracker.dto.AwardRequestDto;
import com.example.jobapplicationtracker.dto.AwardResponseDto;
import com.example.jobapplicationtracker.exception.ResourceNotFoundException;
import com.example.jobapplicationtracker.model.Award;
import com.example.jobapplicationtracker.model.User;
import com.example.jobapplicationtracker.repository.AwardRepository;
import com.example.jobapplicationtracker.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AwardService {

    private final AwardRepository awardRepository;
    private final UserRepository userRepository;

    public AwardService(AwardRepository awardRepository, UserRepository userRepository) {
        this.awardRepository = awardRepository;
        this.userRepository = userRepository;
    }

    public List<AwardResponseDto> listForUser(String email) {
        User user = resolveUser(email);
        return awardRepository.findByUserOrderByDateReceivedDesc(user)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public AwardResponseDto create(AwardRequestDto request, String email) {
        User user = resolveUser(email);
        Award award = new Award();
        award.setUser(user);
        applyRequest(award, request);
        return toResponse(awardRepository.save(award));
    }

    public AwardResponseDto update(Long id, AwardRequestDto request, String email) {
        Award award = findOwnedOrThrow(id, email);
        applyRequest(award, request);
        return toResponse(awardRepository.save(award));
    }

    public void delete(Long id, String email) {
        Award award = findOwnedOrThrow(id, email);
        awardRepository.delete(award);
    }

    private void applyRequest(Award award, AwardRequestDto request) {
        award.setTitle(request.getTitle());
        award.setIssuer(request.getIssuer());
        award.setDateReceived(request.getDateReceived());
        award.setDescription(request.getDescription());
    }

    private User resolveUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));
    }

    private Award findOwnedOrThrow(Long id, String email) {
        User user = resolveUser(email);
        return awardRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException("Award not found with id: " + id));
    }

    private AwardResponseDto toResponse(Award award) {
        return new AwardResponseDto(award.getId(), award.getTitle(), award.getIssuer(), award.getDateReceived(), award.getDescription());
    }
}
