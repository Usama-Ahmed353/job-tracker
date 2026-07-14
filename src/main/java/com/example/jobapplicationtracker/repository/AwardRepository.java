package com.example.jobapplicationtracker.repository;

import com.example.jobapplicationtracker.model.Award;
import com.example.jobapplicationtracker.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AwardRepository extends JpaRepository<Award, Long> {
    List<Award> findByUserOrderByDateReceivedDesc(User user);
    Optional<Award> findByIdAndUser(Long id, User user);
}
