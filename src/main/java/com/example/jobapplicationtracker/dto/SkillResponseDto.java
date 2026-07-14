package com.example.jobapplicationtracker.dto;

public class SkillResponseDto {
    private Long id;
    private String name;
    private String category;

    public SkillResponseDto(Long id, String name, String category) {
        this.id = id;
        this.name = name;
        this.category = category;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getCategory() { return category; }
}