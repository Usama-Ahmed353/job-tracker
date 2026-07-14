package com.example.jobapplicationtracker.dto.analytics;

public class GoalsProgressDto {
    private Integer weeklyGoal;
    private long appliedThisWeek;
    private Integer monthlyGoal;
    private long appliedThisMonth;

    public GoalsProgressDto(Integer weeklyGoal, long appliedThisWeek, Integer monthlyGoal, long appliedThisMonth) {
        this.weeklyGoal = weeklyGoal;
        this.appliedThisWeek = appliedThisWeek;
        this.monthlyGoal = monthlyGoal;
        this.appliedThisMonth = appliedThisMonth;
    }

    public Integer getWeeklyGoal() { return weeklyGoal; }
    public long getAppliedThisWeek() { return appliedThisWeek; }
    public Integer getMonthlyGoal() { return monthlyGoal; }
    public long getAppliedThisMonth() { return appliedThisMonth; }
}