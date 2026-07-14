package com.example.jobapplicationtracker.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Wraps calls to the Gemini API.
 *
 * Two distinct capabilities live here:
 *  1) parseJobQuery()   - turns free text into {keywords, company, country} filters that get
 *                          run against JobListingRepository (your own saved/DB job listings).
 *  2) searchLiveJobs()  - uses Gemini's Google Search grounding tool to find REAL, currently
 *                          active job postings out on the web (not your database at all).
 */
@Service
public class GeminiService {

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.url}")
    private String apiUrl;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    // ---------------------------------------------------------------------
    // Existing: DB filter parsing (used by /api/applications/ai-search)
    // ---------------------------------------------------------------------
    public JobSearchFilters parseJobQuery(String query) {
        String prompt = "You are a job search query parser for a job tracking app. "
                + "Given a free-text job search query, extract three fields and return STRICT JSON only "
                + "(no markdown, no code fences, no explanation, no extra text): "
                + "{\"keywords\": \"...\", \"company\": \"...\", \"country\": \"...\"}. "
                + "\"keywords\" should capture role/title/skill/technology terms (e.g. job title, tech stack). "
                + "\"company\" should only be filled if a specific company name is clearly mentioned, otherwise use an empty string. "
                + "\"country\" should capture location or remote-work terms if mentioned, otherwise use an empty string. "
                + "Do not invent values that are not implied by the query. "
                + "Query: \"" + query.replace("\"", "'") + "\"";

        Map<String, Object> requestBody = Map.of(
                "contents", new Object[] {
                        Map.of("parts", new Object[] { Map.of("text", prompt) })
                }
        );

        try {
            String text = callGemini(requestBody);
            JsonNode parsed = objectMapper.readTree(text);
            String keywords = parsed.path("keywords").asText("");
            String company = parsed.path("company").asText("");
            String country = parsed.path("country").asText("");

            return new JobSearchFilters(keywords, company, country);
        } catch (Exception e) {
            // Gemini call or parsing failed -- fall back to treating the raw query as keywords
            // so the search still returns something instead of erroring out.
            return new JobSearchFilters(query, "", "");
        }
    }

    // ---------------------------------------------------------------------
    // New: live, web-grounded job search (used by /api/applications/live-search)
    // ---------------------------------------------------------------------
    public List<LiveJobResult> searchLiveJobs(String query) {
        String prompt = "You are a job search assistant with access to real-time Google Search. "
                + "Find up to 8 REAL, CURRENTLY ACTIVE job postings that match this search request: \""
                + query.replace("\"", "'") + "\". "
                + "Use Google Search to find actual postings from real job boards and company career pages "
                + "(e.g. LinkedIn, Indeed, Glassdoor, company career sites). "
                + "Do NOT invent or hallucinate listings -- only include jobs you found real evidence for via search. "
                + "If you cannot verify a detail (like salary), leave that field as an empty string rather than guessing. "
                + "Respond with STRICT JSON only: a JSON array, no markdown, no code fences, no commentary, "
                + "using exactly this shape for each item: "
                + "{\"jobRole\": \"...\", \"companyName\": \"...\", \"location\": \"...\", "
                + "\"salaryRange\": \"...\", \"workload\": \"...\", \"description\": \"...\", \"sourceUrl\": \"...\"}. "
                + "\"description\" must be a short original summary under 200 characters, not copied text from the posting. "
                + "\"sourceUrl\" must be the real URL of the posting you found. "
                + "If you cannot find any real matching jobs, return an empty array: [].";

        Map<String, Object> requestBody = Map.of(
                "contents", new Object[] {
                        Map.of("parts", new Object[] { Map.of("text", prompt) })
                },
                "tools", new Object[] {
                        Map.of("google_search", Map.of())
                },
                "generationConfig", Map.of(
                        "responseMimeType", "application/json"
                )
        );

        String text;
        try {
            text = callGemini(requestBody);
        } catch (Exception e) {
            throw new RuntimeException("Live job search request to Gemini failed: " + e.getMessage(), e);
        }

        List<LiveJobResult> results = new ArrayList<>();
        try {
            JsonNode arr = objectMapper.readTree(text);
            if (arr.isArray()) {
                for (JsonNode node : arr) {
                    results.add(new LiveJobResult(
                            node.path("jobRole").asText(""),
                            node.path("companyName").asText(""),
                            node.path("location").asText(""),
                            node.path("salaryRange").asText(""),
                            node.path("workload").asText(""),
                            node.path("description").asText(""),
                            node.path("sourceUrl").asText("")
                    ));
                }
            }
        } catch (Exception e) {
            throw new RuntimeException("Gemini returned a response that could not be parsed as job listings.", e);
        }

        return results;
    }

    // ---------------------------------------------------------------------
    // Shared low-level call
    // ---------------------------------------------------------------------
    private String callGemini(Map<String, Object> requestBody) throws Exception {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        String urlWithKey = apiUrl + "?key=" + apiKey;

        ResponseEntity<String> response = restTemplate.postForEntity(urlWithKey, entity, String.class);
        JsonNode root = objectMapper.readTree(response.getBody());
        String text = root.path("candidates").get(0).path("content").path("parts").get(0).path("text").asText();

        text = text.trim();
        if (text.startsWith("```")) {
            text = text.replaceAll("^```(json)?", "").replaceAll("```$", "").trim();
        }
        return text;
    }

    public static class JobSearchFilters {
        private final String keywords;
        private final String company;
        private final String country;

        public JobSearchFilters(String keywords, String company, String country) {
            this.keywords = keywords == null ? "" : keywords;
            this.company = company == null ? "" : company;
            this.country = country == null ? "" : country;
        }

        public String getKeywords() { return keywords; }
        public String getCompany() { return company; }
        public String getCountry() { return country; }
    }

    /** A real, web-sourced job listing found via Google Search grounding. Not a DB entity. */
    public static class LiveJobResult {
        private final String jobRole;
        private final String companyName;
        private final String location;
        private final String salaryRange;
        private final String workload;
        private final String description;
        private final String sourceUrl;

        public LiveJobResult(String jobRole, String companyName, String location,
                             String salaryRange, String workload, String description, String sourceUrl) {
            this.jobRole = jobRole == null ? "" : jobRole;
            this.companyName = companyName == null ? "" : companyName;
            this.location = location == null ? "" : location;
            this.salaryRange = salaryRange == null ? "" : salaryRange;
            this.workload = workload == null ? "" : workload;
            this.description = description == null ? "" : description;
            this.sourceUrl = sourceUrl == null ? "" : sourceUrl;
        }

        public String getJobRole() { return jobRole; }
        public String getCompanyName() { return companyName; }
        public String getLocation() { return location; }
        public String getSalaryRange() { return salaryRange; }
        public String getWorkload() { return workload; }
        public String getDescription() { return description; }
        public String getSourceUrl() { return sourceUrl; }
    }
    public String generateCoverLetterText(String fullName, String email, String jobDescription) {
        String prompt = "You are an expert technical resume coach and professional career strategist. "
                + "Construct a clean, corporate, persuasive, and beautifully written cover letter tailored exactly "
                + "for the target position description details supplied below. "
                + "\n\nCandidate Identity Fields: "
                + "\nName: " + fullName
                + "\nContact Routing: " + email
                + "\n\nTarget Position Description Context and Requirements:\n" + jobDescription
                + "\n\nInstructions: Write a professional, personalized single-page response format. Highlight "
                + "relevant technology stack expertise and operational values. Use standard professional letter structures. "
                + "Return the raw text of the cover letter ONLY. Do not wrap the response inside markdown code boxes or backticks.";

        Map<String, Object> requestBody = Map.of(
                "contents", new Object[] {
                        Map.of("parts", new Object[] { Map.of("text", prompt) })
                }
        );

        try {
            return callGemini(requestBody);
        } catch (Exception e) {
            throw new RuntimeException("AI Cover letter compilation prompt cycle execution issues: " + e.getMessage(), e);
        }
    }
}