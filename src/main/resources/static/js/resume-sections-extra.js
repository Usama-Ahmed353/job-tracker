// ---------------------------------------------------------------
// Resume Builder — extra content-bank sections:
//   Certifications, Awards, Projects, Volunteering, Publications
//
// This file is 100% additive, same pattern as resume-templates.js.
// It does NOT modify resume-builder.js. It hooks in from the outside
// by wrapping window.loadResumeBuilderView.
//
// Backend endpoints (all follow the exact Skill/Education CRUD shape):
//   /api/certifications   { name, issuingOrganization, issueDate, expirationDate, credentialUrl }
//   /api/awards           { title, issuer, dateReceived, description }
//   /api/projects         { name, description, technologies, projectUrl, startDate, endDate }
//   /api/volunteering     { organization, role, startDate, endDate, description }
//   /api/publications     { title, publisher, publicationDate, url, description }
//
// Requires matching markup blocks in dashboard.html (see snippet provided).
// ---------------------------------------------------------------

(function rsWrapEntryPoint() {
    const originalLoad = window.loadResumeBuilderView;
    window.loadResumeBuilderView = function () {
        if (typeof originalLoad === "function") originalLoad();
        rsWireOnce();
        rsLoadCertifications();
        rsLoadAwards();
        rsLoadProjects();
        rsLoadVolunteering();
        rsLoadPublications();
    };
})();

let rsInitialized = false;

function rsNotify(msg, type) {
    if (typeof showToast === "function") {
        showToast(msg, type || "info");
    } else {
        console.log("[" + (type || "info") + "]", msg);
    }
}

function rsEscapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str || "";
    return div.innerHTML;
}

function rsFormatDateRange(start, end) {
    const s = start ? String(start).substring(0, 7) : "?";
    const e = end ? String(end).substring(0, 7) : "Present";
    return `${s} – ${e}`;
}

function rsRefreshPreview() {
    if (typeof rtRefreshPreview === "function") rtRefreshPreview();
}

// ---------------------------------------------------------------
// Wire all "Add" forms once
// ---------------------------------------------------------------
function rsWireOnce() {
    if (rsInitialized) return;
    rsInitialized = true;

    // ---- Certifications ----
    rsWireForm({
        addBtnId: "addCertificationBtn",
        formId: "addCertificationForm",
        cancelBtnId: "cancelCertificationBtn",
        saveBtnId: "saveCertificationBtn",
        endpoint: "/certifications",
        fieldIds: ["certName", "certOrg", "certIssueDate", "certExpDate", "certUrl"],
        buildPayload: () => ({
            name: document.getElementById("certName").value.trim(),
            issuingOrganization: document.getElementById("certOrg").value.trim(),
            issueDate: document.getElementById("certIssueDate").value,
            expirationDate: document.getElementById("certExpDate").value || null,
            credentialUrl: document.getElementById("certUrl").value.trim() || null
        }),
        validate: (p) => p.name && p.issuingOrganization && p.issueDate,
        errorMsg: "Certification name, organization, and issue date are required.",
        reload: rsLoadCertifications,
        successMsg: "Certification added."
    });

    // ---- Awards ----
    rsWireForm({
        addBtnId: "addAwardBtn",
        formId: "addAwardForm",
        cancelBtnId: "cancelAwardBtn",
        saveBtnId: "saveAwardBtn",
        endpoint: "/awards",
        fieldIds: ["awardTitle", "awardIssuer", "awardDate", "awardDescription"],
        buildPayload: () => ({
            title: document.getElementById("awardTitle").value.trim(),
            issuer: document.getElementById("awardIssuer").value.trim(),
            dateReceived: document.getElementById("awardDate").value,
            description: document.getElementById("awardDescription").value.trim() || null
        }),
        validate: (p) => p.title && p.issuer && p.dateReceived,
        errorMsg: "Award title, issuer, and date are required.",
        reload: rsLoadAwards,
        successMsg: "Award added."
    });

    // ---- Projects ----
    rsWireForm({
        addBtnId: "addProjectBtn",
        formId: "addProjectForm",
        cancelBtnId: "cancelProjectBtn",
        saveBtnId: "saveProjectBtn",
        endpoint: "/projects",
        fieldIds: ["projectName", "projectDescription", "projectTech", "projectUrl", "projectStart", "projectEnd"],
        buildPayload: () => ({
            name: document.getElementById("projectName").value.trim(),
            description: document.getElementById("projectDescription").value.trim() || null,
            technologies: document.getElementById("projectTech").value.trim() || null,
            projectUrl: document.getElementById("projectUrl").value.trim() || null,
            startDate: document.getElementById("projectStart").value,
            endDate: document.getElementById("projectEnd").value || null
        }),
        validate: (p) => p.name && p.startDate,
        errorMsg: "Project name and start date are required.",
        reload: rsLoadProjects,
        successMsg: "Project added."
    });

    // ---- Volunteering ----
    rsWireForm({
        addBtnId: "addVolunteerBtn",
        formId: "addVolunteerForm",
        cancelBtnId: "cancelVolunteerBtn",
        saveBtnId: "saveVolunteerBtn",
        endpoint: "/volunteering",
        fieldIds: ["volOrg", "volRole", "volStart", "volEnd", "volDescription"],
        buildPayload: () => ({
            organization: document.getElementById("volOrg").value.trim(),
            role: document.getElementById("volRole").value.trim(),
            startDate: document.getElementById("volStart").value,
            endDate: document.getElementById("volEnd").value || null,
            description: document.getElementById("volDescription").value.trim() || null
        }),
        validate: (p) => p.organization && p.role && p.startDate,
        errorMsg: "Organization, role, and start date are required.",
        reload: rsLoadVolunteering,
        successMsg: "Volunteer experience added."
    });

    // ---- Publications ----
    rsWireForm({
        addBtnId: "addPublicationBtn",
        formId: "addPublicationForm",
        cancelBtnId: "cancelPublicationBtn",
        saveBtnId: "savePublicationBtn",
        endpoint: "/publications",
        fieldIds: ["pubTitle", "pubPublisher", "pubDate", "pubUrl", "pubDescription"],
        buildPayload: () => ({
            title: document.getElementById("pubTitle").value.trim(),
            publisher: document.getElementById("pubPublisher").value.trim(),
            publicationDate: document.getElementById("pubDate").value,
            url: document.getElementById("pubUrl").value.trim() || null,
            description: document.getElementById("pubDescription").value.trim() || null
        }),
        validate: (p) => p.title && p.publisher && p.publicationDate,
        errorMsg: "Title, publisher, and publication date are required.",
        reload: rsLoadPublications,
        successMsg: "Publication added."
    });
}

// Generic form wiring helper — shared by all 5 sections above
function rsWireForm(cfg) {
    const addBtn = document.getElementById(cfg.addBtnId);
    const form = document.getElementById(cfg.formId);
    const cancelBtn = document.getElementById(cfg.cancelBtnId);
    const saveBtn = document.getElementById(cfg.saveBtnId);
    if (!addBtn || !form || !saveBtn) return;

    addBtn.addEventListener("click", () => form.classList.toggle("hidden"));
    cancelBtn?.addEventListener("click", () => form.classList.add("hidden"));

    saveBtn.addEventListener("click", async () => {
        const payload = cfg.buildPayload();
        if (!cfg.validate(payload)) {
            rsNotify(cfg.errorMsg, "error");
            return;
        }
        try {
            await apiRequest(cfg.endpoint, "POST", payload);
            form.classList.add("hidden");
            cfg.fieldIds.forEach(id => {
                const el = document.getElementById(id);
                if (el) el.value = "";
            });
            rsNotify(cfg.successMsg, "success");
            await cfg.reload();
            rsRefreshPreview();
        } catch (err) {
            rsNotify("Failed to save: " + err.message, "error");
        }
    });
}

// ---------------------------------------------------------------
// CERTIFICATIONS
// ---------------------------------------------------------------
async function rsLoadCertifications() {
    try {
        const items = await apiRequest("/certifications", "GET") || [];
        rsRenderCertifications(items);
        rsRefreshPreview();
    } catch (err) {
        rsNotify("Failed to load certifications: " + err.message, "error");
    }
}

function rsRenderCertifications(items) {
    const container = document.getElementById("certificationsList");
    if (!container) return;
    container.innerHTML = "";
    if (items.length === 0) {
        container.innerHTML = '<p class="text-xs text-slate-400 font-medium">No certifications added yet.</p>';
        return;
    }
    items.forEach(cert => {
        const row = document.createElement("div");
        row.className = "flex items-start justify-between gap-2 bg-slate-50 border border-slate-100 rounded-xl p-3";
        row.innerHTML = `
            <div>
                <p class="text-xs font-bold text-slate-900">${rsEscapeHtml(cert.name)}</p>
                <p class="text-xs text-slate-500">${rsEscapeHtml(cert.issuingOrganization)}</p>
                <p class="text-[10px] text-slate-400 font-medium mt-0.5">${rsFormatDateRange(cert.issueDate, cert.expirationDate)}</p>
            </div>
            <button type="button" class="text-slate-400 hover:text-rose-600 text-xs font-bold flex-shrink-0" data-id="${cert.id}">Delete</button>
        `;
        row.querySelector("button").addEventListener("click", async () => {
            try {
                await apiRequest(`/certifications/${cert.id}`, "DELETE");
                rsNotify("Certification removed.", "success");
                await rsLoadCertifications();
                rsRefreshPreview();
            } catch (err) {
                rsNotify("Failed to remove: " + err.message, "error");
            }
        });
        container.appendChild(row);
    });
}

// ---------------------------------------------------------------
// AWARDS
// ---------------------------------------------------------------
async function rsLoadAwards() {
    try {
        const items = await apiRequest("/awards", "GET") || [];
        rsRenderAwards(items);
        rsRefreshPreview();
    } catch (err) {
        rsNotify("Failed to load awards: " + err.message, "error");
    }
}

function rsRenderAwards(items) {
    const container = document.getElementById("awardsList");
    if (!container) return;
    container.innerHTML = "";
    if (items.length === 0) {
        container.innerHTML = '<p class="text-xs text-slate-400 font-medium">No awards added yet.</p>';
        return;
    }
    items.forEach(award => {
        const row = document.createElement("div");
        row.className = "flex items-start justify-between gap-2 bg-slate-50 border border-slate-100 rounded-xl p-3";
        row.innerHTML = `
            <div>
                <p class="text-xs font-bold text-slate-900">${rsEscapeHtml(award.title)}</p>
                <p class="text-xs text-slate-500">${rsEscapeHtml(award.issuer)}</p>
                <p class="text-[10px] text-slate-400 font-medium mt-0.5">${award.dateReceived ? String(award.dateReceived).substring(0, 7) : ""}</p>
            </div>
            <button type="button" class="text-slate-400 hover:text-rose-600 text-xs font-bold flex-shrink-0" data-id="${award.id}">Delete</button>
        `;
        row.querySelector("button").addEventListener("click", async () => {
            try {
                await apiRequest(`/awards/${award.id}`, "DELETE");
                rsNotify("Award removed.", "success");
                await rsLoadAwards();
                rsRefreshPreview();
            } catch (err) {
                rsNotify("Failed to remove: " + err.message, "error");
            }
        });
        container.appendChild(row);
    });
}

// ---------------------------------------------------------------
// PROJECTS
// ---------------------------------------------------------------
async function rsLoadProjects() {
    try {
        const items = await apiRequest("/projects", "GET") || [];
        rsRenderProjects(items);
        rsRefreshPreview();
    } catch (err) {
        rsNotify("Failed to load projects: " + err.message, "error");
    }
}

function rsRenderProjects(items) {
    const container = document.getElementById("projectsList");
    if (!container) return;
    container.innerHTML = "";
    if (items.length === 0) {
        container.innerHTML = '<p class="text-xs text-slate-400 font-medium">No projects added yet.</p>';
        return;
    }
    items.forEach(proj => {
        const row = document.createElement("div");
        row.className = "flex items-start justify-between gap-2 bg-slate-50 border border-slate-100 rounded-xl p-3";
        row.innerHTML = `
            <div>
                <p class="text-xs font-bold text-slate-900">${rsEscapeHtml(proj.name)}</p>
                ${proj.technologies ? `<p class="text-xs text-slate-500">${rsEscapeHtml(proj.technologies)}</p>` : ""}
                <p class="text-[10px] text-slate-400 font-medium mt-0.5">${rsFormatDateRange(proj.startDate, proj.endDate)}</p>
            </div>
            <button type="button" class="text-slate-400 hover:text-rose-600 text-xs font-bold flex-shrink-0" data-id="${proj.id}">Delete</button>
        `;
        row.querySelector("button").addEventListener("click", async () => {
            try {
                await apiRequest(`/projects/${proj.id}`, "DELETE");
                rsNotify("Project removed.", "success");
                await rsLoadProjects();
                rsRefreshPreview();
            } catch (err) {
                rsNotify("Failed to remove: " + err.message, "error");
            }
        });
        container.appendChild(row);
    });
}

// ---------------------------------------------------------------
// VOLUNTEERING
// ---------------------------------------------------------------
async function rsLoadVolunteering() {
    try {
        const items = await apiRequest("/volunteering", "GET") || [];
        rsRenderVolunteering(items);
        rsRefreshPreview();
    } catch (err) {
        rsNotify("Failed to load volunteering: " + err.message, "error");
    }
}

function rsRenderVolunteering(items) {
    const container = document.getElementById("volunteeringList");
    if (!container) return;
    container.innerHTML = "";
    if (items.length === 0) {
        container.innerHTML = '<p class="text-xs text-slate-400 font-medium">No volunteering added yet.</p>';
        return;
    }
    items.forEach(vol => {
        const row = document.createElement("div");
        row.className = "flex items-start justify-between gap-2 bg-slate-50 border border-slate-100 rounded-xl p-3";
        row.innerHTML = `
            <div>
                <p class="text-xs font-bold text-slate-900">${rsEscapeHtml(vol.role)}</p>
                <p class="text-xs text-slate-500">${rsEscapeHtml(vol.organization)}</p>
                <p class="text-[10px] text-slate-400 font-medium mt-0.5">${rsFormatDateRange(vol.startDate, vol.endDate)}</p>
            </div>
            <button type="button" class="text-slate-400 hover:text-rose-600 text-xs font-bold flex-shrink-0" data-id="${vol.id}">Delete</button>
        `;
        row.querySelector("button").addEventListener("click", async () => {
            try {
                await apiRequest(`/volunteering/${vol.id}`, "DELETE");
                rsNotify("Volunteer experience removed.", "success");
                await rsLoadVolunteering();
                rsRefreshPreview();
            } catch (err) {
                rsNotify("Failed to remove: " + err.message, "error");
            }
        });
        container.appendChild(row);
    });
}

// ---------------------------------------------------------------
// PUBLICATIONS
// ---------------------------------------------------------------
async function rsLoadPublications() {
    try {
        const items = await apiRequest("/publications", "GET") || [];
        rsRenderPublications(items);
        rsRefreshPreview();
    } catch (err) {
        rsNotify("Failed to load publications: " + err.message, "error");
    }
}

function rsRenderPublications(items) {
    const container = document.getElementById("publicationsList");
    if (!container) return;
    container.innerHTML = "";
    if (items.length === 0) {
        container.innerHTML = '<p class="text-xs text-slate-400 font-medium">No publications added yet.</p>';
        return;
    }
    items.forEach(pub => {
        const row = document.createElement("div");
        row.className = "flex items-start justify-between gap-2 bg-slate-50 border border-slate-100 rounded-xl p-3";
        row.innerHTML = `
            <div>
                <p class="text-xs font-bold text-slate-900">${rsEscapeHtml(pub.title)}</p>
                <p class="text-xs text-slate-500">${rsEscapeHtml(pub.publisher)}</p>
                <p class="text-[10px] text-slate-400 font-medium mt-0.5">${pub.publicationDate ? String(pub.publicationDate).substring(0, 7) : ""}</p>
            </div>
            <button type="button" class="text-slate-400 hover:text-rose-600 text-xs font-bold flex-shrink-0" data-id="${pub.id}">Delete</button>
        `;
        row.querySelector("button").addEventListener("click", async () => {
            try {
                await apiRequest(`/publications/${pub.id}`, "DELETE");
                rsNotify("Publication removed.", "success");
                await rsLoadPublications();
                rsRefreshPreview();
            } catch (err) {
                rsNotify("Failed to remove: " + err.message, "error");
            }
        });
        container.appendChild(row);
    });
}
