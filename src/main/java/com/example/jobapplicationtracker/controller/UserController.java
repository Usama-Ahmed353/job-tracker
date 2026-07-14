package com.example.jobapplicationtracker.controller;

import com.example.jobapplicationtracker.dto.GoalsUpdateRequest;
import com.example.jobapplicationtracker.model.User;
import com.example.jobapplicationtracker.repository.UserRepository;
import com.example.jobapplicationtracker.security.SecurityUtils;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @PutMapping("/me/goals")
    public ResponseEntity<Void> updateGoals(@RequestBody GoalsUpdateRequest request) {
        String email = SecurityUtils.getCurrentUserEmail();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setWeeklyGoal(request.getWeeklyGoal());
        user.setMonthlyGoal(request.getMonthlyGoal());
        userRepository.save(user);
        return ResponseEntity.ok().build();
    }
}