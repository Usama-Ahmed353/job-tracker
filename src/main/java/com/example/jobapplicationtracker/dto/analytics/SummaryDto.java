package com.example.jobapplicationtracker.dto.analytics;

public class SummaryDto {
    private long totalApplications;
    private long activePipeline;      // excludes REJECTED, WITHDRAWN
    private double responseRatePct;   // (INTERVIEW+ASSESSMENT+OFFER) / total
    private double offerRatePct;      // OFFER / total

    public SummaryDto(long totalApplications, long activePipeline, double responseRatePct, double offerRatePct) {
        this.totalApplications = totalApplications;
        this.activePipeline = activePipeline;
        this.responseRatePct = responseRatePct;
        this.offerRatePct = offerRatePct;
    }

    public long getTotalApplications() { return totalApplications; }
    public long getActivePipeline() { return activePipeline; }
    public double getResponseRatePct() { return responseRatePct; }
    public double getOfferRatePct() { return offerRatePct; }
}