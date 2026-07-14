package com.example.jobapplicationtracker.service;

import com.example.jobapplicationtracker.dto.MatchScoreResponseDto;
import com.example.jobapplicationtracker.exception.ResourceNotFoundException;
import com.example.jobapplicationtracker.model.*;
import com.example.jobapplicationtracker.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class MatchScoreService {

    private final ResumeRepository resumeRepository;
    private final SkillRepository skillRepository;
    private final UserRepository userRepository;

    public MatchScoreService(ResumeRepository resumeRepository,
                             SkillRepository skillRepository,
                             UserRepository userRepository) {
        this.resumeRepository = resumeRepository;
        this.skillRepository = skillRepository;
        this.userRepository = userRepository;
    }

    /**
     * Compare a job description against a resume's full content
     * (selected bullets + skills) and return a match score with keyword analysis.
     */
    @Transactional(readOnly = true)
    public MatchScoreResponseDto computeMatchScore(Long resumeId, String jobDescriptionText, String email) {
        User user = resolveUser(email);
        Resume resume = resumeRepository.findByIdAndUser(resumeId, user)
                .orElseThrow(() -> new ResourceNotFoundException("Resume not found with id: " + resumeId));

        // 1. Build the resume's combined text
        String resumeText = buildResumeText(resume, user);

        // 2. Extract important keywords/phrases from the job description
        Map<String, Integer> jdKeywordFrequencies = extractImportantKeywords(jobDescriptionText);

        if (jdKeywordFrequencies.isEmpty()) {
            return new MatchScoreResponseDto(100.0, List.of(), List.of());
        }

        // 3. Compare against resume text (case-insensitive)
        String resumeTextLower = resumeText.toLowerCase();
        List<String> matched = new ArrayList<>();
        List<Map.Entry<String, Integer>> missing = new ArrayList<>();

        for (Map.Entry<String, Integer> entry : jdKeywordFrequencies.entrySet()) {
            String keyword = entry.getKey();
            if (resumeTextLower.contains(keyword.toLowerCase())) {
                matched.add(keyword);
            } else {
                missing.add(entry);
            }
        }

        // 4. Score = (matched / total) * 100
        double score = ((double) matched.size() / jdKeywordFrequencies.size()) * 100.0;
        score = Math.round(score * 10.0) / 10.0; // round to 1 decimal

        // 5. Sort missing by frequency descending (more frequent = more important)
        missing.sort((a, b) -> b.getValue().compareTo(a.getValue()));
        List<String> missingKeywords = missing.stream()
                .map(Map.Entry::getKey)
                .toList();

        // Sort matched alphabetically for clean output
        List<String> matchedSorted = matched.stream().sorted().toList();

        return new MatchScoreResponseDto(score, matchedSorted, missingKeywords);
    }

    // ----- Internal logic -----

    /**
     * Combine all selected bullet text + skill names into a single searchable string.
     * Also includes job titles and company names from work experiences that have selected bullets.
     */
    private String buildResumeText(Resume resume, User user) {
        StringBuilder sb = new StringBuilder();

        // Collect selected bullet IDs
        Set<Long> selectedBulletIds = resume.getSelectedBullets().stream()
                .map(Bullet::getId)
                .collect(Collectors.toSet());

        // Add bullet content + context from their parent work experiences
        Set<Long> includedExperienceIds = new HashSet<>();
        for (Bullet bullet : resume.getSelectedBullets()) {
            sb.append(bullet.getContent()).append(" ");
            includedExperienceIds.add(bullet.getWorkExperience().getId());
        }

        // Add job titles and company names from work experiences that have selected bullets
        for (Bullet bullet : resume.getSelectedBullets()) {
            WorkExperience exp = bullet.getWorkExperience();
            if (includedExperienceIds.remove(exp.getId())) { // add each experience only once
                sb.append(exp.getJobTitle()).append(" ");
                sb.append(exp.getCompanyName()).append(" ");
                if (exp.getLocation() != null) {
                    sb.append(exp.getLocation()).append(" ");
                }
            }
        }

        // Add all user skills
        List<Skill> skills = skillRepository.findByUserOrderByNameAsc(user);
        for (Skill skill : skills) {
            sb.append(skill.getName()).append(" ");
        }

        return sb.toString();
    }

    /**
     * Extract important keywords and phrases from the job description.
     * Favors multi-word technical phrases and capitalized terms.
     * Returns a map of keyword -> frequency in the JD.
     */
    Map<String, Integer> extractImportantKeywords(String jobDescription) {
        Map<String, Integer> keywords = new LinkedHashMap<>();

        // Phase 1: Extract multi-word technical phrases (2-3 word combos that look like tech terms)
        extractTechnicalPhrases(jobDescription, keywords);

        // Phase 2: Extract capitalized terms / acronyms (AWS, REST, CI/CD, etc.)
        extractCapitalizedTerms(jobDescription, keywords);

        // Phase 3: Extract remaining single important words (not stopwords, not too short)
        extractSingleKeywords(jobDescription, keywords);

        return keywords;
    }

    /**
     * Find multi-word phrases that look like technical terms or named concepts.
     * Examples: "machine learning", "REST API", "Spring Boot", "CI/CD pipeline"
     */
    private void extractTechnicalPhrases(String text, Map<String, Integer> keywords) {
        // Normalize whitespace but preserve case for matching
        String normalized = text.replaceAll("\\s+", " ").trim();
        String[] words = normalized.split(" ");

        for (int i = 0; i < words.length - 1; i++) {
            String w1 = cleanToken(words[i]);
            String w2 = cleanToken(i + 1 < words.length ? words[i + 1] : "");
            String w3 = (i + 2 < words.length) ? cleanToken(words[i + 2]) : "";

            if (w1.isEmpty() || w2.isEmpty()) continue;

            // 3-word phrase check
            if (!w3.isEmpty() && isTechnicalPhrase(w1, w2, w3)) {
                String phrase = w1 + " " + w2 + " " + w3;
                if (!isStopPhrase(phrase)) {
                    keywords.merge(phrase, 1, Integer::sum);
                }
            }

            // 2-word phrase check
            if (isTechnicalPhrase(w1, w2)) {
                String phrase = w1 + " " + w2;
                if (!isStopPhrase(phrase)) {
                    keywords.merge(phrase, 1, Integer::sum);
                }
            }
        }
    }

    /**
     * Extract standalone capitalized terms, acronyms, and tech-looking tokens.
     * Examples: AWS, SQL, React, Kubernetes, CI/CD
     */
    private void extractCapitalizedTerms(String text, Map<String, Integer> keywords) {
        // Match acronyms (2+ uppercase letters), camelCase, or slash-separated (CI/CD)
        Pattern acronymPattern = Pattern.compile("\\b([A-Z][A-Za-z]*(?:/[A-Z][A-Za-z]*)*)\\b");
        Matcher matcher = acronymPattern.matcher(text);

        while (matcher.find()) {
            String term = matcher.group(1).trim();
            if (term.length() < 2) continue;
            if (isStopWord(term.toLowerCase())) continue;
            // Skip pure common words that happen to be capitalized (start of sentence)
            if (isCommonCapitalizedWord(term)) continue;

            // Already captured as part of a phrase? Skip individual word
            boolean partOfPhrase = keywords.keySet().stream()
                    .anyMatch(k -> k.split(" ").length > 1 && k.toLowerCase().contains(term.toLowerCase()));
            if (!partOfPhrase) {
                keywords.merge(term, 1, Integer::sum);
            }
        }

        // Also catch slash-separated tokens like CI/CD, TCP/IP
        Pattern slashPattern = Pattern.compile("\\b([A-Za-z]+/[A-Za-z]+)\\b");
        Matcher slashMatcher = slashPattern.matcher(text);
        while (slashMatcher.find()) {
            String term = slashMatcher.group(1).trim();
            if (!isStopWord(term.toLowerCase())) {
                keywords.merge(term, 1, Integer::sum);
            }
        }
    }

    /**
     * Extract remaining single-word keywords that pass the importance filter.
     */
    private void extractSingleKeywords(String text, Map<String, Integer> keywords) {
        String[] tokens = text.toLowerCase().split("[^a-zA-Z0-9#+./-]+");

        Map<String, Integer> wordFreq = new LinkedHashMap<>();
        for (String token : tokens) {
            String cleaned = token.replaceAll("^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$", "");
            if (cleaned.length() < 3) continue;
            if (isStopWord(cleaned)) continue;
            if (isGenericJobWord(cleaned)) continue;
            wordFreq.merge(cleaned, 1, Integer::sum);
        }

        // Only add words that appear 2+ times OR look technical (contain digits, special chars, etc.)
        for (Map.Entry<String, Integer> entry : wordFreq.entrySet()) {
            String word = entry.getKey();
            int freq = entry.getValue();

            // Skip if already captured as part of a phrase
            boolean alreadyCaptured = keywords.keySet().stream()
                    .anyMatch(k -> k.toLowerCase().contains(word));
            if (alreadyCaptured) continue;

            if (freq >= 2 || looksLikeTechTerm(word)) {
                keywords.merge(word, freq, Integer::sum);
            }
        }
    }

    // ----- Classification helpers -----

    private boolean isTechnicalPhrase(String w1, String w2) {
        String combined = (w1 + " " + w2).toLowerCase();
        // At least one word should not be a stopword
        if (isStopWord(w1.toLowerCase()) && isStopWord(w2.toLowerCase())) return false;
        // Both words should be non-trivial
        if (w1.length() < 2 || w2.length() < 2) return false;
        // Phrases where at least one word looks technical or is capitalized
        return looksLikeTechTerm(w1) || looksLikeTechTerm(w2)
                || Character.isUpperCase(w1.charAt(0)) || Character.isUpperCase(w2.charAt(0))
                || KNOWN_PHRASE_PARTS.contains(w1.toLowerCase()) || KNOWN_PHRASE_PARTS.contains(w2.toLowerCase());
    }

    private boolean isTechnicalPhrase(String w1, String w2, String w3) {
        // At least one word must look technical
        return isTechnicalPhrase(w1, w2) || isTechnicalPhrase(w2, w3);
    }

    private boolean looksLikeTechTerm(String word) {
        // Contains digits (e.g. "s3", "ec2", "h2"), plus/hash (C#, C++), dots (Node.js)
        if (word.matches(".*[0-9#+.].*")) return true;
        // ALL CAPS acronym (at least 2 chars)
        if (word.length() >= 2 && word.equals(word.toUpperCase()) && word.matches("[A-Z]+")) return true;
        // Known tech terms
        return TECH_TERMS.contains(word.toLowerCase());
    }

    private boolean isStopPhrase(String phrase) {
        String lower = phrase.toLowerCase();
        // Filter out phrases that are entirely generic
        return STOP_PHRASES.contains(lower);
    }

    private boolean isCommonCapitalizedWord(String word) {
        return COMMON_CAPITALIZED.contains(word.toLowerCase());
    }

    private boolean isGenericJobWord(String word) {
        return GENERIC_JOB_WORDS.contains(word.toLowerCase());
    }

    private String cleanToken(String token) {
        return token.replaceAll("^[^a-zA-Z0-9#+/]+|[^a-zA-Z0-9#+/]+$", "");
    }

    // ----- Stopwords -----

    private boolean isStopWord(String word) {
        return STOP_WORDS.contains(word);
    }

    private static final Set<String> STOP_WORDS = Set.of(
            // Articles & determiners
            "a", "an", "the", "this", "that", "these", "those",
            // Pronouns
            "i", "me", "my", "we", "our", "you", "your", "he", "she", "it", "its",
            "they", "them", "their", "who", "whom", "which", "what",
            // Prepositions
            "in", "on", "at", "to", "for", "of", "by", "from", "with", "as",
            "into", "through", "during", "before", "after", "above", "below",
            "between", "under", "about", "against", "within", "without", "across",
            // Conjunctions
            "and", "but", "or", "nor", "so", "yet", "both", "either", "neither",
            // Common verbs (be, have, do, etc.)
            "is", "are", "was", "were", "be", "been", "being",
            "has", "have", "had", "having",
            "do", "does", "did", "doing",
            "will", "would", "shall", "should", "may", "might", "can", "could", "must",
            // Adverbs & misc
            "not", "no", "only", "very", "also", "just", "than", "then", "now",
            "here", "there", "when", "where", "how", "all", "each", "every",
            "any", "some", "such", "more", "most", "other", "own",
            "if", "up", "out", "off", "over",
            // Job-posting filler
            "etc", "eg", "ie", "per"
    );

    /**
     * Words commonly seen in job postings that aren't meaningful for keyword matching.
     */
    private static final Set<String> GENERIC_JOB_WORDS = Set.of(
            "experience", "years", "year", "required", "preferred", "strong",
            "excellent", "ability", "skills", "skill", "knowledge", "understanding",
            "proficiency", "proficient", "familiar", "familiarity", "work",
            "working", "team", "teams", "role", "position", "candidate",
            "candidates", "responsibilities", "responsibility", "qualifications",
            "qualification", "requirements", "requirement", "minimum", "plus",
            "bonus", "including", "includes", "include", "related", "relevant",
            "equivalent", "degree", "bachelor", "master", "phd",
            "company", "organization", "environment", "opportunity",
            "benefits", "salary", "compensation", "location", "remote",
            "hybrid", "onsite", "full-time", "part-time", "contract",
            "apply", "application", "join", "looking", "seeking",
            "well", "good", "great", "best", "new", "use", "using", "used",
            "able", "based", "like", "need", "needs", "want", "time",
            "help", "make", "way", "day", "get", "set", "one", "two", "three"
    );

    /**
     * Words that are commonly capitalized at the start of sentences but aren't meaningful keywords.
     */
    private static final Set<String> COMMON_CAPITALIZED = Set.of(
            "the", "a", "an", "this", "that", "we", "you", "our", "your",
            "must", "will", "should", "can", "may", "are", "is", "has", "have",
            "do", "does", "if", "as", "or", "and", "but", "all", "any", "some",
            "what", "who", "how", "when", "where", "why", "each", "every",
            "no", "not", "be", "been", "being", "they", "their", "them",
            "he", "she", "it", "its", "his", "her", "my", "me",
            "strong", "excellent", "minimum", "preferred", "required",
            "experience", "ability", "knowledge", "understanding"
    );

    /**
     * Common parts of technical phrases that signal the surrounding words form a meaningful phrase.
     */
    private static final Set<String> KNOWN_PHRASE_PARTS = Set.of(
            "api", "apis", "sdk", "database", "databases", "framework", "frameworks",
            "system", "systems", "service", "services", "server", "client",
            "cloud", "data", "web", "mobile", "software", "application",
            "development", "engineering", "architecture", "design", "pattern",
            "patterns", "testing", "deployment", "integration", "delivery",
            "pipeline", "pipelines", "container", "containers", "microservice",
            "microservices", "distributed", "scalable", "real-time",
            "machine", "learning", "deep", "artificial", "intelligence",
            "natural", "language", "processing", "computer", "vision",
            "front-end", "frontend", "back-end", "backend", "full-stack", "fullstack",
            "devops", "agile", "scrum", "driven", "oriented", "based"
    );

    /**
     * Multi-word phrases to skip even if they pass individual checks.
     */
    private static final Set<String> STOP_PHRASES = Set.of(
            "will be", "must be", "should be", "would be", "may be",
            "such as", "as well", "well as", "in order", "at least",
            "in a", "to the", "for the", "of the", "on the",
            "we are", "you will", "you are", "is a", "are a",
            "with a", "and a", "the ability", "ability to"
    );

    /**
     * Known technical terms that should always be flagged as important even as single words.
     */
    private static final Set<String> TECH_TERMS = Set.of(
            // Languages
            "java", "python", "javascript", "typescript", "golang", "rust", "kotlin",
            "swift", "ruby", "scala", "perl", "php", "dart", "elixir", "haskell",
            "clojure", "erlang", "lua", "matlab", "fortran", "cobol",
            // Frameworks & libraries
            "spring", "springboot", "react", "angular", "vue", "svelte", "nextjs",
            "nuxt", "django", "flask", "fastapi", "rails", "express", "nestjs",
            "hibernate", "mybatis", "junit", "mockito", "selenium", "cypress",
            "playwright", "jest", "mocha", "pytest", "tensorflow", "pytorch",
            "keras", "pandas", "numpy", "scipy", "matplotlib",
            // Databases
            "mysql", "postgresql", "postgres", "mongodb", "redis", "elasticsearch",
            "cassandra", "dynamodb", "sqlite", "oracle", "mariadb", "couchdb",
            "neo4j", "influxdb", "cockroachdb", "firebase", "supabase",
            // Cloud & infra
            "aws", "azure", "gcp", "docker", "kubernetes", "terraform", "ansible",
            "jenkins", "gitlab", "github", "circleci", "travis", "nginx", "apache",
            "kafka", "rabbitmq", "pulsar", "kinesis", "airflow", "spark",
            "hadoop", "databricks", "snowflake", "redshift", "bigquery",
            "lambda", "fargate", "heroku", "vercel", "netlify", "cloudflare",
            // Concepts & tools
            "api", "rest", "restful", "graphql", "grpc", "websocket",
            "microservices", "devops", "agile", "scrum", "kanban",
            "linux", "unix", "bash", "git", "jira", "confluence",
            "figma", "sketch", "storybook", "webpack", "vite", "gradle", "maven",
            "npm", "yarn", "pnpm", "pip", "cargo",
            "oauth", "jwt", "saml", "sso", "ldap",
            "html", "css", "sass", "less", "tailwind", "bootstrap",
            "sql", "nosql", "orm", "jpa", "jdbc",
            "cicd", "ci", "cd", "tdd", "bdd", "sre",
            "prometheus", "grafana", "datadog", "splunk", "elk",
            "openai", "llm", "rag", "embeddings", "langchain"
    );

    // ----- Helpers -----

    private User resolveUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));
    }
}
