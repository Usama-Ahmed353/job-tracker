// ---------------------------------------------------------------
// CV Template Gallery + Live Preview + PDF Export
//
// This file is 100% additive. It does NOT modify resume-builder.js.
// It hooks in from the outside:
//   - wraps window.loadResumeBuilderView (calls the original, then adds its own init)
//   - adds its OWN "change" listener on #resumeSelect (existing listener in
//     resume-builder.js keeps working untouched)
//
// Requires:
//   - apiRequest() from api.js
//   - GET /api/resumes/{id} -> ResumeResponseDto (already used by resume-builder.js,
//     now also includes certifications, awards, projects, volunteering, publications)
//   - html2pdf.js loaded via CDN <script> tag in dashboard.html
//   - New markup block #cvBuilderPanel (see dashboard.html snippet)
// ---------------------------------------------------------------

let rtInitialized = false;
let rtCurrentTemplate = "clean";
const rtTemplateList = [
    { id: "clean", label: "Clean", desc: "Classic single-column, ATS-friendly" },
    { id: "modern", label: "Modern", desc: "Dark sidebar, two-column layout" },
    { id: "compact", label: "Compact", desc: "Dense spacing, fits more on one page" },
    { id: "minimalist", label: "Minimalist", desc: "Centered, elegant, serif style" },
    { id: "creative", label: "Creative", desc: "Colored header, bold accent lines" }
];

const RT_CONTACT_STORAGE_KEY = "cv_contact_info_v1";

// ---------------------------------------------------------------
// Wrap the existing entry point instead of editing resume-builder.js
// ---------------------------------------------------------------
(function rtWrapEntryPoint() {
    const originalLoad = window.loadResumeBuilderView;
    window.loadResumeBuilderView = function () {
        if (typeof originalLoad === "function") originalLoad();
        rtInit();
        rtOnResumeChanged(); // sync panel visibility with current selection
    };
})();

function rtInit() {
    if (rtInitialized) return;
    rtInitialized = true;

    rtRenderTemplateGallery();
    rtLoadContactDefaults();

    // Extra listener alongside the existing one in resume-builder.js — does not replace it
    document.getElementById("resumeSelect")?.addEventListener("change", rtOnResumeChanged);

    // Contact info + target title / summary / interests inputs -> persist + refresh preview
    ["cvFullName", "cvEmail", "cvPhone", "cvLocation", "cvLinkedin", "cvTargetTitle", "cvSummary", "cvInterests"].forEach(id => {
        document.getElementById(id)?.addEventListener("input", rtDebounce(() => {
            rtSaveContactInfo();
            rtRefreshPreview();
        }, 300));
    });

    document.getElementById("downloadCvBtn")?.addEventListener("click", rtDownloadPdf);
}

function rtDebounce(fn, ms) {
    let t;
    return (...args) => {
        clearTimeout(t);
        t = setTimeout(() => fn(...args), ms);
    };
}

// ---------------------------------------------------------------
// Panel visibility
// ---------------------------------------------------------------
function rtOnResumeChanged() {
    const panel = document.getElementById("cvBuilderPanel");
    if (!panel) return;
    if (typeof rbCurrentResumeId !== "undefined" && rbCurrentResumeId) {
        panel.classList.remove("hidden");
        rtRefreshPreview();
    } else {
        panel.classList.add("hidden");
    }
}

// ---------------------------------------------------------------
// Contact info (persisted locally so it survives reloads; not sent to backend)
// ---------------------------------------------------------------
function rtLoadContactDefaults() {
    let saved = {};
    try {
        saved = JSON.parse(localStorage.getItem(RT_CONTACT_STORAGE_KEY) || "{}");
    } catch (e) {
        saved = {};
    }

    const fallbackName = sessionStorage.getItem("user_name") || "";
    const fallbackEmail = sessionStorage.getItem("user_email") || "";

    const fullNameEl = document.getElementById("cvFullName");
    const emailEl = document.getElementById("cvEmail");
    if (fullNameEl && !fullNameEl.value) fullNameEl.value = saved.fullName || fallbackName;
    if (emailEl && !emailEl.value) emailEl.value = saved.email || fallbackEmail;

    const setIfEmpty = (id, val) => {
        const el = document.getElementById(id);
        if (el && !el.value) el.value = val || "";
    };
    setIfEmpty("cvPhone", saved.phone);
    setIfEmpty("cvLocation", saved.location);
    setIfEmpty("cvLinkedin", saved.linkedin);
    setIfEmpty("cvTargetTitle", saved.targetTitle);
    setIfEmpty("cvSummary", saved.summary);
    setIfEmpty("cvInterests", saved.interests);
}

function rtSaveContactInfo() {
    const data = rtGetContactInfo();
    try {
        localStorage.setItem(RT_CONTACT_STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
        // storage unavailable — non-fatal, preview still works for this session
    }
}

function rtGetContactInfo() {
    return {
        fullName: document.getElementById("cvFullName")?.value.trim() || "",
        email: document.getElementById("cvEmail")?.value.trim() || "",
        phone: document.getElementById("cvPhone")?.value.trim() || "",
        location: document.getElementById("cvLocation")?.value.trim() || "",
        linkedin: document.getElementById("cvLinkedin")?.value.trim() || "",
        targetTitle: document.getElementById("cvTargetTitle")?.value.trim() || "",
        summary: document.getElementById("cvSummary")?.value.trim() || "",
        interests: document.getElementById("cvInterests")?.value.trim() || ""
    };
}

// ---------------------------------------------------------------
// Template gallery
// ---------------------------------------------------------------
function rtRenderTemplateGallery() {
    const gallery = document.getElementById("cvTemplateGallery");
    if (!gallery) return;
    gallery.innerHTML = "";

    rtTemplateList.forEach(tpl => {
        const card = document.createElement("button");
        card.type = "button";
        card.className = "cv-template-card" + (tpl.id === rtCurrentTemplate ? " active" : "");
        card.dataset.templateId = tpl.id;
        card.innerHTML = `
            <div class="cv-template-thumb cv-template-thumb-${tpl.id}">
                <span></span><span></span><span></span>
            </div>
            <div class="cv-template-name">${tpl.label}</div>
            <div class="cv-template-desc">${tpl.desc}</div>
        `;
        card.addEventListener("click", () => {
            rtCurrentTemplate = tpl.id;
            gallery.querySelectorAll(".cv-template-card").forEach(c => c.classList.remove("active"));
            card.classList.add("active");
            rtRefreshPreview();
        });
        gallery.appendChild(card);
    });
}

// ---------------------------------------------------------------
// Fetch + render preview
// ---------------------------------------------------------------
async function rtRefreshPreview() {
    const container = document.getElementById("cvPreviewContainer");
    if (!container || typeof rbCurrentResumeId === "undefined" || !rbCurrentResumeId) return;

    try {
        const resume = await apiRequest(`/resumes/${rbCurrentResumeId}`, "GET");
        const contact = rtGetContactInfo();
        container.innerHTML = rtRenderTemplate(rtCurrentTemplate, resume, contact);
    } catch (err) {
        container.innerHTML = `<div class="cv-preview-error">Couldn't load resume content: ${rtEscapeHtml(err.message)}</div>`;
    }
}

// ---------------------------------------------------------------
// PDF export
// ---------------------------------------------------------------
async function rtDownloadPdf() {
    const btn = document.getElementById("downloadCvBtn");
    const container = document.getElementById("cvPreviewContainer");
    if (!container || !container.firstElementChild) {
        rtNotify("Select a resume version first.", "error");
        return;
    }
    if (typeof html2pdf === "undefined") {
        rtNotify("PDF library failed to load. Check your internet connection.", "error");
        return;
    }

    const originalLabel = btn.innerHTML;
    btn.disabled = true;
    btn.textContent = "Generating PDF...";

    const contact = rtGetContactInfo();
    const fileName = `${(contact.fullName || "resume").replace(/\s+/g, "_")}_CV.pdf`;

    try {
        await html2pdf()
            .set({
                margin: 0,
                filename: fileName,
                image: { type: "jpeg", quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true },
                jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
                pagebreak: { mode: ["css", "legacy"] }
            })
            .from(container.firstElementChild)
            .save();
        rtNotify("CV downloaded.", "success");
    } catch (err) {
        rtNotify("Failed to generate PDF: " + err.message, "error");
    } finally {
        btn.disabled = false;
        btn.innerHTML = originalLabel;
    }
}

function rtNotify(msg, type) {
    if (typeof showToast === "function") {
        showToast(msg, type || "info");
    } else {
        console.log("[" + (type || "info") + "]", msg);
    }
}

function rtEscapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str || "";
    return div.innerHTML;
}

// ---------------------------------------------------------------
// Shared content builders (used by all templates)
// ---------------------------------------------------------------
function rtFormatDate(dateStr) {
    if (!dateStr) return "Present";
    const d = new Date(dateStr);
    if (isNaN(d)) return String(dateStr);
    return d.toLocaleDateString(undefined, { month: "short", year: "numeric" });
}

function rtDateRange(start, end) {
    return `${rtFormatDate(start)} – ${end ? rtFormatDate(end) : "Present"}`;
}

function rtBuildExperienceHtml(workExperiences) {
    if (!workExperiences || workExperiences.length === 0) {
        return `<p class="cv-empty-note">No work experience added yet.</p>`;
    }
    return workExperiences.map(exp => `
        <div class="cv-exp-item">
            <div class="cv-exp-header">
                <span class="cv-exp-title">${rtEscapeHtml(exp.jobTitle)}</span>
                <span class="cv-exp-dates">${rtDateRange(exp.startDate, exp.endDate)}</span>
            </div>
            <div class="cv-exp-sub">
                <span class="cv-exp-company">${rtEscapeHtml(exp.companyName)}</span>
                ${exp.location ? `<span class="cv-exp-location">${rtEscapeHtml(exp.location)}</span>` : ""}
            </div>
            ${(exp.selectedBullets && exp.selectedBullets.length)
        ? `<ul class="cv-bullets">${exp.selectedBullets.map(b => `<li>${rtEscapeHtml(b.content)}</li>`).join("")}</ul>`
        : ""}
        </div>
    `).join("");
}

function rtBuildEducationHtml(education) {
    if (!education || education.length === 0) return "";
    return education.map(e => `
        <div class="cv-edu-item">
            <div class="cv-edu-header">
                <span class="cv-edu-degree">${rtEscapeHtml(e.degree)}${e.fieldOfStudy ? " in " + rtEscapeHtml(e.fieldOfStudy) : ""}</span>
                <span class="cv-edu-dates">${rtDateRange(e.startDate, e.endDate)}</span>
            </div>
            <div class="cv-edu-institution">${rtEscapeHtml(e.institution)}</div>
        </div>
    `).join("");
}

function rtBuildSkillsHtml(skills) {
    if (!skills || skills.length === 0) return "";
    return `<div class="cv-skills">${skills.map(s => `<span class="cv-skill-tag">${rtEscapeHtml(s.name)}</span>`).join("")}</div>`;
}

function rtBuildContactLine(contact) {
    return [contact.email, contact.phone, contact.location, contact.linkedin]
        .filter(Boolean)
        .map(rtEscapeHtml)
        .join(" &nbsp;·&nbsp; ");
}

function rtBuildCertificationsHtml(certifications) {
    if (!certifications || certifications.length === 0) return "";
    return certifications.map(c => `
        <div class="cv-edu-item">
            <div class="cv-edu-header">
                <span class="cv-edu-degree">${rtEscapeHtml(c.name)}</span>
                <span class="cv-edu-dates">${rtFormatDate(c.issueDate)}${c.expirationDate ? " – " + rtFormatDate(c.expirationDate) : ""}</span>
            </div>
            <div class="cv-edu-institution">${rtEscapeHtml(c.issuingOrganization)}</div>
        </div>
    `).join("");
}

function rtBuildAwardsHtml(awards) {
    if (!awards || awards.length === 0) return "";
    return awards.map(a => `
        <div class="cv-edu-item">
            <div class="cv-edu-header">
                <span class="cv-edu-degree">${rtEscapeHtml(a.title)}</span>
                <span class="cv-edu-dates">${rtFormatDate(a.dateReceived)}</span>
            </div>
            <div class="cv-edu-institution">${rtEscapeHtml(a.issuer)}</div>
            ${a.description ? `<p class="cv-item-desc">${rtEscapeHtml(a.description)}</p>` : ""}
        </div>
    `).join("");
}

function rtBuildProjectsHtml(projects) {
    if (!projects || projects.length === 0) return "";
    return projects.map(p => `
        <div class="cv-exp-item">
            <div class="cv-exp-header">
                <span class="cv-exp-title">${rtEscapeHtml(p.name)}${p.projectUrl ? ` — <a href="${rtEscapeHtml(p.projectUrl)}" target="_blank" rel="noopener">link</a>` : ""}</span>
                <span class="cv-exp-dates">${rtDateRange(p.startDate, p.endDate)}</span>
            </div>
            ${p.technologies ? `<div class="cv-exp-sub"><span class="cv-exp-company">${rtEscapeHtml(p.technologies)}</span></div>` : ""}
            ${p.description ? `<p class="cv-item-desc">${rtEscapeHtml(p.description)}</p>` : ""}
        </div>
    `).join("");
}

function rtBuildVolunteeringHtml(volunteering) {
    if (!volunteering || volunteering.length === 0) return "";
    return volunteering.map(v => `
        <div class="cv-exp-item">
            <div class="cv-exp-header">
                <span class="cv-exp-title">${rtEscapeHtml(v.role)}</span>
                <span class="cv-exp-dates">${rtDateRange(v.startDate, v.endDate)}</span>
            </div>
            <div class="cv-exp-sub">
                <span class="cv-exp-company">${rtEscapeHtml(v.organization)}</span>
            </div>
            ${v.description ? `<p class="cv-item-desc">${rtEscapeHtml(v.description)}</p>` : ""}
        </div>
    `).join("");
}

function rtBuildPublicationsHtml(publications) {
    if (!publications || publications.length === 0) return "";
    return publications.map(p => `
        <div class="cv-edu-item">
            <div class="cv-edu-header">
                <span class="cv-edu-degree">${rtEscapeHtml(p.title)}${p.url ? ` — <a href="${rtEscapeHtml(p.url)}" target="_blank" rel="noopener">link</a>` : ""}</span>
                <span class="cv-edu-dates">${rtFormatDate(p.publicationDate)}</span>
            </div>
            <div class="cv-edu-institution">${rtEscapeHtml(p.publisher)}</div>
            ${p.description ? `<p class="cv-item-desc">${rtEscapeHtml(p.description)}</p>` : ""}
        </div>
    `).join("");
}

// Renders every optional section in a fixed, sensible order. Shared by all templates
// so adding a 6th section later only means editing this one function.
function rtBuildExtraSections(resume) {
    const sections = [
        { title: "Projects", html: rtBuildProjectsHtml(resume.projects) },
        { title: "Certifications", html: rtBuildCertificationsHtml(resume.certifications) },
        { title: "Awards & Scholarships", html: rtBuildAwardsHtml(resume.awards) },
        { title: "Volunteering & Leadership", html: rtBuildVolunteeringHtml(resume.volunteering) },
        { title: "Publications", html: rtBuildPublicationsHtml(resume.publications) }
    ];
    return sections
        .filter(s => s.html)
        .map(s => `
            <div class="cv-section">
                <h2 class="cv-section-title">${s.title}</h2>
                ${s.html}
            </div>`)
        .join("");
}

// ---------------------------------------------------------------
// Template: CLEAN — single column, ATS-friendly
// ---------------------------------------------------------------
function rtRenderClean(resume, contact) {
    return `
        <div class="cv-doc cv-clean">
            <div class="cv-header">
                <h1 class="cv-name">${rtEscapeHtml(contact.fullName || "Your Name")}</h1>
                ${contact.targetTitle ? `<p class="cv-target-title">${rtEscapeHtml(contact.targetTitle)}</p>` : ""}
                ${contact.summary ? `<p class="cv-summary">${rtEscapeHtml(contact.summary)}</p>` : ""}
                <div class="cv-contact-line">${rtBuildContactLine(contact)}</div>
            </div>
            <div class="cv-section">
                <h2 class="cv-section-title">Experience</h2>
                ${rtBuildExperienceHtml(resume.workExperiences)}
            </div>
            ${resume.education && resume.education.length ? `
            <div class="cv-section">
                <h2 class="cv-section-title">Education</h2>
                ${rtBuildEducationHtml(resume.education)}
            </div>` : ""}
            ${resume.skills && resume.skills.length ? `
            <div class="cv-section">
                <h2 class="cv-section-title">Skills</h2>
                ${rtBuildSkillsHtml(resume.skills)}
            </div>` : ""}
            ${rtBuildExtraSections(resume)}
            ${contact.interests ? `
            <div class="cv-section">
                <h2 class="cv-section-title">Interests</h2>
                <p class="cv-item-desc">${rtEscapeHtml(contact.interests)}</p>
            </div>` : ""}
        </div>
    `;
}

// ---------------------------------------------------------------
// Template: MODERN — dark sidebar + main column
// ---------------------------------------------------------------
function rtRenderModern(resume, contact) {
    return `
        <div class="cv-doc cv-modern">
            <div class="cv-modern-sidebar">
                <h1 class="cv-name">${rtEscapeHtml(contact.fullName || "Your Name")}</h1>
                ${contact.targetTitle ? `<p class="cv-target-title">${rtEscapeHtml(contact.targetTitle)}</p>` : ""}
                <div class="cv-modern-contact">
                    ${[contact.email, contact.phone, contact.location, contact.linkedin]
        .filter(Boolean).map(v => `<div>${rtEscapeHtml(v)}</div>`).join("")}
                </div>
                ${resume.skills && resume.skills.length ? `
                <div class="cv-modern-block">
                    <h2 class="cv-section-title">Skills</h2>
                    ${rtBuildSkillsHtml(resume.skills)}
                </div>` : ""}
                ${resume.education && resume.education.length ? `
                <div class="cv-modern-block">
                    <h2 class="cv-section-title">Education</h2>
                    ${rtBuildEducationHtml(resume.education)}
                </div>` : ""}
                ${resume.certifications && resume.certifications.length ? `
                <div class="cv-modern-block">
                    <h2 class="cv-section-title">Certifications</h2>
                    ${rtBuildCertificationsHtml(resume.certifications)}
                </div>` : ""}
                ${contact.interests ? `
                <div class="cv-modern-block">
                    <h2 class="cv-section-title">Interests</h2>
                    <p class="cv-item-desc">${rtEscapeHtml(contact.interests)}</p>
                </div>` : ""}
            </div>
            <div class="cv-modern-main">
                ${contact.summary ? `<p class="cv-summary">${rtEscapeHtml(contact.summary)}</p>` : ""}
                <div class="cv-section">
                    <h2 class="cv-section-title">Experience</h2>
                    ${rtBuildExperienceHtml(resume.workExperiences)}
                </div>
                ${resume.projects && resume.projects.length ? `
                <div class="cv-section">
                    <h2 class="cv-section-title">Projects</h2>
                    ${rtBuildProjectsHtml(resume.projects)}
                </div>` : ""}
                ${resume.awards && resume.awards.length ? `
                <div class="cv-section">
                    <h2 class="cv-section-title">Awards & Scholarships</h2>
                    ${rtBuildAwardsHtml(resume.awards)}
                </div>` : ""}
                ${resume.volunteering && resume.volunteering.length ? `
                <div class="cv-section">
                    <h2 class="cv-section-title">Volunteering & Leadership</h2>
                    ${rtBuildVolunteeringHtml(resume.volunteering)}
                </div>` : ""}
                ${resume.publications && resume.publications.length ? `
                <div class="cv-section">
                    <h2 class="cv-section-title">Publications</h2>
                    ${rtBuildPublicationsHtml(resume.publications)}
                </div>` : ""}
            </div>
        </div>
    `;
}

// ---------------------------------------------------------------
// Template: COMPACT — dense single column
// ---------------------------------------------------------------
function rtRenderCompact(resume, contact) {
    return `
        <div class="cv-doc cv-compact">
            <div class="cv-header">
                <h1 class="cv-name">${rtEscapeHtml(contact.fullName || "Your Name")}</h1>
                ${contact.targetTitle ? `<p class="cv-target-title">${rtEscapeHtml(contact.targetTitle)}</p>` : ""}
                <div class="cv-contact-line">${rtBuildContactLine(contact)}</div>
                ${contact.summary ? `<p class="cv-summary">${rtEscapeHtml(contact.summary)}</p>` : ""}
            </div>
            <div class="cv-section">
                <h2 class="cv-section-title">Experience</h2>
                ${rtBuildExperienceHtml(resume.workExperiences)}
            </div>
            ${resume.education && resume.education.length ? `
            <div class="cv-section">
                <h2 class="cv-section-title">Education</h2>
                ${rtBuildEducationHtml(resume.education)}
            </div>` : ""}
            ${resume.skills && resume.skills.length ? `
            <div class="cv-section">
                <h2 class="cv-section-title">Skills</h2>
                ${rtBuildSkillsHtml(resume.skills)}
            </div>` : ""}
            ${rtBuildExtraSections(resume)}
            ${contact.interests ? `
            <div class="cv-section">
                <h2 class="cv-section-title">Interests</h2>
                <p class="cv-item-desc">${rtEscapeHtml(contact.interests)}</p>
            </div>` : ""}
        </div>
    `;
}

// ---------------------------------------------------------------
// Template: MINIMALIST — centered, elegant, serif
// ---------------------------------------------------------------
function rtRenderMinimalist(resume, contact) {
    return `
        <div class="cv-doc cv-minimalist">
            <div class="cv-header">
                <h1 class="cv-name">${rtEscapeHtml(contact.fullName || "Your Name")}</h1>
                ${contact.targetTitle ? `<p class="cv-target-title">${rtEscapeHtml(contact.targetTitle)}</p>` : ""}
                <div class="cv-contact-line">${rtBuildContactLine(contact)}</div>
            </div>
            ${contact.summary ? `<p class="cv-summary">${rtEscapeHtml(contact.summary)}</p>` : ""}
            <div class="cv-section">
                <h2 class="cv-section-title">Experience</h2>
                ${rtBuildExperienceHtml(resume.workExperiences)}
            </div>
            ${resume.education && resume.education.length ? `
            <div class="cv-section">
                <h2 class="cv-section-title">Education</h2>
                ${rtBuildEducationHtml(resume.education)}
            </div>` : ""}
            ${resume.skills && resume.skills.length ? `
            <div class="cv-section">
                <h2 class="cv-section-title">Skills</h2>
                ${rtBuildSkillsHtml(resume.skills)}
            </div>` : ""}
            ${rtBuildExtraSections(resume)}
            ${contact.interests ? `
            <div class="cv-section">
                <h2 class="cv-section-title">Interests</h2>
                <p class="cv-item-desc">${rtEscapeHtml(contact.interests)}</p>
            </div>` : ""}
        </div>
    `;
}

// ---------------------------------------------------------------
// Template: CREATIVE — colored header banner, accent-lined sections
// ---------------------------------------------------------------
function rtRenderCreative(resume, contact) {
    return `
        <div class="cv-doc cv-creative">
            <div class="cv-creative-banner">
                <h1 class="cv-name">${rtEscapeHtml(contact.fullName || "Your Name")}</h1>
                ${contact.targetTitle ? `<p class="cv-target-title">${rtEscapeHtml(contact.targetTitle)}</p>` : ""}
                <div class="cv-contact-line">${rtBuildContactLine(contact)}</div>
            </div>
            <div class="cv-creative-body">
                ${contact.summary ? `<p class="cv-summary">${rtEscapeHtml(contact.summary)}</p>` : ""}
                <div class="cv-section">
                    <h2 class="cv-section-title">Experience</h2>
                    ${rtBuildExperienceHtml(resume.workExperiences)}
                </div>
                ${resume.education && resume.education.length ? `
                <div class="cv-section">
                    <h2 class="cv-section-title">Education</h2>
                    ${rtBuildEducationHtml(resume.education)}
                </div>` : ""}
                ${resume.skills && resume.skills.length ? `
                <div class="cv-section">
                    <h2 class="cv-section-title">Skills</h2>
                    ${rtBuildSkillsHtml(resume.skills)}
                </div>` : ""}
                ${rtBuildExtraSections(resume)}
                ${contact.interests ? `
                <div class="cv-section">
                    <h2 class="cv-section-title">Interests</h2>
                    <p class="cv-item-desc">${rtEscapeHtml(contact.interests)}</p>
                </div>` : ""}
            </div>
        </div>
    `;
}

function rtRenderTemplate(templateId, resume, contact) {
    if (templateId === "modern") return rtRenderModern(resume, contact);
    if (templateId === "compact") return rtRenderCompact(resume, contact);
    if (templateId === "minimalist") return rtRenderMinimalist(resume, contact);
    if (templateId === "creative") return rtRenderCreative(resume, contact);
    return rtRenderClean(resume, contact);
}