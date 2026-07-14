package com.example.jobapplicationtracker.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class GoalsUpdateRequest {
    private Integer weeklyGoal;
    private Integer monthlyGoal;
}