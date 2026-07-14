package com.example.jobapplicationtracker.repository;

import com.example.jobapplicationtracker.model.Publication;
import com.example.jobapplicationtracker.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PublicationRepository extends JpaRepository<Publication, Long> {
    List<Publication> findByUserOrderByPublicationDateDesc(User user);
    Optional<Publication> findByIdAndUser(Long id, User user);
}
