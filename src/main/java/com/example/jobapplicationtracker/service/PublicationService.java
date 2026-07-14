package com.example.jobapplicationtracker.service;

import com.example.jobapplicationtracker.dto.PublicationRequestDto;
import com.example.jobapplicationtracker.dto.PublicationResponseDto;
import com.example.jobapplicationtracker.exception.ResourceNotFoundException;
import com.example.jobapplicationtracker.model.Publication;
import com.example.jobapplicationtracker.model.User;
import com.example.jobapplicationtracker.repository.PublicationRepository;
import com.example.jobapplicationtracker.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PublicationService {

    private final PublicationRepository publicationRepository;
    private final UserRepository userRepository;

    public PublicationService(PublicationRepository publicationRepository, UserRepository userRepository) {
        this.publicationRepository = publicationRepository;
        this.userRepository = userRepository;
    }

    public List<PublicationResponseDto> listForUser(String email) {
        User user = resolveUser(email);
        return publicationRepository.findByUserOrderByPublicationDateDesc(user)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public PublicationResponseDto create(PublicationRequestDto request, String email) {
        User user = resolveUser(email);
        Publication publication = new Publication();
        publication.setUser(user);
        applyRequest(publication, request);
        return toResponse(publicationRepository.save(publication));
    }

    public PublicationResponseDto update(Long id, PublicationRequestDto request, String email) {
        Publication publication = findOwnedOrThrow(id, email);
        applyRequest(publication, request);
        return toResponse(publicationRepository.save(publication));
    }

    public void delete(Long id, String email) {
        Publication publication = findOwnedOrThrow(id, email);
        publicationRepository.delete(publication);
    }

    private void applyRequest(Publication publication, PublicationRequestDto request) {
        publication.setTitle(request.getTitle());
        publication.setPublisher(request.getPublisher());
        publication.setPublicationDate(request.getPublicationDate());
        publication.setUrl(request.getUrl());
        publication.setDescription(request.getDescription());
    }

    private User resolveUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));
    }

    private Publication findOwnedOrThrow(Long id, String email) {
        User user = resolveUser(email);
        return publicationRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException("Publication not found with id: " + id));
    }

    private PublicationResponseDto toResponse(Publication publication) {
        return new PublicationResponseDto(publication.getId(), publication.getTitle(), publication.getPublisher(), publication.getPublicationDate(), publication.getUrl(), publication.getDescription());
    }
}
