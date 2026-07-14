package com.example.jobapplicationtracker.service;

import com.example.jobapplicationtracker.dto.BulletAiResponseDto;
import com.example.jobapplicationtracker.exception.ResourceNotFoundException;
import com.example.jobapplicationtracker.model.Bullet;
import com.example.jobapplicationtracker.model.User;
import com.example.jobapplicationtracker.repository.BulletRepository;
import com.example.jobapplicationtracker.repository.UserRepository;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class BulletAiService {

    private final BulletRepository bulletRepository;
    private final UserRepository userRepository;
    private final RestClient restClient = RestClient.create();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.url}")
    private String apiUrl;

    public BulletAiService(BulletRepository bulletRepository, UserRepository userRepository) {
        this.bulletRepository = bulletRepository;
        this.userRepository = userRepository;
    }

    public BulletAiResponseDto improveBullet(Long bulletId, String jobDescription, String email) {
        Bullet bullet = findOwnedOrThrow(bulletId, email);

        String prompt = buildPrompt(bullet.getContent(), jobDescription);
        String rawResponse = callGemini(prompt);
        List<String> suggestions = parseSuggestions(rawResponse);

        return new BulletAiResponseDto(suggestions);
    }

    private String buildPrompt(String originalBullet, String jobDescription) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("Rewrite this resume bullet point to be more achievement-focused, ")
                .append("using strong action verbs and quantified impact where plausible. ")
                .append("Give exactly 3 alternative versions, one per line, numbered 1-3, ")
                .append("no other commentary.\n\n")
                .append("Original bullet: ").append(originalBullet);

        if (jobDescription != null && !jobDescription.isBlank()) {
            prompt.append("\n\nTailor the wording toward this job description where relevant:\n")
                    .append(jobDescription);
        }
        return prompt.toString();
    }

    private String callGemini(String prompt) {
        Map<String, Object> requestBody = Map.of(
                "contents", List.of(
                        Map.of("parts", List.of(Map.of("text", prompt)))
                )
        );

        String response = restClient.post()
                .uri(apiUrl + "?key=" + apiKey)
                .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                .body(requestBody)
                .retrieve()
                .body(String.class);

        try {
            JsonNode root = objectMapper.readTree(response);
            return root.path("candidates").get(0)
                    .path("content").path("parts").get(0)
                    .path("text").asText();
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse Gemini response: " + e.getMessage());
        }
    }

    private List<String> parseSuggestions(String rawText) {
        List<String> suggestions = new ArrayList<>();
        for (String line : rawText.split("\n")) {
            String cleaned = line.replaceFirst("^\\s*\\d+[.)]\\s*", "").trim();
            if (!cleaned.isEmpty()) {
                suggestions.add(cleaned);
            }
        }
        return suggestions;
    }

    private Bullet findOwnedOrThrow(Long bulletId, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));

        Bullet bullet = bulletRepository.findById(bulletId)
                .orElseThrow(() -> new ResourceNotFoundException("Bullet not found: " + bulletId));

        if (!bullet.getWorkExperience().getUser().getId().equals(user.getId())) {
            throw new ResourceNotFoundException("Bullet not found: " + bulletId);
        }
        return bullet;
    }
}