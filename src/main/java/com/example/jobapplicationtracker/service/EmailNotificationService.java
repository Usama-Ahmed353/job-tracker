package com.example.jobapplicationtracker.service;

import com.example.jobapplicationtracker.model.Event;
import com.example.jobapplicationtracker.repository.EventRepository;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class EmailNotificationService {

    private final EventRepository eventRepository;
    private final JavaMailSender mailSender;

    public EmailNotificationService(EventRepository eventRepository, JavaMailSender mailSender) {
        this.eventRepository = eventRepository;
        this.mailSender = mailSender;
    }

//    @Scheduled(cron = "0 * * * * ?")
    public void sendInterviewReminders() {
        LocalDateTime tomorrowStart = LocalDateTime.now().plusDays(1).withHour(0).withMinute(0).withSecond(0);
        LocalDateTime tomorrowEnd = tomorrowStart.plusDays(1);

        List<Event> upcomingEvents = eventRepository.findAllUpcomingEventsWithUsers(tomorrowStart, tomorrowEnd);

        for (Event event : upcomingEvents) {
            if (event.getUser() != null && event.getUser().getEmail() != null) {
                sendEmail(
                        event.getUser().getEmail(),
                        "Interview Reminder: " + event.getTitle(),
                        "Hello, \n\nThis is a reminder that you have an upcoming " + event.getEventType() +
                                " scheduled at: " + event.getEventDatetime() + "\nLocation/Link: " + event.getLocationOrLink() +
                                "\n\nGood luck!\nJob Tracker Team"
                );
            }
        }
    }

    private void sendEmail(String to, String subject, String text) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            // THIS LINE SAYS WHO IS SENDING THE EMAIL
            message.setFrom("usamasayyan06@gmail.com");
            message.setTo(to);
            message.setSubject(subject);
            message.setText(text);
            mailSender.send(message);
            System.out.println("Reminder email successfully sent to: " + to);
        } catch (Exception e) {
            System.err.println("Failed to send automatic reminder email to " + to + ": " + e.getMessage());
            e.printStackTrace(); // Prints the full stack trace to help diagnose exact errors
        }
    }
}