package com.example.jobapplicationtracker.service;

import com.example.jobapplicationtracker.dto.DocumentResponseDto;
import com.example.jobapplicationtracker.exception.ResourceNotFoundException;
import com.example.jobapplicationtracker.model.*;
import com.example.jobapplicationtracker.repository.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
public class DocumentService {

    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );
    private static final long MAX_FILE_SIZE_BYTES = 5L * 1024 * 1024; // 5MB

    private final DocumentRepository documentRepository;
    private final ApplicationDocumentRepository applicationDocumentRepository;
    private final ApplicationRepository applicationRepository;
    private final UserRepository userRepository;

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    public DocumentService(DocumentRepository documentRepository,
                           ApplicationDocumentRepository applicationDocumentRepository,
                           ApplicationRepository applicationRepository,
                           UserRepository userRepository) {
        this.documentRepository = documentRepository;
        this.applicationDocumentRepository = applicationDocumentRepository;
        this.applicationRepository = applicationRepository;
        this.userRepository = userRepository;
    }

    public DocumentResponseDto upload(MultipartFile file, String documentType, String email) {
        User user = resolveUser(email);

        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }
        if (file.getSize() > MAX_FILE_SIZE_BYTES) {
            throw new IllegalArgumentException("File exceeds 5MB limit");
        }
        if (!ALLOWED_CONTENT_TYPES.contains(file.getContentType())) {
            throw new IllegalArgumentException("Only PDF and Word documents are allowed");
        }

        try {
            Path userDir = Paths.get(uploadDir, String.valueOf(user.getId()));
            Files.createDirectories(userDir);

            String originalName = file.getOriginalFilename() != null ? file.getOriginalFilename() : "file";
            String storedName = UUID.randomUUID() + "_" + originalName;
            Path targetPath = userDir.resolve(storedName);
            file.transferTo(targetPath);

            Document doc = new Document();
            doc.setUser(user);
            doc.setDocumentType(DocumentType.valueOf(documentType));
            doc.setFileName(originalName);
            doc.setStoragePath(targetPath.toString());
            doc.setFileSizeBytes(file.getSize());
            doc.setContentType(file.getContentType());
            doc.setUploadedAt(LocalDateTime.now());

            return toResponseDto(documentRepository.save(doc));
        } catch (IOException e) {
            throw new RuntimeException("Failed to store file: " + e.getMessage());
        }
    }

    /**
     * Saves raw text content (e.g. a generated cover letter draft) as a Document,
     * writing it to disk the same way an uploaded file is stored. Always tagged
     * as documentType = COVER_LETTER.
     */
    public DocumentResponseDto saveTextDraft(String fileName, String content, String email) {
        User user = resolveUser(email);

        if (content == null || content.isBlank()) {
            throw new IllegalArgumentException("Content is empty");
        }

        String safeName = (fileName == null || fileName.isBlank()) ? "draft.txt" : fileName;

        try {
            Path userDir = Paths.get(uploadDir, String.valueOf(user.getId()));
            Files.createDirectories(userDir);

            String storedName = UUID.randomUUID() + "_" + safeName;
            Path targetPath = userDir.resolve(storedName);
            byte[] bytes = content.getBytes(StandardCharsets.UTF_8);
            Files.write(targetPath, bytes);

            Document doc = new Document();
            doc.setUser(user);
            doc.setDocumentType(DocumentType.COVER_LETTER);
            doc.setFileName(safeName);
            doc.setStoragePath(targetPath.toString());
            doc.setFileSizeBytes((long) bytes.length);
            doc.setContentType("text/plain");
            doc.setUploadedAt(LocalDateTime.now());

            return toResponseDto(documentRepository.save(doc));
        } catch (IOException e) {
            throw new RuntimeException("Failed to store draft: " + e.getMessage());
        }
    }

    /**
     * Reads back the raw text content of a text-based document (e.g. a saved
     * cover letter draft) so it can be reloaded into the editor.
     */
    public String getTextContent(Long id, String email) {
        Document doc = findOwnedOrThrow(id, email);
        try {
            Path path = Paths.get(doc.getStoragePath());
            if (!Files.exists(path)) {
                throw new ResourceNotFoundException("File missing on disk for document id: " + doc.getId());
            }
            return Files.readString(path, StandardCharsets.UTF_8);
        } catch (IOException e) {
            throw new RuntimeException("Failed to read draft content: " + e.getMessage());
        }
    }

    public List<DocumentResponseDto> listForUser(String email, String type) {
        User user = resolveUser(email);
        List<Document> docs = (type != null)
                ? documentRepository.findByUserIdAndDocumentType(user.getId(), DocumentType.valueOf(type))
                : documentRepository.findByUserId(user.getId());
        return docs.stream().map(this::toResponseDto).toList();
    }

    public DocumentResponseDto getMetadata(Long id, String email) {
        return toResponseDto(findOwnedOrThrow(id, email));
    }

    public Document getForDownload(Long id, String email) {
        return findOwnedOrThrow(id, email);
    }

    public Resource loadFileAsResource(Document doc) {
        try {
            Path path = Paths.get(doc.getStoragePath());
            Resource resource = new UrlResource(path.toUri());
            if (!resource.exists()) {
                throw new ResourceNotFoundException("File missing on disk for document id: " + doc.getId());
            }
            return resource;
        } catch (MalformedURLException e) {
            throw new RuntimeException("Could not read file: " + e.getMessage());
        }
    }

    public void delete(Long id, String email) {
        Document doc = findOwnedOrThrow(id, email);
        applicationDocumentRepository.deleteAll(applicationDocumentRepository.findByDocumentId(doc.getId()));

        try {
            Files.deleteIfExists(Paths.get(doc.getStoragePath()));
        } catch (IOException ignored) {
        }
        documentRepository.delete(doc);
    }

    public void linkToApplication(Long applicationId, Long documentId, String email) {
        User user = resolveUser(email);
        JobApplication app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found: " + applicationId));
        if (!app.getUser().getId().equals(user.getId())) {
            throw new ResourceNotFoundException("Application not found: " + applicationId);
        }
        Document doc = findOwnedOrThrow(documentId, email);

        if (applicationDocumentRepository.findByApplicationIdAndDocumentId(applicationId, documentId).isPresent()) {
            return; // already linked, no-op
        }

        ApplicationDocument link = new ApplicationDocument();
        link.setApplication(app);
        link.setDocument(doc);
        link.setLinkedAt(LocalDateTime.now());
        applicationDocumentRepository.save(link);
    }

    public void unlinkFromApplication(Long applicationId, Long documentId, String email) {
        resolveUser(email);
        applicationDocumentRepository.findByApplicationIdAndDocumentId(applicationId, documentId)
                .ifPresent(applicationDocumentRepository::delete);
    }

    public List<DocumentResponseDto> listForApplication(Long applicationId, String email) {
        resolveUser(email);
        return applicationDocumentRepository.findByApplicationId(applicationId)
                .stream()
                .map(link -> toResponseDto(link.getDocument()))
                .toList();
    }

    // ----- Helpers -----

    private User resolveUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));
    }

    private Document findOwnedOrThrow(Long id, String email) {
        User user = resolveUser(email);
        Document doc = documentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found: " + id));
        if (!doc.getUser().getId().equals(user.getId())) {
            throw new ResourceNotFoundException("Document not found: " + id);
        }
        return doc;
    }

    private DocumentResponseDto toResponseDto(Document doc) {
        return new DocumentResponseDto(
                doc.getId(),
                doc.getDocumentType().name(),
                doc.getFileName(),
                doc.getFileSizeBytes(),
                doc.getContentType(),
                doc.getUploadedAt()
        );
    }
}