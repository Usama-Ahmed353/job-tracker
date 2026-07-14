package com.example.jobapplicationtracker.repository;

import com.example.jobapplicationtracker.model.ApplicationDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ApplicationDocumentRepository extends JpaRepository<ApplicationDocument, Long> {
    List<ApplicationDocument> findByApplicationId(Long applicationId);
    Optional<ApplicationDocument> findByApplicationIdAndDocumentId(Long applicationId, Long documentId);

    List<ApplicationDocument> findByDocumentId(Long documentId);
}

