package com.example.jobapplicationtracker.repository;

import com.example.jobapplicationtracker.model.JobListing;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobListingRepository extends JpaRepository<JobListing, Long> {

    @Query("SELECT j FROM JobListing j WHERE " +
            "LOWER(j.jobRole) LIKE LOWER(CONCAT('%', :keywords, '%')) AND " +
            "LOWER(j.companyName) LIKE LOWER(CONCAT('%', :company, '%')) AND " +
            "LOWER(j.location) LIKE LOWER(CONCAT('%', :country, '%'))")
    List<JobListing> searchJobs(@Param("keywords") String keywords,
                                @Param("company") String company,
                                @Param("country") String country);
}