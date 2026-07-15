package com.example.jobapplicationtracker.service;

import com.example.jobapplicationtracker.dto.analytics.*;
import com.example.jobapplicationtracker.exception.ResourceNotFoundException;
import com.example.jobapplicationtracker.model.ApplicationStatus;
import com.example.jobapplicationtracker.model.JobApplication;
import com.example.jobapplicationtracker.model.User;
import com.example.jobapplicationtracker.repository.ApplicationRepository;
import com.example.jobapplicationtracker.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.IsoFields;
import java.time.temporal.WeekFields;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    private final ApplicationRepository applicationRepository;
    private final UserRepository userRepository;

    public AnalyticsService(ApplicationRepository applicationRepository, UserRepository userRepository) {
        this.applicationRepository = applicationRepository;
        this.userRepository = userRepository;
    }

    public SummaryDto getSummary(String email) {
        List<JobApplication> apps = getUserApplications(email);
        long total = apps.size();

        long active = apps.stream()
                .filter(a -> a.getStatus() != ApplicationStatus.REJECTED && a.getStatus() != ApplicationStatus.WITHDRAWN)
                .count();

        long responded = apps.stream()
                .filter(a -> a.getStatus() == ApplicationStatus.ASSESSMENT
                        || a.getStatus() == ApplicationStatus.INTERVIEW
                        || a.getStatus() == ApplicationStatus.OFFER)
                .count();

        long offers = apps.stream().filter(a -> a.getStatus() == ApplicationStatus.OFFER).count();

        double responseRate = total == 0 ? 0 : round((responded * 100.0) / total);
        double offerRate = total == 0 ? 0 : round((offers * 100.0) / total);

        return new SummaryDto(total, active, responseRate, offerRate);
    }

    public List<TrendPointDto> getTrends(String email, String period) {
        List<JobApplication> apps = getUserApplications(email);

        Map<String, Long> grouped = new TreeMap<>();
        DateTimeFormatter monthFmt = DateTimeFormatter.ofPattern("yyyy-MM");

        for (JobApplication app : apps) {
            LocalDate date = app.getDateApplied();
            if (date == null && app.getCreatedAt() != null) {
                date = app.getCreatedAt().toLocalDate();
            }
            if (date == null) continue;

            String label;
            if ("weekly".equalsIgnoreCase(period)) {
                int week = date.get(WeekFields.ISO.weekOfWeekBasedYear());
                int weekYear = date.get(IsoFields.WEEK_BASED_YEAR);
                label = weekYear + "-W" + String.format("%02d", week);
            } else {
                label = date.format(monthFmt);
            }
            grouped.merge(label, 1L, Long::sum);
        }

        return grouped.entrySet().stream()
                .map(e -> new TrendPointDto(e.getKey(), e.getValue()))
                .toList();
    }

    public List<PlatformStatsDto> getByPlatform(String email) {
        List<JobApplication> apps = getUserApplications(email);

        Map<String, List<JobApplication>> byPlatform = apps.stream()
                .collect(Collectors.groupingBy(a -> a.getPlatform().name()));

        return byPlatform.entrySet().stream()
                .map(entry -> {
                    long total = entry.getValue().size();
                    long offers = entry.getValue().stream()
                            .filter(a -> a.getStatus() == ApplicationStatus.OFFER)
                            .count();
                    double rate = total == 0 ? 0 : round((offers * 100.0) / total);
                    return new PlatformStatsDto(entry.getKey(), total, offers, rate);
                })
                .sorted(Comparator.comparingLong(PlatformStatsDto::getTotalApplications).reversed())
                .toList();
    }

    public List<StatusCountDto> getByStatus(String email) {
        List<JobApplication> apps = getUserApplications(email);

        Map<String, Long> counts = apps.stream()
                .collect(Collectors.groupingBy(a -> a.getStatus().name(), Collectors.counting()));

        // Ensure every status appears even with 0 count, in pipeline order
        List<StatusCountDto> result = new ArrayList<>();
        for (ApplicationStatus status : ApplicationStatus.values()) {
            result.add(new StatusCountDto(status.name(), counts.getOrDefault(status.name(), 0L)));
        }
        return result;
    }

    public GoalsProgressDto getGoalsProgress(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));
        List<JobApplication> apps = getUserApplications(email);

        LocalDate now = LocalDate.now();
        LocalDate startOfWeek = now.with(WeekFields.ISO.dayOfWeek(), 1);
        LocalDate startOfMonth = now.withDayOfMonth(1);

        long thisWeek = apps.stream()
                .filter(a -> {
                    LocalDate date = a.getDateApplied();
                    if (date == null && a.getCreatedAt() != null) {
                        date = a.getCreatedAt().toLocalDate();
                    }
                    return date != null && !date.isBefore(startOfWeek);
                })
                .count();

        long thisMonth = apps.stream()
                .filter(a -> {
                    LocalDate date = a.getDateApplied();
                    if (date == null && a.getCreatedAt() != null) {
                        date = a.getCreatedAt().toLocalDate();
                    }
                    return date != null && !date.isBefore(startOfMonth);
                })
                .count();

        Integer weeklyGoal = user.getWeeklyGoal() != null ? user.getWeeklyGoal() : 5;
        Integer monthlyGoal = user.getMonthlyGoal() != null ? user.getMonthlyGoal() : 20;

        return new GoalsProgressDto(weeklyGoal, thisWeek, monthlyGoal, thisMonth);
    }

    // ----- Helpers -----

    private List<JobApplication> getUserApplications(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));
        return applicationRepository.findByUserId(user.getId());
    }

    private double round(double value) {
        return Math.round(value * 10.0) / 10.0;
    }
}