package com.example.jobapplicationtracker.repository;
import com.example.jobapplicationtracker.model.JobApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ApplicationRepository extends JpaRepository<JobApplication, Long> {
    List<JobApplication> findByUserId(Long userId);

}
