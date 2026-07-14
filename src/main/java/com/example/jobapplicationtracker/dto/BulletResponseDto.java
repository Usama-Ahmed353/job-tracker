package com.example.jobapplicationtracker.dto;

public class BulletResponseDto {
    private Long id;
    private String content;
    private Integer displayOrder;

    public BulletResponseDto(Long id, String content, Integer displayOrder) {
        this.id = id;
        this.content = content;
        this.displayOrder = displayOrder;
    }

    public Long getId() { return id; }
    public String getContent() { return content; }
    public Integer getDisplayOrder() { return displayOrder; }
}