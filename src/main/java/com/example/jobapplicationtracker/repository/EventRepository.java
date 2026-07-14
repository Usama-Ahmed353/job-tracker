package com.example.jobapplicationtracker.repository;

import com.example.jobapplicationtracker.model.Event;
import com.example.jobapplicationtracker.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface EventRepository extends JpaRepository<Event, Long> {

    List<Event> findByUserAndEventDatetimeBetween(User user, LocalDateTime from, LocalDateTime to);

    List<Event> findByEventDatetimeBetween(LocalDateTime start, LocalDateTime end);

    List<Event> findByApplicationId(Long applicationId);

    // Added to safely fetch users alongside tomorrow's events on background threads
    @Query("SELECT e FROM Event e JOIN FETCH e.user WHERE e.eventDatetime BETWEEN :start AND :end")
    List<Event> findAllUpcomingEventsWithUsers(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
}