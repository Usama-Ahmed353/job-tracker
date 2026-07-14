package com.example.jobapplicationtracker.repository;

import com.example.jobapplicationtracker.model.VolunteerExperience;
import com.example.jobapplicationtracker.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface VolunteerExperienceRepository extends JpaRepository<VolunteerExperience, Long> {
    List<VolunteerExperience> findByUserOrderByStartDateDesc(User user);
    Optional<VolunteerExperience> findByIdAndUser(Long id, User user);
}
