package com.example.jobapplicationtracker.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "volunteer_experiences")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class VolunteerExperience {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String organization;
    @Column(nullable = false)
    private String role;
    @Column(nullable = false)
    private LocalDate startDate;
    private LocalDate endDate;
    private String description;
}
