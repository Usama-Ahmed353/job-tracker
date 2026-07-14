package com.example.jobapplicationtracker.dto.analytics;

public class TrendPointDto {
    private String periodLabel; // e.g. "2026-W27" or "2026-06"
    private long count;

    public TrendPointDto(String periodLabel, long count) {
        this.periodLabel = periodLabel;
        this.count = count;
    }

    public String getPeriodLabel() { return periodLabel; }
    public long getCount() { return count; }
}