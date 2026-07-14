package com.example.jobapplicationtracker.service;

import com.example.jobapplicationtracker.dto.BulletRequestDto;
import com.example.jobapplicationtracker.dto.BulletResponseDto;
import com.example.jobapplicationtracker.exception.ResourceNotFoundException;
import com.example.jobapplicationtracker.model.Bullet;
import com.example.jobapplicationtracker.model.User;
import com.example.jobapplicationtracker.model.WorkExperience;
import com.example.jobapplicationtracker.repository.BulletRepository;
import com.example.jobapplicationtracker.repository.UserRepository;
import com.example.jobapplicationtracker.repository.WorkExperienceRepository;
import org.springframework.stereotype.Service;

@Service
public class BulletService {

    private final BulletRepository bulletRepository;
    private final WorkExperienceRepository workExperienceRepository;
    private final UserRepository userRepository;

    public BulletService(BulletRepository bulletRepository,
                         WorkExperienceRepository workExperienceRepository,
                         UserRepository userRepository) {
        this.bulletRepository = bulletRepository;
        this.workExperienceRepository = workExperienceRepository;
        this.userRepository = userRepository;
    }

    public BulletResponseDto create(BulletRequestDto request, String email) {
        User user = resolveUser(email);

        WorkExperience exp = workExperienceRepository.findById(request.getWorkExperienceId())
                .orElseThrow(() -> new ResourceNotFoundException("Work experience not found: " + request.getWorkExperienceId()));
        if (!exp.getUser().getId().equals(user.getId())) {
            throw new ResourceNotFoundException("Work experience not found: " + request.getWorkExperienceId());
        }

        Bullet bullet = new Bullet();
        bullet.setWorkExperience(exp);
        bullet.setContent(request.getContent());
        bullet.setDisplayOrder(request.getDisplayOrder() != null ? request.getDisplayOrder() : exp.getBullets().size() + 1);

        return toResponseDto(bulletRepository.save(bullet));
    }

    public BulletResponseDto update(Long id, BulletRequestDto request, String email) {
        Bullet bullet = findOwnedOrThrow(id, email);
        bullet.setContent(request.getContent());
        if (request.getDisplayOrder() != null) {
            bullet.setDisplayOrder(request.getDisplayOrder());
        }
        return toResponseDto(bulletRepository.save(bullet));
    }

    public void delete(Long id, String email) {
        Bullet bullet = findOwnedOrThrow(id, email);
        bulletRepository.delete(bullet);
    }

    private User resolveUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));
    }

    private Bullet findOwnedOrThrow(Long id, String email) {
        User user = resolveUser(email);
        Bullet bullet = bulletRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bullet not found: " + id));
        if (!bullet.getWorkExperience().getUser().getId().equals(user.getId())) {
            throw new ResourceNotFoundException("Bullet not found: " + id);
        }
        return bullet;
    }

    private BulletResponseDto toResponseDto(Bullet bullet) {
        return new BulletResponseDto(bullet.getId(), bullet.getContent(), bullet.getDisplayOrder());
    }
}