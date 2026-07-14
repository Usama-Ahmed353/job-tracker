package com.example.jobapplicationtracker.repository;

import com.example.jobapplicationtracker.model.Project;
import com.example.jobapplicationtracker.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProjectRepository extends JpaRepository<Project, Long> {
    List<Project> findByUserOrderByStartDateDesc(User user);
    Optional<Project> findByIdAndUser(Long id, User user);
}
