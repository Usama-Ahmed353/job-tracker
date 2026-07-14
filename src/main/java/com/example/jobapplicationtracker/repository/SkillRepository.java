package com.example.jobapplicationtracker.repository;

import com.example.jobapplicationtracker.model.Skill;
import com.example.jobapplicationtracker.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SkillRepository extends JpaRepository<Skill, Long> {

    List<Skill> findByUserOrderByNameAsc(User user);

    Optional<Skill> findByIdAndUser(Long id, User user);
}
