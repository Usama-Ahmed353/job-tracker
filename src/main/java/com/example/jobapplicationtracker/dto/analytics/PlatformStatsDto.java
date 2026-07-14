package com.example.jobapplicationtracker.dto.analytics;

public class PlatformStatsDto {
    private String platform;
    private long totalApplications;
    private long offers;
    private double successRatePct;

    public PlatformStatsDto(String platform, long totalApplications, long offers, double successRatePct) {
        this.platform = platform;
        this.totalApplications = totalApplications;
        this.offers = offers;
        this.successRatePct = successRatePct;
    }

    public String getPlatform() { return platform; }
    public long getTotalApplications() { return totalApplications; }
    public long getOffers() { return offers; }
    public double getSuccessRatePct() { return successRatePct; }
}