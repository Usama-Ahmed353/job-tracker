package com.example.jobapplicationtracker.service;

import com.example.jobapplicationtracker.dto.CertificationRequestDto;
import com.example.jobapplicationtracker.dto.CertificationResponseDto;
import com.example.jobapplicationtracker.exception.ResourceNotFoundException;
import com.example.jobapplicationtracker.model.Certification;
import com.example.jobapplicationtracker.model.User;
import com.example.jobapplicationtracker.repository.CertificationRepository;
import com.example.jobapplicationtracker.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CertificationService {

    private final CertificationRepository certificationRepository;
    private final UserRepository userRepository;

    public CertificationService(CertificationRepository certificationRepository, UserRepository userRepository) {
        this.certificationRepository = certificationRepository;
        this.userRepository = userRepository;
    }

    public List<CertificationResponseDto> listForUser(String email) {
        User user = resolveUser(email);
        return certificationRepository.findByUserOrderByIssueDateDesc(user)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public CertificationResponseDto create(CertificationRequestDto request, String email) {
        User user = resolveUser(email);
        Certification certification = new Certification();
        certification.setUser(user);
        applyRequest(certification, request);
        return toResponse(certificationRepository.save(certification));
    }

    public CertificationResponseDto update(Long id, CertificationRequestDto request, String email) {
        Certification certification = findOwnedOrThrow(id, email);
        applyRequest(certification, request);
        return toResponse(certificationRepository.save(certification));
    }

    public void delete(Long id, String email) {
        Certification certification = findOwnedOrThrow(id, email);
        certificationRepository.delete(certification);
    }

    private void applyRequest(Certification certification, CertificationRequestDto request) {
        certification.setName(request.getName());
        certification.setIssuingOrganization(request.getIssuingOrganization());
        certification.setIssueDate(request.getIssueDate());
        certification.setExpirationDate(request.getExpirationDate());
        certification.setCredentialUrl(request.getCredentialUrl());
    }

    private User resolveUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));
    }

    private Certification findOwnedOrThrow(Long id, String email) {
        User user = resolveUser(email);
        return certificationRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException("Certification not found with id: " + id));
    }

    private CertificationResponseDto toResponse(Certification certification) {
        return new CertificationResponseDto(certification.getId(), certification.getName(), certification.getIssuingOrganization(), certification.getIssueDate(), certification.getExpirationDate(), certification.getCredentialUrl());
    }
}
