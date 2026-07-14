package com.example.jobapplicationtracker.repository;

import com.example.jobapplicationtracker.model.Bullet;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BulletRepository extends JpaRepository<Bullet, Long> {

    List<Bullet> findByWorkExperienceIdOrderByDisplayOrderAsc(Long workExperienceId);
}
