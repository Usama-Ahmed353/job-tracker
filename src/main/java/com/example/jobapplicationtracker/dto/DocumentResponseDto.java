package com.example.jobapplicationtracker.dto;

import java.time.LocalDateTime;

public class DocumentResponseDto {
    private Long id;
    private String documentType;
    private String fileName;
    private Long fileSizeBytes;
    private String contentType;
    private LocalDateTime uploadedAt;

    public DocumentResponseDto(Long id, String documentType, String fileName,
                               Long fileSizeBytes, String contentType, LocalDateTime uploadedAt) {
        this.id = id;
        this.documentType = documentType;
        this.fileName = fileName;
        this.fileSizeBytes = fileSizeBytes;
        this.contentType = contentType;
        this.uploadedAt = uploadedAt;
    }

    public Long getId() { return id; }
    public String getDocumentType() { return documentType; }
    public String getFileName() { return fileName; }
    public Long getFileSizeBytes() { return fileSizeBytes; }
    public String getContentType() { return contentType; }
    public LocalDateTime getUploadedAt() { return uploadedAt; }
}