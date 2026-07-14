package com.example.jobapplicationtracker.dto;

import java.util.List;

public class BulletAiResponseDto {
    private List<String> suggestions;

    public BulletAiResponseDto(List<String> suggestions) {
        this.suggestions = suggestions;
    }

    public List<String> getSuggestions() { return suggestions; }
}