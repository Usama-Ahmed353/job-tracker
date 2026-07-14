package com.example.jobapplicationtracker.repository;

import com.example.jobapplicationtracker.model.Education;
import com.example.jobapplicationtracker.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EducationRepository extends JpaRepository<Education, Long> {

    List<Education> findByUserOrderByStartDateDesc(User user);

    Optional<Education> findByIdAndUser(Long id, User user);
}
