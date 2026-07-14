package com.example.jobapplicationtracker.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "resumes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Resume {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    /**
     * The bullets that are "selected" (toggled on) for this particular resume version.
     * Modeled as a many-to-many join table so the same Bullet can appear in multiple resumes.
     */
    @ManyToMany
    @JoinTable(
        name = "resume_bullet_selections",
        joinColumns = @JoinColumn(name = "resume_id"),
        inverseJoinColumns = @JoinColumn(name = "bullet_id")
    )
    private Set<Bullet> selectedBullets = new HashSet<>();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
