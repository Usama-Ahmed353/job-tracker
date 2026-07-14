package com.example.jobapplicationtracker.dto;

import java.util.List;

public class MatchScoreResponseDto {

    private double score;                 // 0–100 percentage
    private List<String> matchedKeywords; // keywords found in the resume
    private List<String> missingKeywords; // keywords NOT found, sorted by JD frequency desc

    public MatchScoreResponseDto(double score, List<String> matchedKeywords, List<String> missingKeywords) {
        this.score = score;
        this.matchedKeywords = matchedKeywords;
        this.missingKeywords = missingKeywords;
    }

    // ----- Getters -----
    public double getScore() { return score; }
    public List<String> getMatchedKeywords() { return matchedKeywords; }
    public List<String> getMissingKeywords() { return missingKeywords; }
}
