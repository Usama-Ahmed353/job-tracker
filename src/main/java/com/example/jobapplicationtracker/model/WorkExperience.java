package com.example.jobapplicationtracker.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "work_experiences")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class WorkExperience {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String companyName;

    @Column(nullable = false)
    private String jobTitle;

    @Column(nullable = false)
    private LocalDate startDate;

    private LocalDate endDate; // nullable — null means "current"

    private String location;

    @OneToMany(mappedBy = "workExperience", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("displayOrder ASC")
    private List<Bullet> bullets = new ArrayList<>();
}
