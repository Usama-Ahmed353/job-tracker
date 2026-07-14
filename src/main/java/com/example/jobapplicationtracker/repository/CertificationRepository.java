package com.example.jobapplicationtracker.repository;

import com.example.jobapplicationtracker.model.Certification;
import com.example.jobapplicationtracker.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CertificationRepository extends JpaRepository<Certification, Long> {
    List<Certification> findByUserOrderByIssueDateDesc(User user);
    Optional<Certification> findByIdAndUser(Long id, User user);
}
