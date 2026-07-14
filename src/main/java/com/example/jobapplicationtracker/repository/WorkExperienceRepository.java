package com.example.jobapplicationtracker.repository;

import com.example.jobapplicationtracker.model.WorkExperience;
import com.example.jobapplicationtracker.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface WorkExperienceRepository extends JpaRepository<WorkExperience, Long> {

    List<WorkExperience> findByUserOrderByStartDateDesc(User user);

    Optional<WorkExperience> findByIdAndUser(Long id, User user);

    List<WorkExperience> findByUserId(Long userId);
}
