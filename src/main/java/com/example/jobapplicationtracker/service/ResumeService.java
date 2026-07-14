package com.example.jobapplicationtracker.service;

import com.example.jobapplicationtracker.dto.ResumeRequestDto;
import com.example.jobapplicationtracker.dto.ResumeResponseDto;
import com.example.jobapplicationtracker.dto.ResumeSummaryDto;
import com.example.jobapplicationtracker.exception.ResourceNotFoundException;
import com.example.jobapplicationtracker.model.*;
import com.example.jobapplicationtracker.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class ResumeService {

    private final ResumeRepository resumeRepository;
    private final WorkExperienceRepository workExperienceRepository;
    private final BulletRepository bulletRepository;
    private final SkillRepository skillRepository;
    private final EducationRepository educationRepository;
    private final CertificationRepository certificationRepository;
    private final AwardRepository awardRepository;
    private final ProjectRepository projectRepository;
    private final VolunteerExperienceRepository volunteerExperienceRepository;
    private final PublicationRepository publicationRepository;
    private final UserRepository userRepository;

    public ResumeService(ResumeRepository resumeRepository,
                         WorkExperienceRepository workExperienceRepository,
                         BulletRepository bulletRepository,
                         SkillRepository skillRepository,
                         EducationRepository educationRepository,
                         CertificationRepository certificationRepository,
                         AwardRepository awardRepository,
                         ProjectRepository projectRepository,
                         VolunteerExperienceRepository volunteerExperienceRepository,
                         PublicationRepository publicationRepository,
                         UserRepository userRepository) {
        this.resumeRepository = resumeRepository;
        this.workExperienceRepository = workExperienceRepository;
        this.bulletRepository = bulletRepository;
        this.skillRepository = skillRepository;
        this.educationRepository = educationRepository;
        this.certificationRepository = certificationRepository;
        this.awardRepository = awardRepository;
        this.projectRepository = projectRepository;
        this.volunteerExperienceRepository = volunteerExperienceRepository;
        this.publicationRepository = publicationRepository;
        this.userRepository = userRepository;
    }

    // ----- Resume CRUD -----

    public ResumeSummaryDto createResume(ResumeRequestDto request, String email) {
        User user = resolveUser(email);
        Resume resume = new Resume();
        resume.setUser(user);
        resume.setTitle(request.getTitle());
        resume = resumeRepository.save(resume);
        return toSummary(resume);
    }

    public List<ResumeSummaryDto> listResumes(String email) {
        User user = resolveUser(email);
        return resumeRepository.findByUserOrderByUpdatedAtDesc(user)
                .stream()
                .map(this::toSummary)
                .toList();
    }

    /**
     * Returns the full resume with only the SELECTED bullets for this version,
     * grouped under their work experiences. Also includes all user skills, education,
     * certifications, awards, projects, volunteering, and publications — these
     * content-bank sections are not toggled per-version, same as skills/education.
     */
    @Transactional(readOnly = true)
    public ResumeResponseDto getResumeWithContent(Long resumeId, String email) {
        User user = resolveUser(email);
        Resume resume = findOwnedOrThrow(resumeId, user);

        Set<Long> selectedBulletIds = resume.getSelectedBullets().stream()
                .map(Bullet::getId)
                .collect(Collectors.toSet());

        List<WorkExperience> experiences = workExperienceRepository.findByUserOrderByStartDateDesc(user);
        List<Skill> skills = skillRepository.findByUserOrderByNameAsc(user);
        List<Education> educationList = educationRepository.findByUserOrderByStartDateDesc(user);
        List<Certification> certifications = certificationRepository.findByUserOrderByIssueDateDesc(user);
        List<Award> awards = awardRepository.findByUserOrderByDateReceivedDesc(user);
        List<Project> projects = projectRepository.findByUserOrderByStartDateDesc(user);
        List<VolunteerExperience> volunteering = volunteerExperienceRepository.findByUserOrderByStartDateDesc(user);
        List<Publication> publications = publicationRepository.findByUserOrderByPublicationDateDesc(user);

        ResumeResponseDto dto = new ResumeResponseDto();
        dto.setId(resume.getId());
        dto.setTitle(resume.getTitle());
        dto.setCreatedAt(resume.getCreatedAt());
        dto.setUpdatedAt(resume.getUpdatedAt());

        // Map work experiences, filtering bullets to only selected ones
        dto.setWorkExperiences(experiences.stream().map(exp -> {
            ResumeResponseDto.WorkExperienceDto weDto = new ResumeResponseDto.WorkExperienceDto();
            weDto.setId(exp.getId());
            weDto.setCompanyName(exp.getCompanyName());
            weDto.setJobTitle(exp.getJobTitle());
            weDto.setStartDate(exp.getStartDate());
            weDto.setEndDate(exp.getEndDate());
            weDto.setLocation(exp.getLocation());

            List<ResumeResponseDto.BulletDto> selected = exp.getBullets().stream()
                    .filter(b -> selectedBulletIds.contains(b.getId()))
                    .map(b -> {
                        ResumeResponseDto.BulletDto bDto = new ResumeResponseDto.BulletDto();
                        bDto.setId(b.getId());
                        bDto.setContent(b.getContent());
                        bDto.setDisplayOrder(b.getDisplayOrder());
                        return bDto;
                    })
                    .toList();
            weDto.setSelectedBullets(selected);
            return weDto;
        }).toList());

        dto.setSkills(skills.stream().map(s -> {
            ResumeResponseDto.SkillDto sDto = new ResumeResponseDto.SkillDto();
            sDto.setId(s.getId());
            sDto.setName(s.getName());
            sDto.setCategory(s.getCategory());
            return sDto;
        }).toList());

        dto.setEducation(educationList.stream().map(e -> {
            ResumeResponseDto.EducationDto eDto = new ResumeResponseDto.EducationDto();
            eDto.setId(e.getId());
            eDto.setInstitution(e.getInstitution());
            eDto.setDegree(e.getDegree());
            eDto.setFieldOfStudy(e.getFieldOfStudy());
            eDto.setStartDate(e.getStartDate());
            eDto.setEndDate(e.getEndDate());
            return eDto;
        }).toList());

        dto.setCertifications(certifications.stream().map(c -> new ResumeResponseDto.CertificationDto(
                c.getId(), c.getName(), c.getIssuingOrganization(), c.getIssueDate(),
                c.getExpirationDate(), c.getCredentialUrl()
        )).toList());

        dto.setAwards(awards.stream().map(a -> new ResumeResponseDto.AwardDto(
                a.getId(), a.getTitle(), a.getIssuer(), a.getDateReceived(), a.getDescription()
        )).toList());

        dto.setProjects(projects.stream().map(p -> new ResumeResponseDto.ProjectDto(
                p.getId(), p.getName(), p.getDescription(), p.getTechnologies(),
                p.getProjectUrl(), p.getStartDate(), p.getEndDate()
        )).toList());

        dto.setVolunteering(volunteering.stream().map(v -> new ResumeResponseDto.VolunteerExperienceDto(
                v.getId(), v.getOrganization(), v.getRole(), v.getStartDate(), v.getEndDate(), v.getDescription()
        )).toList());

        dto.setPublications(publications.stream().map(pub -> new ResumeResponseDto.PublicationDto(
                pub.getId(), pub.getTitle(), pub.getPublisher(), pub.getPublicationDate(),
                pub.getUrl(), pub.getDescription()
        )).toList());

        return dto;
    }

    public ResumeSummaryDto updateResume(Long resumeId, ResumeRequestDto request, String email) {
        User user = resolveUser(email);
        Resume resume = findOwnedOrThrow(resumeId, user);
        resume.setTitle(request.getTitle());
        return toSummary(resumeRepository.save(resume));
    }

    public void deleteResume(Long resumeId, String email) {
        User user = resolveUser(email);
        Resume resume = findOwnedOrThrow(resumeId, user);
        resumeRepository.delete(resume);
    }

    // ----- Bullet toggle -----

    /**
     * Toggle a bullet on/off for a specific resume version.
     * If the bullet is currently selected, it is removed; otherwise it is added.
     *
     * @return true if the bullet is now selected, false if it was deselected
     */
    @Transactional
    public boolean toggleBulletForResume(Long resumeId, Long bulletId, String email) {
        User user = resolveUser(email);
        Resume resume = findOwnedOrThrow(resumeId, user);

        Bullet bullet = bulletRepository.findById(bulletId)
                .orElseThrow(() -> new ResourceNotFoundException("Bullet not found with id: " + bulletId));

        // Verify the bullet belongs to one of the user's work experiences
        if (!bullet.getWorkExperience().getUser().getId().equals(user.getId())) {
            throw new ResourceNotFoundException("Bullet not found with id: " + bulletId);
        }

        Set<Bullet> selected = resume.getSelectedBullets();
        boolean nowSelected;
        if (selected.contains(bullet)) {
            selected.remove(bullet);
            nowSelected = false;
        } else {
            selected.add(bullet);
            nowSelected = true;
        }

        resumeRepository.save(resume);
        return nowSelected;
    }

    // ----- Duplicate -----

    /**
     * Clone an existing resume as a starting point for a new version.
     * Copies the title (with " (Copy)" suffix) and all bullet selections.
     */
    @Transactional
    public ResumeSummaryDto duplicateResume(Long sourceResumeId, String email) {
        User user = resolveUser(email);
        Resume source = findOwnedOrThrow(sourceResumeId, user);

        Resume clone = new Resume();
        clone.setUser(user);
        clone.setTitle(source.getTitle() + " (Copy)");
        clone.setSelectedBullets(new HashSet<>(source.getSelectedBullets()));

        clone = resumeRepository.save(clone);
        return toSummary(clone);
    }

    // ----- Helpers -----

    private User resolveUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));
    }

    private Resume findOwnedOrThrow(Long resumeId, User user) {
        return resumeRepository.findByIdAndUser(resumeId, user)
                .orElseThrow(() -> new ResourceNotFoundException("Resume not found with id: " + resumeId));
    }

    private ResumeSummaryDto toSummary(Resume resume) {
        return new ResumeSummaryDto(
                resume.getId(),
                resume.getTitle(),
                resume.getCreatedAt(),
                resume.getUpdatedAt()
        );
    }
}
