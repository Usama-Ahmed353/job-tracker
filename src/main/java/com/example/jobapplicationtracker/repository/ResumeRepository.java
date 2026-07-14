package com.example.jobapplicationtracker.repository;

import com.example.jobapplicationtracker.model.Resume;
import com.example.jobapplicationtracker.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ResumeRepository extends JpaRepository<Resume, Long> {

    List<Resume> findByUserOrderByUpdatedAtDesc(User user);

    Optional<Resume> findByIdAndUser(Long id, User user);
}
