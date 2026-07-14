package com.example.jobapplicationtracker.dto;

import jakarta.validation.constraints.NotBlank;

public class SaveTextDraftRequestDto {

    @NotBlank(message = "File name is required")
    private String fileName;

    @NotBlank(message = "Content is required")
    private String content;

    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
}