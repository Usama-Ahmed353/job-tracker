package com.example.jobapplicationtracker.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "bullets")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Bullet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "work_experience_id", nullable = false)
    private WorkExperience workExperience;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(nullable = false)
    private Integer displayOrder;
}
