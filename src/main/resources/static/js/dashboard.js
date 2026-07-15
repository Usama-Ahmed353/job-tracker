//
// let applications = [];
// let discoveredExternalJobs = []; // Search engine feed array cache
//
// // Redirect immediately if not logged in
// if (!getToken()) {
//     window.location.href = "/login.html";
// }
//
// // Parse JWT token to display user email in sidebar and check role permissions
// function initUserProfile() {
//     let displayName = sessionStorage.getItem("user_name") || sessionStorage.getItem("user_email");
//
//     const token = getToken();
//     if (token) {
//         try {
//             const payloadBase64 = token.split('.')[1];
//             const decodedPayload = JSON.parse(atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/')));
//             displayName = displayName || decodedPayload.sub;
//
//             // Check if user contains administrative rights within claims payload
//             const roles = decodedPayload.roles || decodedPayload.authorities || [];
//             if (roles.includes("ROLE_ADMIN") || roles.includes("ADMIN")) {
//                 document.getElementById("adminSidebarLink")?.classList.remove("hidden");
//             }
//         } catch (e) {
//             console.error("Error decoding JWT payload claims:", e);
//         }
//     }
//
//     if (displayName) {
//         document.getElementById("userName").textContent = displayName;
//         document.getElementById("userAvatar").textContent = displayName.charAt(0).toUpperCase();
//     }
// }
//
// // ---------- Client-Side SPA Router (Fixed Page Transitions) ----------
// function handleRoute() {
//     const route = window.location.hash || "#/dashboard";
//
//     // 1. Completely clear out previous active classes from all links & views
//     document.querySelectorAll(".nav-item").forEach(item => item.classList.remove("active"));
//     document.querySelectorAll(".view-container").forEach(view => view.classList.remove("active"));
//
//     // Close mobile menu sidebar drawer overlay context
//     const sidebar = document.getElementById("sidebar");
//     if (sidebar) sidebar.classList.remove("active");
//
//     // 2. Direct route processing mapping tree
//     if (route.startsWith("#/dashboard")) {
//         activateView("dashboard");
//         loadApplications();
//     } else if (route.startsWith("#/jobs")) {
//         activateView("jobs");
//         fetchExternalJobsFeed();
//     } else if (route.startsWith("#/ai-jobs")) {
//         activateView("ai-jobs");
//     } else if (route.startsWith("#/analytics")) {
//         activateView("analytics");
//         if (typeof loadAnalytics === "function") { loadAnalytics(); }
//     } else if (route.startsWith("#/documents")) {
//         activateView("documents");
//         if (typeof initDocumentUpload === "function") { initDocumentUpload(); }
//         if (typeof loadDocumentsView === "function") { loadDocumentsView(); }
//     } else if (route.startsWith("#/resume-builder")) {
//         activateView("resume-builder");
//         if (typeof loadResumeBuilderView === "function") { loadResumeBuilderView(); }
//     } else if (route.startsWith("#/cover-letter")) {
//         activateView("cover-letter");
//         if (typeof loadCoverLetterBuilderView === "function") { loadCoverLetterBuilderView(); }
//     } else if (route.startsWith("#/calendar")) {
//         activateView("calendar");
//         if (typeof loadCalendarView === "function") { loadCalendarView(); }
//     } else if (route.startsWith("#/settings")) {
//         activateView("settings");
//         if (typeof loadSettingsView === "function") { loadSettingsView(); }
//     } else if (route.startsWith("#/admin")) {
//         activateView("admin");
//     } else {
//         window.location.hash = "#/dashboard";
//     }
// }
//
// function activateView(viewName) {
//     const link = document.querySelector(`.nav-item[data-view="${viewName}"]`);
//     if (link) link.classList.add("active");
//
//     const viewContainer = document.getElementById(`${viewName}-view`);
//     if (viewContainer) {
//         viewContainer.classList.add("active");
//     }
// }
//
// // ---------- Job Search Engine Logic (Database Context-Backed) ----------
// async function fetchExternalJobsFeed() {
//     const container = document.getElementById("externalJobsFeedContainer");
//     if (!container) return;
//     container.innerHTML = `<div class="text-slate-500 font-medium text-xs p-4 animate-pulse">Querying internal vacancy indices...</div>`;
//
//     const queryParams = new URLSearchParams({
//         keywords: document.getElementById("jobSearchKeywords")?.value || "",
//         company: document.getElementById("jobSearchCompany")?.value || "",
//         country: document.getElementById("jobSearchCountry")?.value || ""
//     });
//
//     try {
//         discoveredExternalJobs = await apiRequest(`/applications/external-search?${queryParams.toString()}`, "GET") || [];
//         renderExternalJobsFeed();
//     } catch (err) {
//         console.error("Feed recovery sequence issue:", err);
//         container.innerHTML = `<div class="text-rose-500 font-medium text-xs p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl">Could not retrieve available database listings.</div>`;
//     }
// }
//
// // ---------- AI Job Search (Gemini + Google Search grounding — live web results) ----------
// let liveAiJobs = []; // Cache of the last live search results (not DB rows)
//
// async function runLiveAiJobSearch() {
//     const input = document.getElementById("aiLiveJobSearchInput");
//     const query = input ? input.value.trim() : "";
//
//     if (!query) {
//         showToast("Describe the job you're looking for first.", "error");
//         return;
//     }
//
//     const container = document.getElementById("aiJobsResultsContainer");
//     const btn = document.getElementById("aiLiveJobSearchBtn");
//     if (btn) btn.disabled = true;
//     if (container) {
//         container.innerHTML = `<div class="text-slate-500 font-medium text-xs p-4 animate-pulse">Searching the live web for real job postings...</div>`;
//     }
//
//     try {
//         const response = await apiRequest(`/applications/live-search?query=${encodeURIComponent(query)}`, "GET");
//         liveAiJobs = Array.isArray(response) ? response : [];
//         renderLiveAiJobs();
//     } catch (err) {
//         console.error("Live AI job search issue:", err);
//         if (container) {
//             container.innerHTML = `<div class="text-rose-500 font-medium text-xs p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl">AI search failed. Try again in a moment.</div>`;
//         }
//         let cleanMsg = err.message || "Request failed";
//         try {
//             const parsed = JSON.parse(err.message);
//             if (parsed && parsed.error) {
//                 cleanMsg = parsed.error;
//             }
//         } catch (e) {
//             // Not a JSON message
//         }
//         showToast("AI search failed: " + cleanMsg, "error");
//     } finally {
//         if (btn) btn.disabled = false;
//     }
// }
//
// function renderLiveAiJobs() {
//     const container = document.getElementById("aiJobsResultsContainer");
//     if (!container) return;
//     container.innerHTML = "";
//
//     if (liveAiJobs.length === 0) {
//         container.innerHTML = `<div class="bg-white/[0.03] border border-white/10 rounded-2xl p-8 text-center text-slate-500 text-xs font-medium">No real postings found for that search. Try rephrasing or broadening it.</div>`;
//         return;
//     }
//
//     liveAiJobs.forEach((job, index) => {
//         const card = document.createElement("div");
//         card.className = "job-card bg-white/[0.03] border border-white/10 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-start justify-between gap-4";
//         card.innerHTML = `
//             <div class="space-y-1 flex-1 min-w-0">
//                 <h3 class="font-display font-bold text-base text-white leading-snug">${escapeHtml(job.jobRole || "Untitled role")}</h3>
//                 <p class="text-xs font-bold text-indigo-400">${escapeHtml(job.companyName || "Unknown company")}</p>
//                 <p class="text-xs text-slate-500 flex items-center gap-1"><i data-lucide="map-pin" class="w-3 h-3 inline"></i> ${escapeHtml(job.location || "Not specified")}</p>
//                 ${job.description ? `<p class="text-xs text-slate-400 leading-relaxed pt-1">${escapeHtml(job.description)}</p>` : ""}
//                 ${job.sourceUrl ? `<a href="${escapeHtml(job.sourceUrl)}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 text-[11px] font-bold text-purple-400 hover:text-purple-300 pt-1"><i data-lucide="external-link" class="w-3 h-3"></i> View posting</a>` : ""}
//             </div>
//             <div class="flex flex-row md:flex-col items-start md:items-end gap-4 md:gap-1 text-xs text-slate-400 font-medium shrink-0">
//                 ${job.workload ? `<div><span class="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Workload:</span> ${escapeHtml(job.workload)}</div>` : ""}
//                 ${job.salaryRange ? `<div><span class="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Salary:</span> ${escapeHtml(job.salaryRange)}</div>` : ""}
//             </div>
//             <div class="flex gap-2 border-t md:border-t-0 pt-3 md:pt-0 border-white/5 shrink-0">
//                 <button onclick="dismissLiveAiJob(${index}, this)" class="px-4 py-2 bg-white/10 hover:bg-rose-500/10 hover:text-rose-400 text-slate-200 font-bold text-xs rounded-xl transition-all">Dismiss</button>
//                 <button onclick="trackLiveAiJob(${index})" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all">Track Job</button>
//             </div>
//         `;
//         container.appendChild(card);
//     });
//
//     if (window.lucide) { window.lucide.createIcons(); }
// }
//
// function dismissLiveAiJob(index, buttonEl) {
//     buttonEl.closest(".job-card").remove();
//     showToast("Listing dismissed", "info");
// }
//
// async function trackLiveAiJob(index) {
//     const job = liveAiJobs[index];
//     if (!job) return;
//
//     const payload = {
//         jobLink: job.sourceUrl || null,
//         companyName: job.companyName || null,
//         jobRole: job.jobRole || null,
//         jobDescriptionText: job.description && job.description.trim()
//             ? job.description
//             : `${job.jobRole || "Role"} at ${job.companyName || "company"}${job.location ? " (" + job.location + ")" : ""}. Found via AI Job Search.`
//     };
//
//     try {
//         await apiRequest("/applications/quick-add", "POST", payload);
//         showToast(`Successfully tracked ${job.companyName || "this job"} on your Wishlist board!`, "success");
//         renderLiveAiJobs();
//     } catch (err) {
//         showToast("Tracking import error: " + err.message, "error");
//     }
// }
//
// function renderExternalJobsFeed() {
//     const container = document.getElementById("externalJobsFeedContainer");
//     if (!container) return;
//     container.innerHTML = "";
//
//     if (discoveredExternalJobs.length === 0) {
//         container.innerHTML = `<div class="bg-white/[0.03] border border-white/10 rounded-2xl p-8 text-center text-slate-500 text-xs font-medium">No job listings found in database matching specified filters.</div>`;
//         return;
//     }
//
//     discoveredExternalJobs.forEach(job => {
//         const card = document.createElement("div");
//         card.className = "bg-white/[0.03] border border-white/10 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4";
//         card.innerHTML = `
//             <div class="space-y-1">
//                 <h3 class="font-display font-bold text-base text-white leading-snug">${escapeHtml(job.jobRole)}</h3>
//                 <p class="text-xs font-bold text-indigo-400">${escapeHtml(job.companyName)}</p>
//                 <p class="text-xs text-slate-500 flex items-center gap-1"><i data-lucide="map-pin" class="w-3 h-3 inline"></i> ${escapeHtml(job.location || 'Remote')}</p>
//             </div>
//             <div class="flex flex-row md:flex-col items-start md:items-end gap-4 md:gap-1 text-xs text-slate-400 font-medium">
//                 <div><span class="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Workload:</span> ${job.workload || '100%'}</div>
//                 <div><span class="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Salary:</span> ${job.salaryRange || 'N/A'}</div>
//             </div>
//             <div class="flex gap-2 border-t md:border-t-0 pt-3 md:pt-0 border-white/5">
//                 <button onclick="discardJobCard(${job.id}, this)" class="px-4 py-2 bg-white/10 hover:bg-rose-500/10 hover:text-rose-400 text-slate-200 font-bold text-xs rounded-xl transition-all">Discard</button>
//                 <button onclick="convertListingToApplication(${job.id})" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all">Track Job</button>
//             </div>
//         `;
//         container.appendChild(card);
//     });
//
//     if (window.lucide) { window.lucide.createIcons(); }
// }
//
// function discardJobCard(id, buttonEl) {
//     buttonEl.closest('.bg-white').remove();
//     showToast("Listing hidden from stream window view", "info");
// }
//
// async function convertListingToApplication(id) {
//     const job = discoveredExternalJobs.find(j => j.id === id);
//     if (!job) return;
//
//     const payload = {
//         companyName: job.companyName,
//         jobRole: job.jobRole,
//         status: "WISHLIST",
//         platform: "COMPANY_WEBSITE",
//         location: job.location,
//         salaryMin: job.salaryMin || null,
//         salaryMax: job.salaryMax || null,
//         jobLink: job.jobLink || "https://example.com",
//         notes: "Imported automatically from your internal job search database system context."
//     };
//
//     try {
//         await apiRequest("/applications", "POST", payload);
//         showToast(`Successfully tracked ${job.companyName} on your Wishlist board!`, "success");
//         discoveredExternalJobs = discoveredExternalJobs.filter(j => j.id !== id);
//         renderExternalJobsFeed();
//     } catch (err) {
//         showToast("Tracking import execution error: " + err.message, "error");
//     }
// }
//
// function clearJobFilters() {
//     if(document.getElementById("jobSearchKeywords")) document.getElementById("jobSearchKeywords").value = "";
//     if(document.getElementById("jobSearchCompany")) document.getElementById("jobSearchCompany").value = "";
//     if(document.getElementById("jobSearchCountry")) document.getElementById("jobSearchCountry").value = "";
//     fetchExternalJobsFeed();
// }
//
// // ---------- Admin Portal Action Submit Rules ----------
// async function handleAdminJobSubmit(e) {
//     e.preventDefault();
//
//     const payload = {
//         jobRole: document.getElementById("adminJobRole").value,
//         companyName: document.getElementById("adminCompanyName").value,
//         location: document.getElementById("adminLocation").value,
//         workload: document.getElementById("adminWorkload").value,
//         salaryRange: document.getElementById("adminSalaryRange").value,
//         salaryMin: document.getElementById("adminSalaryMin").value ? parseInt(document.getElementById("adminSalaryMin").value) : null,
//         salaryMax: document.getElementById("adminSalaryMax").value ? parseInt(document.getElementById("adminSalaryMax").value) : null,
//         jobLink: document.getElementById("adminJobLink").value
//     };
//
//     try {
//         await apiRequest("/admin/jobs", "POST", payload);
//         showToast("New opening successfully saved directly into data index!", "success");
//         document.getElementById("adminJobForm").reset();
//         window.location.hash = "#/jobs"; // Route straight back to check results output
//     } catch (err) {
//         showToast("Action failed: " + err.message, "error");
//     }
// }
//
// // ---------- Dashboard Data Fetch & Render ----------
// async function loadApplications() {
//     try {
//         applications = await apiRequest("/applications", "GET") || [];
//         renderBoard();
//         initDragAndDrop(); // Sync drag targets with container scopes natively
//     } catch (err) {
//         console.error("Failed to load applications:", err);
//         showToast("Couldn't load applications. Try refreshing.", "error");
//     }
// }
//
// function getFilteredApplications() {
//     const searchText = document.getElementById("searchBar").value.toLowerCase().trim();
//     const filterPlatform = document.getElementById("filterPlatform").value;
//
//     return applications.filter(app => {
//         const matchesSearch = app.companyName.toLowerCase().includes(searchText) ||
//             app.jobRole.toLowerCase().includes(searchText);
//         const matchesPlatform = !filterPlatform || app.platform === filterPlatform;
//         return matchesSearch && matchesPlatform;
//     });
// }
//
// function renderBoard() {
//     const statuses = ["WISHLIST", "APPLIED", "ASSESSMENT", "INTERVIEW", "OFFER", "REJECTED", "WITHDRAWN"];
//     const emptyCopy = {
//         WISHLIST: "No wishlist roles yet.",
//         APPLIED: "No applications sent yet.",
//         ASSESSMENT: "No technical assessments yet.",
//         INTERVIEW: "No interviews scheduled yet.",
//         OFFER: "No job offers logged yet.",
//         REJECTED: "No rejection records.",
//         WITHDRAWN: "No withdrawn applications."
//     };
//
//     const filteredApps = getFilteredApplications();
//
//     statuses.forEach(status => {
//         const container = document.getElementById("cards-" + status);
//         if (!container) return;
//         container.innerHTML = "";
//
//         const columnApps = filteredApps.filter(app => app.status === status);
//         document.getElementById("count-" + status).textContent = columnApps.length;
//
//         if (columnApps.length === 0) {
//             const empty = document.createElement("div");
//             empty.className = "empty-state";
//             empty.innerHTML = `<div class="empty-icon">—</div><p>${emptyCopy[status]}</p>`;
//             container.appendChild(empty);
//             return;
//         }
//
//         columnApps.forEach(app => {
//             container.appendChild(createCard(app));
//         });
//     });
// }
//
// function createCard(app) {
//     const card = document.createElement("div");
//     card.className = "card";
//     card.draggable = true;
//     card.dataset.id = app.id;
//
//     const dateLabel = app.dateApplied
//         ? new Date(app.dateApplied).toLocaleDateString(undefined, { month: "short", day: "numeric" })
//         : "";
//
//     const salaryText = (app.salaryMin || app.salaryMax)
//         ? `&bull; $${(app.salaryMin || 0).toLocaleString()} - $${(app.salaryMax || 0).toLocaleString()}`
//         : "";
//
//     card.innerHTML = `
//         <h4>${escapeHtml(app.companyName)}</h4>
//         <p>${escapeHtml(app.jobRole)}</p>
//         <div class="card-meta-line">
//             <span class="platform-badge">${escapeHtml(app.platform.replace('_', ' '))}</span>
//             <span>${dateLabel ? 'Applied ' + dateLabel : ''} ${salaryText}</span>
//         </div>
//         <div class="card-actions">
//             <button class="editBtn">Edit</button>
//             <button class="delete deleteBtn">Delete</button>
//         </div>
//     `;
//
//     card.addEventListener("dragstart", (e) => {
//         card.classList.add("dragging", "opacity-50", "rotate-1");
//         if (e.dataTransfer) {
//             e.dataTransfer.effectAllowed = "move";
//             e.dataTransfer.setData("text/plain", String(app.id));
//         }
//     });
//     card.addEventListener("dragend", () => {
//         card.classList.remove("dragging", "opacity-50", "rotate-1");
//     });
//
//     card.querySelector(".editBtn").addEventListener("click", () => openModal(app));
//     card.querySelector(".deleteBtn").addEventListener("click", () => deleteApplication(app.id));
//
//     return card;
// }
//
// function escapeHtml(str) {
//     const div = document.createElement("div");
//     div.textContent = str || "";
//     return div.innerHTML;
// }
//
// const DROP_ZONE_HIGHLIGHT_CLASSES = ["ring-2", "ring-indigo-400", "bg-indigo-500/10"];
//
// function initDragAndDrop() {
//     document.querySelectorAll('[id^="cards-"]').forEach(container => {
//         const column = container.closest("[data-status]") || container.parentElement;
//
//         container.addEventListener("dragover", (e) => {
//             e.preventDefault();
//             if (e.dataTransfer) e.dropEffect = "move";
//             container.classList.add("drag-over");
//             if (column) column.classList.add(...DROP_ZONE_HIGHLIGHT_CLASSES);
//         });
//
//         container.addEventListener("dragleave", (e) => {
//             if (column && column.contains(e.relatedTarget)) return;
//             container.classList.remove("drag-over");
//             if (column) column.classList.remove(...DROP_ZONE_HIGHLIGHT_CLASSES);
//         });
//
//         container.addEventListener("drop", async (e) => {
//             e.preventDefault();
//             container.classList.remove("drag-over");
//             if (column) column.classList.remove(...DROP_ZONE_HIGHLIGHT_CLASSES);
//
//             const dragging = document.querySelector(".dragging");
//             if (!dragging) return;
//
//             const appId = parseInt(dragging.dataset.id, 10);
//             const newStatus = column ? column.dataset.status : null;
//             const app = applications.find(a => a.id === appId);
//
//             if (app && newStatus && app.status !== newStatus) {
//                 const previousStatus = app.status;
//                 app.status = newStatus;
//                 renderBoard(); // optimistic move for instant feedback
//
//                 try {
//                     await apiRequest(`/applications/${appId}/status`, "PATCH", { status: newStatus });
//                     showToast(`Moved ${app.companyName} to ${newStatus.toLowerCase().replace('_', ' ')}`, "success");
//                 } catch (err) {
//                     app.status = previousStatus;
//                     renderBoard();
//                     showToast("Couldn't move application. " + err.message, "error");
//                 }
//             }
//         });
//     });
// }
//
// // ---------- Modal Management ----------
// const modalOverlay = document.getElementById("modalOverlay");
// const appForm = document.getElementById("appForm");
//
// document.getElementById("addBtn").addEventListener("click", () => openModal(null));
// document.getElementById("cancelBtn").addEventListener("click", closeModal);
//
// function openModal(app) {
//     document.getElementById("modalTitle").textContent = app ? "Edit Application" : "Add Application";
//     document.getElementById("appId").value = app ? app.id : "";
//     document.getElementById("companyName").value = app ? app.companyName : "";
//     document.getElementById("jobRole").value = app ? app.jobRole : "";
//     document.getElementById("status").value = app ? app.status : "APPLIED";
//     document.getElementById("platform").value = app ? app.platform : "LINKEDIN";
//     document.getElementById("dateApplied").value = app ? app.dateApplied : "";
//     document.getElementById("location").value = app ? app.location || "" : "";
//     document.getElementById("salaryMin").value = app ? app.salaryMin || "" : "";
//     document.getElementById("salaryMax").value = app ? app.salaryMax || "" : "";
//     document.getElementById("jobLink").value = app ? app.jobLink || "" : "";
//     document.getElementById("notes").value = app ? app.notes || "" : "";
//
//     modalOverlay.classList.add("active");
// }
//
// function closeModal() {
//     modalOverlay.classList.remove("active");
//     appForm.reset();
// }
//
// appForm.addEventListener("submit", async (e) => {
//     e.preventDefault();
//     const id = document.getElementById("appId").value;
//     const salaryMinVal = document.getElementById("salaryMin").value;
//     const salaryMaxVal = document.getElementById("salaryMax").value;
//
//     const payload = {
//         companyName: document.getElementById("companyName").value,
//         jobRole: document.getElementById("jobRole").value,
//         status: document.getElementById("status").value,
//         platform: document.getElementById("platform").value,
//         dateApplied: document.getElementById("dateApplied").value || null,
//         location: document.getElementById("location").value || null,
//         salaryMin: salaryMinVal ? parseInt(salaryMinVal) : null,
//         salaryMax: salaryMaxVal ? parseInt(salaryMaxVal) : null,
//         jobLink: document.getElementById("jobLink").value || null,
//         notes: document.getElementById("notes").value || null
//     };
//
//     const submitBtn = appForm.querySelector('button[type="submit"]');
//     submitBtn.disabled = true;
//
//     try {
//         if (id) {
//             await apiRequest(`/applications/${id}`, "PUT", payload);
//             showToast("Application details updated", "success");
//         } else {
//             await apiRequest("/applications", "POST", payload);
//             showToast("Job application registered", "success");
//         }
//         closeModal();
//         loadApplications();
//     } catch (err) {
//         showToast("Error saving application: " + err.message, "error");
//     } finally {
//         submitBtn.disabled = false;
//     }
// });
//
// async function deleteApplication(id) {
//     const app = applications.find(a => a.id === id);
//     const confirmed = await showConfirm(`Delete the application for ${app ? app.companyName : "this company"}?`);
//     if (!confirmed) return;
//     try {
//         await apiRequest(`/applications/${id}`, "DELETE");
//         showToast("Application deleted", "info");
//         loadApplications();
//     } catch (err) {
//         showToast("Failed to delete application: " + err.message, "error");
//     }
// }
//
// // ---------- Quick Add "Save Job" Modal ----------
// const quickAddOverlay = document.getElementById("quickAddModalOverlay");
// const quickAddForm = document.getElementById("quickAddForm");
//
// document.getElementById("quickAddBtn").addEventListener("click", openQuickAddModal);
// document.getElementById("qaCancel").addEventListener("click", closeQuickAddModal);
//
// // Character counter for the job description textarea
// document.getElementById("qaJobDescription").addEventListener("input", function () {
//     document.getElementById("qaCharCount").textContent = this.value.length.toLocaleString() + " chars";
// });
//
// function openQuickAddModal() {
//     quickAddForm.reset();
//     document.getElementById("qaCharCount").textContent = "0 chars";
//     quickAddOverlay.classList.add("active");
// }
//
// function closeQuickAddModal() {
//     quickAddOverlay.classList.remove("active");
//     quickAddForm.reset();
//     document.getElementById("qaCharCount").textContent = "0 chars";
// }
//
// // Close on overlay background click
// quickAddOverlay.addEventListener("click", function (e) {
//     if (e.target === quickAddOverlay) closeQuickAddModal();
// });
//
// quickAddForm.addEventListener("submit", async (e) => {
//     e.preventDefault();
//
//     const jobDesc = document.getElementById("qaJobDescription").value.trim();
//     if (!jobDesc) {
//         showToast("Please paste the job description text.", "error");
//         return;
//     }
//
//     const payload = {
//         jobLink: document.getElementById("qaJobLink").value || null,
//         companyName: document.getElementById("qaCompanyName").value || null,
//         jobRole: document.getElementById("qaJobRole").value || null,
//         jobDescriptionText: jobDesc
//     };
//
//     const submitBtn = quickAddForm.querySelector('button[type="submit"]');
//     submitBtn.disabled = true;
//
//     try {
//         const created = await apiRequest("/applications/quick-add", "POST", payload);
//         const name = created.companyName !== "Unknown" ? created.companyName : "Job";
//         showToast(`${name} saved to Wishlist!`, "success");
//         closeQuickAddModal();
//         loadApplications();
//     } catch (err) {
//         showToast("Error saving job: " + err.message, "error");
//     } finally {
//         submitBtn.disabled = false;
//     }
// });
//
// function initMobileInteractions() {
//     const menuBtn = document.getElementById("mobileMenuBtn");
//     const sidebar = document.getElementById("sidebar");
//     if (menuBtn && sidebar) {
//         menuBtn.onclick = (e) => { e.stopPropagation(); sidebar.classList.toggle("active"); };
//         document.body.onclick = () => { sidebar.classList.remove("active"); };
//         sidebar.onclick = (e) => { e.stopPropagation(); };
//     }
// }
//
// function initApp() {
//     initUserProfile();
//     window.addEventListener("hashchange", handleRoute);
//
//     const searchBar = document.getElementById("searchBar");
//     const filterPlatform = document.getElementById("filterPlatform");
//     if (searchBar) searchBar.addEventListener("input", renderBoard);
//     if (filterPlatform) filterPlatform.addEventListener("change", renderBoard);
//
//     // Let Enter key trigger AI Job Search from the input field
//     const aiLiveJobSearchInput = document.getElementById("aiLiveJobSearchInput");
//     if (aiLiveJobSearchInput) {
//         aiLiveJobSearchInput.addEventListener("keydown", (e) => {
//             if (e.key === "Enter") {
//                 e.preventDefault();
//                 runLiveAiJobSearch();
//             }
//         });
//     }
//
//     initDragAndDrop();
//     initMobileInteractions();
//     handleRoute();
//     if (window.lucide) { window.lucide.createIcons(); }
// }
//
// document.addEventListener("DOMContentLoaded", initApp);
// document.getElementById("logoutBtn").addEventListener("click", () => {
//     clearToken();
//     window.location.href = "/login.html";
// });
//
// // ---------- Collapsible Kanban Staging Board Columns ----------
// /**
//  * Toggles the collapsed/expanded UI state of terminal pipeline archive columns.
//  * Shifts target layout spacing and handles structural element typography transitions.
//  * @param {string} status - Pipeline status matching the targeted column container markup block.
//  */
// function toggleColumn(status) {
//     const column = document.getElementById(`col-${status}`);
//     if (!column) return;
//
//     column.classList.toggle('collapsed');
//
//     // Explicit runtime hook to dynamically update arrow orientation vectors
//     if (window.lucide) {
//         window.lucide.createIcons();
//     }
// }


let applications = [];
let discoveredExternalJobs = []; // Search engine feed array cache
let showArchivedPoolGlobal = false; // Toggle tracker state for hidden archive metrics

// Redirect immediately if not logged in
if (!getToken()) {
    window.location.href = "/login.html";
}

// Parse JWT token to display user email in sidebar and check role permissions
function initUserProfile() {
    let displayName = sessionStorage.getItem("user_name") || sessionStorage.getItem("user_email");

    const token = getToken();
    if (token) {
        try {
            const payloadBase64 = token.split('.')[1];
            const decodedPayload = JSON.parse(atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/')));
            displayName = displayName || decodedPayload.sub;

            // Check if user contains administrative rights within claims payload
            const roles = decodedPayload.roles || decodedPayload.authorities || [];
            if (roles.includes("ROLE_ADMIN") || roles.includes("ADMIN")) {
                document.getElementById("adminSidebarLink")?.classList.remove("hidden");
            }
        } catch (e) {
            console.error("Error decoding JWT payload claims:", e);
        }
    }

    if (displayName) {
        document.getElementById("userName").textContent = displayName;
        document.getElementById("userAvatar").textContent = displayName.charAt(0).toUpperCase();
    }
}

// ---------- Client-Side SPA Router (Fixed Page Transitions) ----------
function handleRoute() {
    const route = window.location.hash || "#/dashboard";

    // 1. Completely clear out previous active classes from all links & views
    document.querySelectorAll(".nav-item").forEach(item => item.classList.remove("active"));
    document.querySelectorAll(".view-container").forEach(view => view.classList.remove("active"));

    // Close mobile menu sidebar drawer overlay context
    const sidebar = document.getElementById("sidebar");
    if (sidebar) sidebar.classList.remove("active");

    // 2. Direct route processing mapping tree
    if (route.startsWith("#/dashboard")) {
        activateView("dashboard");
        loadApplications();
    } else if (route.startsWith("#/jobs")) {
        activateView("jobs");
        fetchExternalJobsFeed();
    } else if (route.startsWith("#/ai-jobs")) {
        activateView("ai-jobs");
    } else if (route.startsWith("#/analytics")) {
        activateView("analytics");
        if (typeof loadAnalytics === "function") { loadAnalytics(); }
    } else if (route.startsWith("#/documents")) {
        activateView("documents");
        if (typeof initDocumentUpload === "function") { initDocumentUpload(); }
        if (typeof loadDocumentsView === "function") { loadDocumentsView(); }
    } else if (route.startsWith("#/resume-builder")) {
        activateView("resume-builder");
        if (typeof loadResumeBuilderView === "function") { loadResumeBuilderView(); }
    } else if (route.startsWith("#/cover-letter")) {
        activateView("cover-letter");
        if (typeof loadCoverLetterBuilderView === "function") { loadCoverLetterBuilderView(); }
    } else if (route.startsWith("#/calendar")) {
        activateView("calendar");
        if (typeof loadCalendarView === "function") { loadCalendarView(); }
    } else if (route.startsWith("#/settings")) {
        activateView("settings");
        if (typeof loadSettingsView === "function") { loadSettingsView(); }
    } else if (route.startsWith("#/admin")) {
        activateView("admin");
    } else {
        window.location.hash = "#/dashboard";
    }
}

function activateView(viewName) {
    const link = document.querySelector(`.nav-item[data-view="${viewName}"]`);
    if (link) link.classList.add("active");

    const viewContainer = document.getElementById(`${viewName}-view`);
    if (viewContainer) {
        viewContainer.classList.add("active");
    }
}

// ---------- Job Search Engine Logic (Database Context-Backed) ----------
async function fetchExternalJobsFeed() {
    const container = document.getElementById("externalJobsFeedContainer");
    if (!container) return;
    container.innerHTML = `<div class="text-slate-500 font-medium text-xs p-4 animate-pulse">Querying internal vacancy indices...</div>`;

    const queryParams = new URLSearchParams({
        keywords: document.getElementById("jobSearchKeywords")?.value || "",
        company: document.getElementById("jobSearchCompany")?.value || "",
        country: document.getElementById("jobSearchCountry")?.value || ""
    });

    try {
        discoveredExternalJobs = await apiRequest(`/applications/external-search?${queryParams.toString()}`, "GET") || [];
        renderExternalJobsFeed();
    } catch (err) {
        console.error("Feed recovery sequence issue:", err);
        container.innerHTML = `<div class="text-rose-500 font-medium text-xs p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl">Could not retrieve available database listings.</div>`;
    }
}

// ---------- AI Job Search (Gemini + Google Search grounding — live web results) ----------
let liveAiJobs = []; // Cache of the last live search results (not DB rows)

async function runLiveAiJobSearch() {
    const input = document.getElementById("aiLiveJobSearchInput");
    const query = input ? input.value.trim() : "";

    if (!query) {
        showToast("Describe the job you're looking for first.", "error");
        return;
    }

    const container = document.getElementById("aiJobsResultsContainer");
    const btn = document.getElementById("aiLiveJobSearchBtn");
    if (btn) btn.disabled = true;
    if (container) {
        container.innerHTML = `<div class="text-slate-500 font-medium text-xs p-4 animate-pulse">Searching the live web for real job postings...</div>`;
    }

    try {
        const response = await apiRequest(`/applications/live-search?query=${encodeURIComponent(query)}`, "GET");
        liveAiJobs = Array.isArray(response) ? response : [];
        renderLiveAiJobs();
    } catch (err) {
        console.error("Live AI job search issue:", err);
        if (container) {
            container.innerHTML = `<div class="text-rose-500 font-medium text-xs p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl">AI search failed. Try again in a moment.</div>`;
        }
        let cleanMsg = err.message || "Request failed";
        try {
            const parsed = JSON.parse(err.message);
            if (parsed && parsed.error) {
                cleanMsg = parsed.error;
            }
        } catch (e) {
            // Not a JSON message
        }
        showToast("AI search failed: " + cleanMsg, "error");
    } finally {
        if (btn) btn.disabled = false;
    }
}

function renderLiveAiJobs() {
    const container = document.getElementById("aiJobsResultsContainer");
    if (!container) return;
    container.innerHTML = "";

    if (liveAiJobs.length === 0) {
        container.innerHTML = `<div class="bg-white/[0.03] border border-white/10 rounded-2xl p-8 text-center text-slate-500 text-xs font-medium">No real postings found for that search. Try rephrasing or broadening it.</div>`;
        return;
    }

    liveAiJobs.forEach((job, index) => {
        const card = document.createElement("div");
        card.className = "job-card bg-white/[0.03] border border-white/10 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-start justify-between gap-4";
        card.innerHTML = `
            <div class="space-y-1 flex-1 min-w-0">
                <h3 class="font-display font-bold text-base text-white leading-snug">${escapeHtml(job.jobRole || "Untitled role")}</h3>
                <p class="text-xs font-bold text-indigo-400">${escapeHtml(job.companyName || "Unknown company")}</p>
                <p class="text-xs text-slate-500 flex items-center gap-1"><i data-lucide="map-pin" class="w-3 h-3 inline"></i> ${escapeHtml(job.location || "Not specified")}</p>
                ${job.description ? `<p class="text-xs text-slate-400 leading-relaxed pt-1">${escapeHtml(job.description)}</p>` : ""}
                ${job.sourceUrl ? `<a href="${escapeHtml(job.sourceUrl)}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 text-[11px] font-bold text-purple-400 hover:text-purple-300 pt-1"><i data-lucide="external-link" class="w-3 h-3"></i> View posting</a>` : ""}
            </div>
            <div class="flex flex-row md:flex-col items-start md:items-end gap-4 md:gap-1 text-xs text-slate-400 font-medium shrink-0">
                ${job.workload ? `<div><span class="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Workload:</span> ${escapeHtml(job.workload)}</div>` : ""}
                ${job.salaryRange ? `<div><span class="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Salary:</span> ${escapeHtml(job.salaryRange)}</div>` : ""}
            </div>
            <div class="flex gap-2 border-t md:border-t-0 pt-3 md:pt-0 border-white/5 shrink-0">
                <button onclick="dismissLiveAiJob(${index}, this)" class="px-4 py-2 bg-white/10 hover:bg-rose-500/10 hover:text-rose-400 text-slate-200 font-bold text-xs rounded-xl transition-all">Dismiss</button>
                <button onclick="trackLiveAiJob(${index})" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all">Track Job</button>
            </div>
        `;
        container.appendChild(card);
    });

    if (window.lucide) { window.lucide.createIcons(); }
}

function dismissLiveAiJob(index, buttonEl) {
    buttonEl.closest(".job-card").remove();
    showToast("Listing dismissed", "info");
}

async function trackLiveAiJob(index) {
    const job = liveAiJobs[index];
    if (!job) return;

    const payload = {
        jobLink: job.sourceUrl || null,
        companyName: job.companyName || null,
        jobRole: job.jobRole || null,
        jobDescriptionText: job.description && job.description.trim()
            ? job.description
            : `${job.jobRole || "Role"} at ${job.companyName || "company"}${job.location ? " (" + job.location + ")" : ""}. Found via AI Job Search.`
    };

    try {
        await apiRequest("/applications/quick-add", "POST", payload);
        showToast(`Successfully tracked ${job.companyName || "this job"} on your Wishlist board!`, "success");
        renderLiveAiJobs();
    } catch (err) {
        showToast("Tracking import error: " + err.message, "error");
    }
}

function renderExternalJobsFeed() {
    const container = document.getElementById("externalJobsFeedContainer");
    if (!container) return;
    container.innerHTML = "";

    if (discoveredExternalJobs.length === 0) {
        container.innerHTML = `<div class="bg-white/[0.03] border border-white/10 rounded-2xl p-8 text-center text-slate-500 text-xs font-medium">No job listings found in database matching specified filters.</div>`;
        return;
    }

    discoveredExternalJobs.forEach(job => {
        const card = document.createElement("div");
        card.className = "bg-white/[0.03] border border-white/10 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4";
        card.innerHTML = `
            <div class="space-y-1">
                <h3 class="font-display font-bold text-base text-white leading-snug">${escapeHtml(job.jobRole)}</h3>
                <p class="text-xs font-bold text-indigo-400">${escapeHtml(job.companyName)}</p>
                <p class="text-xs text-slate-500 flex items-center gap-1"><i data-lucide="map-pin" class="w-3 h-3 inline"></i> ${escapeHtml(job.location || 'Remote')}</p>
            </div>
            <div class="flex flex-row md:flex-col items-start md:items-end gap-4 md:gap-1 text-xs text-slate-400 font-medium">
                <div><span class="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Workload:</span> ${job.workload || '100%'}</div>
                <div><span class="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Salary:</span> ${job.salaryRange || 'N/A'}</div>
            </div>
            <div class="flex gap-2 border-t md:border-t-0 pt-3 md:pt-0 border-white/5">
                <button onclick="discardJobCard(${job.id}, this)" class="px-4 py-2 bg-white/10 hover:bg-rose-500/10 hover:text-rose-400 text-slate-200 font-bold text-xs rounded-xl transition-all">Discard</button>
                <button onclick="convertListingToApplication(${job.id})" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all">Track Job</button>
            </div>
        `;
        container.appendChild(card);
    });

    if (window.lucide) { window.lucide.createIcons(); }
}

function discardJobCard(id, buttonEl) {
    buttonEl.closest('.bg-white').remove();
    showToast("Listing hidden from stream window view", "info");
}

async function convertListingToApplication(id) {
    const job = discoveredExternalJobs.find(j => j.id === id);
    if (!job) return;

    const payload = {
        companyName: job.companyName,
        jobRole: job.jobRole,
        status: "WISHLIST",
        platform: "COMPANY_WEBSITE",
        location: job.location,
        salaryMin: job.salaryMin || null,
        salaryMax: job.salaryMax || null,
        jobLink: job.jobLink || "https://example.com",
        notes: "Imported automatically from your internal job search database system context."
    };

    try {
        await apiRequest("/applications", "POST", payload);
        showToast(`Successfully tracked ${job.companyName} on your Wishlist board!`, "success");
        discoveredExternalJobs = discoveredExternalJobs.filter(j => j.id !== id);
        renderExternalJobsFeed();
    } catch (err) {
        showToast("Tracking import execution error: " + err.message, "error");
    }
}

function clearJobFilters() {
    if(document.getElementById("jobSearchKeywords")) document.getElementById("jobSearchKeywords").value = "";
    if(document.getElementById("jobSearchCompany")) document.getElementById("jobSearchCompany").value = "";
    if(document.getElementById("jobSearchCountry")) document.getElementById("jobSearchCountry").value = "";
    fetchExternalJobsFeed();
}

// ---------- Admin Portal Action Submit Rules ----------
async function handleAdminJobSubmit(e) {
    e.preventDefault();

    const payload = {
        jobRole: document.getElementById("adminJobRole").value,
        companyName: document.getElementById("adminCompanyName").value,
        location: document.getElementById("adminLocation").value,
        workload: document.getElementById("adminWorkload").value,
        salaryRange: document.getElementById("adminSalaryRange").value,
        salaryMin: document.getElementById("adminSalaryMin").value ? parseInt(document.getElementById("adminSalaryMin").value) : null,
        salaryMax: document.getElementById("adminSalaryMax").value ? parseInt(document.getElementById("adminSalaryMax").value) : null,
        jobLink: document.getElementById("adminJobLink").value
    };

    try {
        await apiRequest("/admin/jobs", "POST", payload);
        showToast("New opening successfully saved directly into data index!", "success");
        document.getElementById("adminJobForm").reset();
        window.location.hash = "#/jobs"; // Route straight back to check results output
    } catch (err) {
        showToast("Action failed: " + err.message, "error");
    }
}

// ---------- Dashboard Data Fetch & Render ----------
async function loadApplications() {
    try {
        applications = await apiRequest("/applications", "GET") || [];
        renderBoard();
        initDragAndDrop(); // Sync drag targets with container scopes natively
    } catch (err) {
        console.error("Failed to load applications:", err);
        showToast("Couldn't load applications. Try refreshing.", "error");
    }
}

function getFilteredApplications() {
    const searchText = document.getElementById("searchBar").value.toLowerCase().trim();
    const filterPlatform = document.getElementById("filterPlatform").value;

    return applications.filter(app => {
        const matchesSearch = app.companyName.toLowerCase().includes(searchText) ||
            app.jobRole.toLowerCase().includes(searchText);
        const matchesPlatform = !filterPlatform || app.platform === filterPlatform;
        return matchesSearch && matchesPlatform;
    });
}

function renderBoard() {
    const statuses = ["WISHLIST", "APPLIED", "ASSESSMENT", "INTERVIEW", "OFFER", "REJECTED", "WITHDRAWN"];
    const emptyCopy = {
        WISHLIST: "No wishlist roles yet.",
        APPLIED: "No applications sent yet.",
        ASSESSMENT: "No technical assessments yet.",
        INTERVIEW: "No interviews scheduled yet.",
        OFFER: "No job offers logged yet.",
        REJECTED: "No rejection records.",
        WITHDRAWN: "No withdrawn applications."
    };

    const filteredApps = getFilteredApplications();

    statuses.forEach(status => {
        const container = document.getElementById("cards-" + status);
        if (!container) return;
        container.innerHTML = "";

        const columnApps = filteredApps.filter(app => app.status === status);
        document.getElementById("count-" + status).textContent = columnApps.length;

        if (columnApps.length === 0) {
            const empty = document.createElement("div");
            empty.className = "empty-state";
            empty.innerHTML = `<div class="empty-icon">—</div><p>${emptyCopy[status]}</p>`;
            container.appendChild(empty);
            return;
        }

        columnApps.forEach(app => {
            container.appendChild(createCard(app));
        });
    });
}

function createCard(app) {
    const card = document.createElement("div");
    card.className = "card";
    card.draggable = true;
    card.dataset.id = app.id;

    const dateLabel = app.dateApplied
        ? new Date(app.dateApplied).toLocaleDateString(undefined, { month: "short", day: "numeric" })
        : "";

    const salaryText = (app.salaryMin || app.salaryMax)
        ? `&bull; $${(app.salaryMin || 0).toLocaleString()} - $${(app.salaryMax || 0).toLocaleString()}`
        : "";

    card.innerHTML = `
        <h4>${escapeHtml(app.companyName)}</h4>
        <p>${escapeHtml(app.jobRole)}</p>
        <div class="card-meta-line">
            <span class="platform-badge">${escapeHtml(app.platform.replace('_', ' '))}</span>
            <span>${dateLabel ? 'Applied ' + dateLabel : ''} ${salaryText}</span>
        </div>
        <div class="card-actions">
            <button class="editBtn">Edit</button>
            <button class="delete deleteBtn">Delete</button>
        </div>
    `;

    card.addEventListener("dragstart", (e) => {
        card.classList.add("dragging", "opacity-50", "rotate-1");
        if (e.dataTransfer) {
            e.dataTransfer.effectAllowed = "move";
            e.dataTransfer.setData("text/plain", String(app.id));
        }
    });
    card.addEventListener("dragstart", (e) => {
        card.classList.add("dragging", "opacity-50", "rotate-1");
        if (e.dataTransfer) {
            e.dataTransfer.effectAllowed = "move";
            e.dataTransfer.setData("text/plain", String(app.id));
        }
    });
    card.addEventListener("dragend", () => {
        card.classList.remove("dragging", "opacity-50", "rotate-1");
    });

    card.querySelector(".editBtn").addEventListener("click", () => openModal(app));
    card.querySelector(".deleteBtn").addEventListener("click", () => deleteApplication(app.id));

    return card;
}

function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str || "";
    return div.innerHTML;
}

const DROP_ZONE_HIGHLIGHT_CLASSES = ["ring-2", "ring-indigo-400", "bg-indigo-500/10"];

function initDragAndDrop() {
    document.querySelectorAll('[id^="cards-"]').forEach(container => {
        const column = container.closest("[data-status]") || container.parentElement;

        container.addEventListener("dragover", (e) => {
            e.preventDefault();
            if (e.dataTransfer) e.dropEffect = "move";
            container.classList.add("drag-over");
            if (column) column.classList.add(...DROP_ZONE_HIGHLIGHT_CLASSES);
        });

        container.addEventListener("dragleave", (e) => {
            if (column && column.contains(e.relatedTarget)) return;
            container.classList.remove("drag-over");
            if (column) column.classList.remove(...DROP_ZONE_HIGHLIGHT_CLASSES);
        });

        container.addEventListener("drop", async (e) => {
            e.preventDefault();
            container.classList.remove("drag-over");
            if (column) column.classList.remove(...DROP_ZONE_HIGHLIGHT_CLASSES);

            const dragging = document.querySelector(".dragging");
            if (!dragging) return;

            const appId = parseInt(dragging.dataset.id, 10);
            const newStatus = column ? column.dataset.status : null;
            const app = applications.find(a => a.id === appId);

            if (app && newStatus && app.status !== newStatus) {
                const previousStatus = app.status;
                app.status = newStatus;
                renderBoard(); // optimistic move for instant feedback

                try {
                    await apiRequest(`/applications/${appId}/status`, "PATCH", { status: newStatus });
                    showToast(`Moved ${app.companyName} to ${newStatus.toLowerCase().replace('_', ' ')}`, "success");
                } catch (err) {
                    app.status = previousStatus;
                    renderBoard();
                    showToast("Couldn't move application. " + err.message, "error");
                }
            }
        });
    });
}

// ---------- Modal Management ----------
const modalOverlay = document.getElementById("modalOverlay");
const appForm = document.getElementById("appForm");

document.getElementById("addBtn").addEventListener("click", () => openModal(null));
document.getElementById("cancelBtn").addEventListener("click", closeModal);

function openModal(app) {
    document.getElementById("modalTitle").textContent = app ? "Edit Application" : "Add Application";
    document.getElementById("appId").value = app ? app.id : "";
    document.getElementById("companyName").value = app ? app.companyName : "";
    document.getElementById("jobRole").value = app ? app.jobRole : "";
    document.getElementById("status").value = app ? app.status : "APPLIED";
    document.getElementById("platform").value = app ? app.platform : "LINKEDIN";
    document.getElementById("dateApplied").value = app ? app.dateApplied : "";
    document.getElementById("location").value = app ? app.location || "" : "";
    document.getElementById("salaryMin").value = app ? app.salaryMin || "" : "";
    document.getElementById("salaryMax").value = app ? app.salaryMax || "" : "";
    document.getElementById("jobLink").value = app ? app.jobLink || "" : "";
    document.getElementById("notes").value = app ? app.notes || "" : "";

    modalOverlay.classList.add("active");
}

function closeModal() {
    modalOverlay.classList.remove("active");
    appForm.reset();
}

appForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = document.getElementById("appId").value;
    const salaryMinVal = document.getElementById("salaryMin").value;
    const salaryMaxVal = document.getElementById("salaryMax").value;

    const payload = {
        companyName: document.getElementById("companyName").value,
        jobRole: document.getElementById("jobRole").value,
        status: document.getElementById("status").value,
        platform: document.getElementById("platform").value,
        dateApplied: document.getElementById("dateApplied").value || null,
        location: document.getElementById("location").value || null,
        salaryMin: salaryMinVal ? parseInt(salaryMinVal) : null,
        salaryMax: salaryMaxVal ? parseInt(salaryMaxVal) : null,
        jobLink: document.getElementById("jobLink").value || null,
        notes: document.getElementById("notes").value || null
    };

    const submitBtn = appForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;

    try {
        if (id) {
            await apiRequest(`/applications/${id}`, "PUT", payload);
            showToast("Application details updated", "success");
        } else {
            await apiRequest("/applications", "POST", payload);
            showToast("Job application registered", "success");
        }
        closeModal();
        loadApplications();
    } catch (err) {
        showToast("Error saving application: " + err.message, "error");
    } finally {
        submitBtn.disabled = false;
    }
});

async function deleteApplication(id) {
    const app = applications.find(a => a.id === id);
    const confirmed = await showConfirm(`Delete the application for ${app ? app.companyName : "this company"}?`);
    if (!confirmed) return;
    try {
        await apiRequest(`/applications/${id}`, "DELETE");
        showToast("Application deleted", "info");
        loadApplications();
    } catch (err) {
        showToast("Failed to delete application: " + err.message, "error");
    }
}

// ---------- Quick Add "Save Job" Modal ----------
const quickAddOverlay = document.getElementById("quickAddModalOverlay");
const quickAddForm = document.getElementById("quickAddForm");

document.getElementById("quickAddBtn").addEventListener("click", openQuickAddModal);
document.getElementById("qaCancel").addEventListener("click", closeQuickAddModal);

// Character counter for the job description textarea
document.getElementById("qaJobDescription").addEventListener("input", function () {
    document.getElementById("qaCharCount").textContent = this.value.length.toLocaleString() + " chars";
});

function openQuickAddModal() {
    quickAddForm.reset();
    document.getElementById("qaCharCount").textContent = "0 chars";
    quickAddOverlay.classList.add("active");
}

function closeQuickAddModal() {
    quickAddOverlay.classList.remove("active");
    quickAddForm.reset();
    document.getElementById("qaCharCount").textContent = "0 chars";
}

// Close on overlay background click
quickAddOverlay.addEventListener("click", function (e) {
    if (e.target === quickAddOverlay) closeQuickAddModal();
});

quickAddForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const jobDesc = document.getElementById("qaJobDescription").value.trim();
    if (!jobDesc) {
        showToast("Please paste the job description text.", "error");
        return;
    }

    const payload = {
        jobLink: document.getElementById("qaJobLink").value || null,
        companyName: document.getElementById("qaCompanyName").value || null,
        jobRole: document.getElementById("qaJobRole").value || null,
        jobDescriptionText: jobDesc
    };

    const submitBtn = quickAddForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;

    try {
        const created = await apiRequest("/applications/quick-add", "POST", payload);
        const name = created.companyName !== "Unknown" ? created.companyName : "Job";
        showToast(`${name} saved to Wishlist!`, "success");
        closeQuickAddModal();
        loadApplications();
    } catch (err) {
        showToast("Error saving job: " + err.message, "error");
    } finally {
        submitBtn.disabled = false;
    }
});

function initMobileInteractions() {
    const menuBtn = document.getElementById("mobileMenuBtn");
    const sidebar = document.getElementById("sidebar");
    if (menuBtn && sidebar) {
        menuBtn.onclick = (e) => { e.stopPropagation(); sidebar.classList.toggle("active"); };
        document.body.onclick = () => { sidebar.classList.remove("active"); };
        sidebar.onclick = (e) => { e.stopPropagation(); };
    }
}

function initApp() {
    initUserProfile();
    window.addEventListener("hashchange", handleRoute);

    const searchBar = document.getElementById("searchBar");
    const filterPlatform = document.getElementById("filterPlatform");
    if (searchBar) searchBar.addEventListener("input", renderBoard);
    if (filterPlatform) filterPlatform.addEventListener("change", renderBoard);

    // Let Enter key trigger AI Job Search from the input field
    const aiLiveJobSearchInput = document.getElementById("aiLiveJobSearchInput");
    if (aiLiveJobSearchInput) {
        aiLiveJobSearchInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                runLiveAiJobSearch();
            }
        });
    }

    initDragAndDrop();
    initMobileInteractions();
    handleRoute();
    if (window.lucide) { window.lucide.createIcons(); }
}

document.addEventListener("DOMContentLoaded", initApp);
document.getElementById("logoutBtn").addEventListener("click", () => {
    clearToken();
    window.location.href = "/login.html";
});

// ---------- Horizontal Scroll Engine Navigation Controls ----------
/**
 * Triggers hardware-accelerated horizontal track movement across the main columns workflow.
 * @param {string} direction - Target transition offset orientation ('left' or 'right').
 */
function scrollBoard(direction) {
    const board = document.getElementById("board");
    if (!board) return;
    const scrollAmount = 320;
    if (direction === 'left') {
        board.scrollLeft -= scrollAmount;
    } else {
        board.scrollLeft += scrollAmount;
    }
}

/**
 * Programmatically alters visibility configurations hiding or rendering terminal storage vectors.
 */
function toggleArchiveView() {
    showArchivedPoolGlobal = !showArchivedPoolGlobal;
    const archiveBtnText = document.getElementById("archiveToggleText");
    const columns = document.querySelectorAll(".archive-column");

    columns.forEach(col => {
        if (showArchivedPoolGlobal) {
            col.classList.remove("hidden");
        } else {
            col.classList.add("hidden");
        }
    });

    if (archiveBtnText) {
        archiveBtnText.textContent = showArchivedPoolGlobal ? "Hide Archive Pool" : "Show Archive Pool";
    }

    // Auto-scroll track directly onto archive elements when activated
    if (showArchivedPoolGlobal) {
        setTimeout(() => {
            const board = document.getElementById("board");
            if (board) board.scrollLeft = board.scrollWidth;
        }, 150);
    }
}