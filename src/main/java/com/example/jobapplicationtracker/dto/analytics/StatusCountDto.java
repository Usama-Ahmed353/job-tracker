package com.example.jobapplicationtracker.dto.analytics;

public class StatusCountDto {
    private String status;
    private long count;

    public StatusCountDto(String status, long count) {
        this.status = status;
        this.count = count;
    }

    public String getStatus() { return status; }
    public long getCount() { return count; }
}