package com.example.jobapplicationtracker.controller;

import com.example.jobapplicationtracker.dto.DocumentResponseDto;
import com.example.jobapplicationtracker.dto.SaveTextDraftRequestDto;
import com.example.jobapplicationtracker.model.Document;
import com.example.jobapplicationtracker.security.SecurityUtils;
import com.example.jobapplicationtracker.service.DocumentService;
import jakarta.validation.Valid;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class DocumentController {

    private final DocumentService documentService;

    public DocumentController(DocumentService documentService) {
        this.documentService = documentService;
    }

    @PostMapping("/documents")
    public ResponseEntity<DocumentResponseDto> upload(@RequestParam("file") MultipartFile file,
                                                      @RequestParam("documentType") String documentType) {
        String email = SecurityUtils.getCurrentUserEmail();
        return ResponseEntity.ok(documentService.upload(file, documentType, email));
    }

    /**
     * Saves raw text (e.g. a generated cover letter draft) as a Document.
     * Used by the Cover Letter Builder's "Save Version" action.
     */
    @PostMapping("/documents/save-text-draft")
    public ResponseEntity<DocumentResponseDto> saveTextDraft(@Valid @RequestBody SaveTextDraftRequestDto request) {
        String email = SecurityUtils.getCurrentUserEmail();
        return ResponseEntity.ok(documentService.saveTextDraft(request.getFileName(), request.getContent(), email));
    }

    /**
     * Returns the raw text content of a saved draft so it can be reloaded
     * into the Cover Letter Builder's editor. Wrapped in an object (rather
     * than a bare string) so it always serializes as unambiguous JSON.
     */
    @GetMapping("/documents/{id}/text-content")
    public ResponseEntity<Map<String, String>> getTextContent(@PathVariable Long id) {
        String email = SecurityUtils.getCurrentUserEmail();
        return ResponseEntity.ok(Map.of("content", documentService.getTextContent(id, email)));
    }

    @GetMapping("/documents")
    public ResponseEntity<List<DocumentResponseDto>> list(@RequestParam(required = false) String type) {
        String email = SecurityUtils.getCurrentUserEmail();
        return ResponseEntity.ok(documentService.listForUser(email, type));
    }

    @GetMapping("/documents/{id}")
    public ResponseEntity<DocumentResponseDto> getMetadata(@PathVariable Long id) {
        String email = SecurityUtils.getCurrentUserEmail();
        return ResponseEntity.ok(documentService.getMetadata(id, email));
    }

    @GetMapping("/documents/{id}/download")
    public ResponseEntity<Resource> download(@PathVariable Long id) {
        String email = SecurityUtils.getCurrentUserEmail();
        Document doc = documentService.getForDownload(id, email);
        Resource resource = documentService.loadFileAsResource(doc);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(doc.getContentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + doc.getFileName() + "\"")
                .body(resource);
    }

    @DeleteMapping("/documents/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        String email = SecurityUtils.getCurrentUserEmail();
        documentService.delete(id, email);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/applications/{appId}/documents/{docId}")
    public ResponseEntity<Void> link(@PathVariable Long appId, @PathVariable Long docId) {
        String email = SecurityUtils.getCurrentUserEmail();
        documentService.linkToApplication(appId, docId, email);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/applications/{appId}/documents/{docId}")
    public ResponseEntity<Void> unlink(@PathVariable Long appId, @PathVariable Long docId) {
        String email = SecurityUtils.getCurrentUserEmail();
        documentService.unlinkFromApplication(appId, docId, email);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/applications/{appId}/documents")
    public ResponseEntity<List<DocumentResponseDto>> listForApplication(@PathVariable Long appId) {
        String email = SecurityUtils.getCurrentUserEmail();
        return ResponseEntity.ok(documentService.listForApplication(appId, email));
    }
}