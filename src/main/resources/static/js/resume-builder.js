// // ---------------------------------------------------------------
// // Resume Builder view logic.
// // Confirmed against real backend code:
// //   ResumeController      -> /api/resumes  (CRUD, /duplicate, /toggle-bullet/{bulletId}, /match-score)
// //   WorkExperienceController -> /api/work-experiences (CRUD)
// //   ResumeRequestDto       { title }
// //   ResumeSummaryDto       { id, title, createdAt, updatedAt }
// //   ResumeResponseDto      { id, title, createdAt, updatedAt, workExperiences[], skills[], education[] }
// //     WorkExperienceDto    { id, companyName, jobTitle, startDate, endDate, location, selectedBullets[] }
// //     BulletDto            { id, content, displayOrder }
// //   WorkExperienceRequestDto { companyName, jobTitle, startDate, endDate, location }
// //   WorkExperienceResponseDto { id, companyName, jobTitle, startDate, endDate, location, bullets[] }
// //   BulletResponseDto      { id, content, displayOrder }
// //   MatchScoreRequestDto   { jobDescriptionText }
// //   MatchScoreResponseDto  { score, matchedKeywords, missingKeywords }
// //
// // NOT confirmed against real backend code (no BulletController.java received yet):
// //   POST   /bullets                       { workExperienceId, content }
// //   PUT    /bullets/{id}                  { workExperienceId, content, displayOrder }
// //   DELETE /bullets/{id}
// //   POST   /bullets/{id}/improve          { jobDescription } -> { suggestions: [...] }
// // These match what your earlier session verified worked for BulletAiService, but if any
// // of the four above 404s or shape-mismatches, send BulletController.java and I'll fix it
// // in one pass instead of guessing again.
// //
// // Note: apiRequest() in api.js already targets http://localhost:8080/api — every endpoint
// // string below must start with "/xyz", NOT "/api/xyz".
//
// let rbInitialized = false;
// let rbWorkExperiences = [];       // content bank, each with nested .bullets[]
// let rbCurrentResumeId = null;     // currently selected resume version
// let rbSelectedBulletIds = new Set();
// let rbAiActiveBullet = null;      // { id, workExperienceId, displayOrder }
//
// function rbNotify(msg, type) {
//     if (typeof showToast === "function") {
//         showToast(msg, type || "info");
//     } else {
//         console.log("[" + (type || "info") + "]", msg);
//     }
// }
//
// function rbEscapeHtml(str) {
//     const div = document.createElement("div");
//     div.textContent = str || "";
//     return div.innerHTML;
// }
//
// function rbFormatDateRange(start, end) {
//     const s = start ? String(start).substring(0, 7) : "?";
//     const e = end ? String(end).substring(0, 7) : "Present";
//     return `${s} – ${e}`;
// }
//
// // ---------------------------------------------------------------
// // PUBLIC ENTRY POINT — called by the router every time #/resume-builder loads
// // ---------------------------------------------------------------
// function loadResumeBuilderView() {
//     if (!rbInitialized) {
//         rbWireStaticElements();
//         rbInitialized = true;
//     }
//     rbLoadWorkExperiences();
//     rbLoadResumes();
//     rbLoadSkills();
//     rbLoadEducation();
// }
//
// // ---------------------------------------------------------------
// // WORK EXPERIENCE + BULLET CONTENT BANK
// // ---------------------------------------------------------------
// async function rbLoadWorkExperiences() {
//     const list = document.getElementById("workExpList");
//     if (!list) return;
//     try {
//         rbWorkExperiences = await apiRequest("/work-experiences", "GET") || [];
//         rbRenderWorkExperiences();
//     } catch (err) {
//         rbNotify("Failed to load work experience: " + err.message, "error");
//     }
// }
//
// function rbRenderWorkExperiences() {
//     const list = document.getElementById("workExpList");
//     if (!list) return;
//     list.innerHTML = "";
//
//     if (!rbWorkExperiences || rbWorkExperiences.length === 0) {
//         list.innerHTML = `<div class="bg-white border border-dashed border-slate-200 rounded-2xl p-6 text-center text-xs font-medium text-slate-400">No work experience yet — add your first one above.</div>`;
//         return;
//     }
//
//     rbWorkExperiences.forEach(exp => {
//         const card = document.createElement("div");
//         card.className = "bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-3";
//
//         const dateRange = rbFormatDateRange(exp.startDate, exp.endDate);
//
//         card.innerHTML = `
//             <div class="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
//                 <div>
//                     <h4 class="font-display font-bold text-sm text-slate-900">${rbEscapeHtml(exp.jobTitle)} — ${rbEscapeHtml(exp.companyName)}</h4>
//                     <p class="text-xs text-slate-400 font-medium mt-0.5">${dateRange}${exp.location ? " · " + rbEscapeHtml(exp.location) : ""}</p>
//                 </div>
//                 <button type="button" data-action="delete-exp" data-id="${exp.id}" class="text-xs font-bold text-rose-500 hover:text-rose-700 shrink-0">Delete</button>
//             </div>
//             <div class="space-y-2" data-exp-id="${exp.id}"></div>
//             <div class="flex gap-2 pt-1">
//                 <textarea rows="2" placeholder="Add a new bullet point..." data-new-bullet-for="${exp.id}" class="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-indigo-500 focus:bg-white resize-none"></textarea>
//                 <button type="button" data-action="add-bullet" data-exp-id="${exp.id}" class="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shrink-0 self-end">Add</button>
//             </div>
//         `;
//
//         const bulletsContainer = card.querySelector(`[data-exp-id="${exp.id}"]`);
//         (exp.bullets || []).forEach(bullet => {
//             bulletsContainer.appendChild(rbCreateBulletRow(bullet, exp.id));
//         });
//
//         list.appendChild(card);
//     });
//
//     list.querySelectorAll('[data-action="delete-exp"]').forEach(btn => {
//         btn.addEventListener("click", () => rbDeleteWorkExperience(btn.dataset.id));
//     });
//     list.querySelectorAll('[data-action="add-bullet"]').forEach(btn => {
//         btn.addEventListener("click", () => rbAddBullet(btn.dataset.expId));
//     });
//
//     if (window.lucide) window.lucide.createIcons();
// }
//
// function rbCreateBulletRow(bullet, expId) {
//     const row = document.createElement("div");
//     row.className = "flex items-start gap-2 bg-slate-50 border border-slate-100 rounded-xl p-3";
//     row.dataset.bulletId = bullet.id;
//
//     const showCheckbox = rbCurrentResumeId !== null;
//     const isChecked = rbSelectedBulletIds.has(bullet.id);
//
//     row.innerHTML = `
//         ${showCheckbox ? `<input type="checkbox" ${isChecked ? "checked" : ""} data-bullet-id="${bullet.id}" class="mt-1 w-3.5 h-3.5 accent-indigo-600 shrink-0">` : ""}
//         <div class="flex-1 min-w-0">
//             <div class="text-xs font-medium text-slate-700 leading-relaxed rb-bullet-text">${rbEscapeHtml(bullet.content)}</div>
//             <div class="flex items-center gap-3 mt-2">
//                 <button type="button" data-action="ai" class="text-[11px] font-bold text-purple-600 hover:text-purple-800">✦ Improve with AI</button>
//                 <button type="button" data-action="edit" class="text-[11px] font-bold text-indigo-600 hover:text-indigo-800">Edit</button>
//                 <button type="button" data-action="delete" class="text-[11px] font-bold text-rose-500 hover:text-rose-700">Delete</button>
//             </div>
//         </div>
//     `;
//
//     if (showCheckbox) {
//         row.querySelector('input[type="checkbox"]').addEventListener("change", (e) => {
//             rbToggleBullet(bullet.id, e.target);
//         });
//     }
//
//     row.querySelector('[data-action="ai"]').addEventListener("click", () => rbOpenAiModal(bullet, expId));
//     row.querySelector('[data-action="edit"]').addEventListener("click", () => rbEditBullet(bullet, expId, row));
//     row.querySelector('[data-action="delete"]').addEventListener("click", () => rbDeleteBullet(bullet.id));
//
//     return row;
// }
//
// // ---- Work experience add / delete ----
// function rbWireStaticElements() {
//     const addExpBtn = document.getElementById("addExpBtn");
//     const addExpForm = document.getElementById("addExpForm");
//     const cancelExpBtn = document.getElementById("cancelExpBtn");
//     const saveExpBtn = document.getElementById("saveExpBtn");
//
//     addExpBtn?.addEventListener("click", () => {
//         addExpForm.classList.toggle("hidden");
//     });
//
//     cancelExpBtn?.addEventListener("click", () => {
//         addExpForm.classList.add("hidden");
//     });
//
//     saveExpBtn?.addEventListener("click", async () => {
//         const payload = {
//             companyName: document.getElementById("expCompany").value,
//             jobTitle: document.getElementById("expTitle").value,
//             startDate: document.getElementById("expStart").value,
//             endDate: document.getElementById("expEnd").value || null,
//             location: document.getElementById("expLocation").value
//         };
//
//         if (!payload.companyName || !payload.jobTitle || !payload.startDate) {
//             rbNotify("Company, job title, and start date are required.", "error");
//             return;
//         }
//
//         try {
//             await apiRequest("/work-experiences", "POST", payload);
//             addExpForm.classList.add("hidden");
//             ["expCompany", "expTitle", "expStart", "expEnd", "expLocation"].forEach(id => {
//                 document.getElementById(id).value = "";
//             });
//             rbNotify("Work experience added.", "success");
//             await rbLoadWorkExperiences();
//         } catch (err) {
//             rbNotify("Failed to save: " + err.message, "error");
//         }
//     });
//
//     // Resume version controls
//     const resumeSelect = document.getElementById("resumeSelect");
//     resumeSelect?.addEventListener("change", rbOnResumeSelectChange);
//     document.getElementById("newResumeBtn")?.addEventListener("click", rbCreateNewResume);
//     document.getElementById("duplicateResumeBtn")?.addEventListener("click", rbDuplicateResume);
//     document.getElementById("deleteResumeBtn")?.addEventListener("click", rbDeleteResume);
//
//     // Match score
//     document.getElementById("checkScoreBtn")?.addEventListener("click", rbCheckMatchScore);
//
//     // AI modal
//     document.getElementById("aiCloseBtn")?.addEventListener("click", () => {
//         document.getElementById("aiModalOverlay").classList.remove("active");
//         rbAiActiveBullet = null;
//     });
//     document.getElementById("aiModalOverlay")?.addEventListener("click", (e) => {
//         if (e.target.id === "aiModalOverlay") {
//             e.currentTarget.classList.remove("active");
//             rbAiActiveBullet = null;
//         }
//     });
//     document.getElementById("aiGetSuggestionsBtn")?.addEventListener("click", rbGetAiSuggestions);
//
//     // Skills
//     const addSkillBtn = document.getElementById("addSkillBtn");
//     const addSkillForm = document.getElementById("addSkillForm");
//     addSkillBtn?.addEventListener("click", () => addSkillForm.classList.toggle("hidden"));
//     document.getElementById("cancelSkillBtn")?.addEventListener("click", () => addSkillForm.classList.add("hidden"));
//     document.getElementById("saveSkillBtn")?.addEventListener("click", async () => {
//         const name = document.getElementById("skillName").value.trim();
//         const category = document.getElementById("skillCategory").value;
//         if (!name) {
//             rbNotify("Skill name is required.", "error");
//             return;
//         }
//         try {
//             await apiRequest("/skills", "POST", { name, category });
//             addSkillForm.classList.add("hidden");
//             document.getElementById("skillName").value = "";
//             rbNotify("Skill added.", "success");
//             await rbLoadSkills();
//         } catch (err) {
//             rbNotify("Failed to save skill: " + err.message, "error");
//         }
//     });
//
//     // Education
//     const addEduBtn = document.getElementById("addEducationBtn");
//     const addEduForm = document.getElementById("addEducationForm");
//     addEduBtn?.addEventListener("click", () => addEduForm.classList.toggle("hidden"));
//     document.getElementById("cancelEducationBtn")?.addEventListener("click", () => addEduForm.classList.add("hidden"));
//     document.getElementById("saveEducationBtn")?.addEventListener("click", async () => {
//         const payload = {
//             institution: document.getElementById("eduInstitution").value.trim(),
//             degree: document.getElementById("eduDegree").value.trim(),
//             fieldOfStudy: document.getElementById("eduFieldOfStudy").value.trim() || null,
//             startDate: document.getElementById("eduStart").value,
//             endDate: document.getElementById("eduEnd").value || null
//         };
//         if (!payload.institution || !payload.degree || !payload.startDate) {
//             rbNotify("Institution, degree, and start date are required.", "error");
//             return;
//         }
//         try {
//             await apiRequest("/education", "POST", payload);
//             addEduForm.classList.add("hidden");
//             ["eduInstitution", "eduDegree", "eduFieldOfStudy", "eduStart", "eduEnd"].forEach(id => {
//                 document.getElementById(id).value = "";
//             });
//             rbNotify("Education added.", "success");
//             await rbLoadEducation();
//         } catch (err) {
//             rbNotify("Failed to save education: " + err.message, "error");
//         }
//     });
// }
//
// // ---------------------------------------------------------------
// // SKILLS
// // ---------------------------------------------------------------
// async function rbLoadSkills() {
//     try {
//         const skills = await apiRequest("/skills", "GET") || [];
//         rbRenderSkills(skills);
//         if (typeof rtRefreshPreview === "function") rtRefreshPreview();
//     } catch (err) {
//         rbNotify("Failed to load skills: " + err.message, "error");
//     }
// }
//
// function rbRenderSkills(skills) {
//     const container = document.getElementById("skillsList");
//     if (!container) return;
//     container.innerHTML = "";
//
//     if (skills.length === 0) {
//         container.innerHTML = '<p class="text-xs text-slate-400 font-medium">No skills added yet.</p>';
//         return;
//     }
//
//     skills.forEach(skill => {
//         const chip = document.createElement("span");
//         chip.className = "inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-full text-xs font-semibold";
//         chip.innerHTML = `${rbEscapeHtml(skill.name)}${skill.category ? `<span class="text-slate-400 font-normal">· ${rbEscapeHtml(skill.category)}</span>` : ""}
//             <button type="button" class="text-slate-400 hover:text-rose-600" data-id="${skill.id}">&times;</button>`;
//         chip.querySelector("button").addEventListener("click", () => rbDeleteSkill(skill.id));
//         container.appendChild(chip);
//     });
// }
//
// async function rbDeleteSkill(id) {
//     try {
//         await apiRequest(`/skills/${id}`, "DELETE");
//         rbNotify("Skill removed.", "success");
//         await rbLoadSkills();
//     } catch (err) {
//         rbNotify("Failed to remove skill: " + err.message, "error");
//     }
// }
//
// // ---------------------------------------------------------------
// // EDUCATION
// // ---------------------------------------------------------------
// async function rbLoadEducation() {
//     try {
//         const education = await apiRequest("/education", "GET") || [];
//         rbRenderEducation(education);
//         if (typeof rtRefreshPreview === "function") rtRefreshPreview();
//     } catch (err) {
//         rbNotify("Failed to load education: " + err.message, "error");
//     }
// }
//
// function rbRenderEducation(educationList) {
//     const container = document.getElementById("educationList");
//     if (!container) return;
//     container.innerHTML = "";
//
//     if (educationList.length === 0) {
//         container.innerHTML = '<p class="text-xs text-slate-400 font-medium">No education added yet.</p>';
//         return;
//     }
//
//     educationList.forEach(edu => {
//         const row = document.createElement("div");
//         row.className = "flex items-start justify-between gap-2 bg-slate-50 border border-slate-100 rounded-xl p-3";
//         row.innerHTML = `
//             <div>
//                 <p class="text-xs font-bold text-slate-900">${rbEscapeHtml(edu.institution)}</p>
//                 <p class="text-xs text-slate-500">${rbEscapeHtml(edu.degree)}${edu.fieldOfStudy ? ", " + rbEscapeHtml(edu.fieldOfStudy) : ""}</p>
//                 <p class="text-[10px] text-slate-400 font-medium mt-0.5">${rbFormatDateRange(edu.startDate, edu.endDate)}</p>
//             </div>
//             <button type="button" class="text-slate-400 hover:text-rose-600 text-xs font-bold flex-shrink-0" data-id="${edu.id}">Delete</button>
//         `;
//         row.querySelector("button").addEventListener("click", () => rbDeleteEducation(edu.id));
//         container.appendChild(row);
//     });
// }
//
// async function rbDeleteEducation(id) {
//     try {
//         await apiRequest(`/education/${id}`, "DELETE");
//         rbNotify("Education removed.", "success");
//         await rbLoadEducation();
//     } catch (err) {
//         rbNotify("Failed to remove education: " + err.message, "error");
//     }
// }
//
// async function rbDeleteWorkExperience(id) {
//     const confirmed = typeof showConfirm === "function"
//         ? await showConfirm("Delete this work experience and all its bullets?")
//         : confirm("Delete this work experience and all its bullets?");
//     if (!confirmed) return;
//     try {
//         await apiRequest(`/work-experiences/${id}`, "DELETE");
//         rbNotify("Deleted.", "success");
//         await rbLoadWorkExperiences();
//     } catch (err) {
//         rbNotify("Failed to delete: " + err.message, "error");
//     }
// }
//
// // ---- Bullets: add / edit / delete ----
// async function rbAddBullet(expId) {
//     const textarea = document.querySelector(`[data-new-bullet-for="${expId}"]`);
//     const content = textarea.value.trim();
//     if (!content) return;
//
//     try {
//         await apiRequest("/bullets", "POST", { workExperienceId: parseInt(expId), content });
//         textarea.value = "";
//         rbNotify("Bullet added.", "success");
//         await rbLoadWorkExperiences();
//     } catch (err) {
//         rbNotify("Failed to add bullet: " + err.message, "error");
//     }
// }
//
// function rbEditBullet(bullet, expId, row) {
//     const textDiv = row.querySelector(".rb-bullet-text");
//     const current = bullet.content;
//
//     textDiv.innerHTML = `
//         <textarea class="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs font-medium" rows="2">${rbEscapeHtml(current)}</textarea>
//         <button type="button" class="mt-1.5 px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold rounded-lg">Save</button>
//     `;
//
//     textDiv.querySelector("button").addEventListener("click", async () => {
//         const newContent = textDiv.querySelector("textarea").value.trim();
//         if (!newContent) return;
//         try {
//             await apiRequest(`/bullets/${bullet.id}`, "PUT", {
//                 workExperienceId: parseInt(expId),
//                 content: newContent,
//                 displayOrder: bullet.displayOrder
//             });
//             rbNotify("Bullet updated.", "success");
//             await rbLoadWorkExperiences();
//         } catch (err) {
//             rbNotify("Failed to update: " + err.message, "error");
//         }
//     });
// }
//
// async function rbDeleteBullet(id) {
//     const confirmed = typeof showConfirm === "function"
//         ? await showConfirm("Delete this bullet?")
//         : confirm("Delete this bullet?");
//     if (!confirmed) return;
//     try {
//         await apiRequest(`/bullets/${id}`, "DELETE");
//         rbNotify("Bullet deleted.", "success");
//         await rbLoadWorkExperiences();
//     } catch (err) {
//         rbNotify("Failed to delete: " + err.message, "error");
//     }
// }
//
// // ---------------------------------------------------------------
// // AI IMPROVE MODAL
// // ---------------------------------------------------------------
// function rbOpenAiModal(bullet, expId) {
//     rbAiActiveBullet = { id: bullet.id, workExperienceId: expId, displayOrder: bullet.displayOrder };
//     document.getElementById("aiOriginalText").textContent = bullet.content;
//     document.getElementById("aiJobDescription").value = "";
//     document.getElementById("aiSuggestions").innerHTML = "";
//     document.getElementById("aiModalOverlay").classList.add("active");
// }
//
// async function rbGetAiSuggestions() {
//     if (!rbAiActiveBullet) return;
//     const suggestionsEl = document.getElementById("aiSuggestions");
//     suggestionsEl.innerHTML = `<p class="text-xs text-slate-400 font-medium">Thinking... this can take up to a minute.</p>`;
//
//     try {
//         const body = { jobDescription: document.getElementById("aiJobDescription").value || null };
//         const result = await apiRequest(`/bullets/${rbAiActiveBullet.id}/improve`, "POST", body);
//         const suggestions = (result && result.suggestions) || [];
//
//         if (suggestions.length === 0) {
//             suggestionsEl.innerHTML = `<p class="text-xs text-slate-400 font-medium">No suggestions returned.</p>`;
//             return;
//         }
//
//         suggestionsEl.innerHTML = "";
//         suggestions.forEach(text => {
//             const item = document.createElement("div");
//             item.className = "bg-purple-50 border border-purple-100 rounded-xl p-3 space-y-2";
//             item.innerHTML = `
//                 <div class="text-xs font-medium text-slate-700">${rbEscapeHtml(text)}</div>
//                 <button type="button" class="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-bold rounded-lg">Use this version</button>
//             `;
//             item.querySelector("button").addEventListener("click", async () => {
//                 try {
//                     await apiRequest(`/bullets/${rbAiActiveBullet.id}`, "PUT", {
//                         workExperienceId: parseInt(rbAiActiveBullet.workExperienceId),
//                         content: text,
//                         displayOrder: rbAiActiveBullet.displayOrder
//                     });
//                     rbNotify("Bullet updated with AI suggestion.", "success");
//                     document.getElementById("aiModalOverlay").classList.remove("active");
//                     await rbLoadWorkExperiences();
//                 } catch (err) {
//                     rbNotify("Failed to apply suggestion: " + err.message, "error");
//                 }
//             });
//             suggestionsEl.appendChild(item);
//         });
//     } catch (err) {
//         suggestionsEl.innerHTML = `<p class="text-xs text-rose-500 font-medium">Failed to get suggestions: ${rbEscapeHtml(err.message)}</p>`;
//     }
// }
//
// // ---------------------------------------------------------------
// // RESUME VERSIONS
// // ---------------------------------------------------------------
// async function rbLoadResumes() {
//     const resumeSelect = document.getElementById("resumeSelect");
//     if (!resumeSelect) return;
//     try {
//         const resumes = await apiRequest("/resumes", "GET") || [];
//         const previousValue = resumeSelect.value;
//         resumeSelect.innerHTML = '<option value="">-- Select a resume --</option>';
//         resumes.forEach(r => {
//             const opt = document.createElement("option");
//             opt.value = r.id;
//             opt.textContent = r.title || `Resume #${r.id}`;
//             resumeSelect.appendChild(opt);
//         });
//         if (previousValue && resumes.some(r => String(r.id) === previousValue)) {
//             resumeSelect.value = previousValue;
//         }
//     } catch (err) {
//         rbNotify("Failed to load resumes: " + err.message, "error");
//     }
// }
//
// async function rbOnResumeSelectChange() {
//     const resumeSelect = document.getElementById("resumeSelect");
//     const id = resumeSelect.value;
//     const duplicateBtn = document.getElementById("duplicateResumeBtn");
//     const deleteBtn = document.getElementById("deleteResumeBtn");
//     const noResumeNote = document.getElementById("noResumeNote");
//     const matchScorePanel = document.getElementById("matchScorePanel");
//     const matchScoreResult = document.getElementById("matchScoreResult");
//
//     if (!id) {
//         rbCurrentResumeId = null;
//         rbSelectedBulletIds = new Set();
//         if (duplicateBtn) duplicateBtn.disabled = true;
//         if (deleteBtn) deleteBtn.disabled = true;
//         if (noResumeNote) noResumeNote.classList.remove("hidden");
//         if (matchScorePanel) matchScorePanel.classList.add("hidden");
//         rbRenderWorkExperiences();
//         return;
//     }
//
//     rbCurrentResumeId = parseInt(id);
//     if (duplicateBtn) duplicateBtn.disabled = false;
//     if (deleteBtn) deleteBtn.disabled = false;
//     if (noResumeNote) noResumeNote.classList.add("hidden");
//     if (matchScorePanel) matchScorePanel.classList.remove("hidden");
//     if (matchScoreResult) matchScoreResult.classList.add("hidden");
//
//     try {
//         const resume = await apiRequest(`/resumes/${rbCurrentResumeId}`, "GET");
//         rbSelectedBulletIds = new Set();
//         (resume.workExperiences || []).forEach(exp => {
//             (exp.selectedBullets || []).forEach(b => rbSelectedBulletIds.add(b.id));
//         });
//         rbRenderWorkExperiences();
//     } catch (err) {
//         rbNotify("Failed to load resume: " + err.message, "error");
//     }
// }
//
// async function rbCreateNewResume() {
//     const title = prompt('Name this resume version (e.g. "Backend - Google"):');
//     if (!title) return;
//     try {
//         const created = await apiRequest("/resumes", "POST", { title });
//         rbNotify("Resume created.", "success");
//         await rbLoadResumes();
//         const resumeSelect = document.getElementById("resumeSelect");
//         resumeSelect.value = created.id;
//         resumeSelect.dispatchEvent(new Event("change"));
//     } catch (err) {
//         rbNotify("Failed to create resume: " + err.message, "error");
//     }
// }
//
// async function rbDuplicateResume() {
//     if (!rbCurrentResumeId) return;
//     try {
//         const dup = await apiRequest(`/resumes/${rbCurrentResumeId}/duplicate`, "POST");
//         rbNotify("Resume duplicated.", "success");
//         await rbLoadResumes();
//         const resumeSelect = document.getElementById("resumeSelect");
//         resumeSelect.value = dup.id;
//         resumeSelect.dispatchEvent(new Event("change"));
//     } catch (err) {
//         rbNotify("Failed to duplicate: " + err.message, "error");
//     }
// }
//
// async function rbDeleteResume() {
//     if (!rbCurrentResumeId) return;
//     const confirmed = typeof showConfirm === "function"
//         ? await showConfirm("Delete this resume version? Bullets in your content bank are unaffected.")
//         : confirm("Delete this resume version? Bullets in your content bank are unaffected.");
//     if (!confirmed) return;
//     try {
//         await apiRequest(`/resumes/${rbCurrentResumeId}`, "DELETE");
//         rbNotify("Resume deleted.", "success");
//         rbCurrentResumeId = null;
//         rbSelectedBulletIds = new Set();
//         await rbLoadResumes();
//         const resumeSelect = document.getElementById("resumeSelect");
//         resumeSelect.value = "";
//         resumeSelect.dispatchEvent(new Event("change"));
//     } catch (err) {
//         rbNotify("Failed to delete: " + err.message, "error");
//     }
// }
//
// async function rbToggleBullet(bulletId, checkboxEl) {
//     if (!rbCurrentResumeId) return;
//     try {
//         const result = await apiRequest(`/resumes/${rbCurrentResumeId}/toggle-bullet/${bulletId}`, "POST");
//         if (result.selected) {
//             rbSelectedBulletIds.add(bulletId);
//         } else {
//             rbSelectedBulletIds.delete(bulletId);
//         }
//         checkboxEl.checked = result.selected;
//     } catch (err) {
//         rbNotify("Failed to toggle bullet: " + err.message, "error");
//         checkboxEl.checked = !checkboxEl.checked;
//     }
// }
//
// // ---------------------------------------------------------------
// // MATCH SCORE  (MatchScoreResponseDto confirmed: score, matchedKeywords, missingKeywords)
// // ---------------------------------------------------------------
// async function rbCheckMatchScore() {
//     if (!rbCurrentResumeId) return;
//     const jdTextEl = document.getElementById("jdText");
//     const text = jdTextEl.value.trim();
//     if (!text) {
//         rbNotify("Paste a job description first.", "error");
//         return;
//     }
//
//     const btn = document.getElementById("checkScoreBtn");
//     const originalLabel = btn.textContent;
//     btn.textContent = "Checking...";
//     btn.disabled = true;
//
//     try {
//         const result = await apiRequest(`/resumes/${rbCurrentResumeId}/match-score`, "POST", {
//             jobDescriptionText: text
//         });
//         rbRenderMatchScore(result);
//     } catch (err) {
//         rbNotify("Failed to check match score: " + err.message, "error");
//     } finally {
//         btn.textContent = originalLabel;
//         btn.disabled = false;
//     }
// }
//
// function rbRenderMatchScore(result) {
//     const score = result.score || 0;
//     const missing = result.missingKeywords || [];
//     const matched = result.matchedKeywords || [];
//
//     const scoreValue = document.getElementById("scoreValue");
//     scoreValue.textContent = Math.round(score) + "%";
//     scoreValue.className = "font-display text-3xl font-bold " +
//         (score >= 70 ? "text-emerald-600" : score >= 40 ? "text-amber-600" : "text-rose-600");
//
//     document.getElementById("missingKeywords").innerHTML = missing.length
//         ? missing.map(k => `<span class="px-2 py-1 bg-rose-50 border border-rose-100 text-rose-700 rounded-lg text-[11px] font-bold">${rbEscapeHtml(k)}</span>`).join("")
//         : `<span class="text-xs text-slate-400 font-medium">None — great coverage!</span>`;
//
//     document.getElementById("matchedKeywords").innerHTML = matched.length
//         ? matched.map(k => `<span class="px-2 py-1 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-lg text-[11px] font-bold">${rbEscapeHtml(k)}</span>`).join("")
//         : `<span class="text-xs text-slate-400 font-medium">—</span>`;
//
//     document.getElementById("matchScoreResult").classList.remove("hidden");
// }


// ---------------------------------------------------------------
// Resume Builder view logic.
// Confirmed against real backend code:
//   ResumeController      -> /api/resumes  (CRUD, /duplicate, /toggle-bullet/{bulletId}, /match-score)
//   WorkExperienceController -> /api/work-experiences (CRUD)
//   ResumeRequestDto       { title }
//   ResumeSummaryDto       { id, title, createdAt, updatedAt }
//   ResumeResponseDto      { id, title, createdAt, updatedAt, workExperiences[], skills[], education[] }
//     WorkExperienceDto    { id, companyName, jobTitle, startDate, endDate, location, selectedBullets[] }
//     BulletDto            { id, content, displayOrder }
//   WorkExperienceRequestDto { companyName, jobTitle, startDate, endDate, location }
//   WorkExperienceResponseDto { id, companyName, jobTitle, startDate, endDate, location, bullets[] }
//   BulletResponseDto      { id, content, displayOrder }
//   MatchScoreRequestDto   { jobDescriptionText }
//   MatchScoreResponseDto  { score, matchedKeywords, missingKeywords }
//
// NOT confirmed against real backend code (no BulletController.java received yet):
//   POST   /bullets                       { workExperienceId, content }
//   PUT    /bullets/{id}                  { workExperienceId, content, displayOrder }
//   DELETE /bullets/{id}
//   POST   /bullets/{id}/improve          { jobDescription } -> { suggestions: [...] }
// These match what your earlier session verified worked for BulletAiService, but if any
// of the four above 404s or shape-mismatches, send BulletController.java and I'll fix it
// in one pass instead of guessing again.
//
// Note: apiRequest() in api.js already targets http://localhost:8080/api — every endpoint
// string below must start with "/xyz", NOT "/api/xyz".

let rbInitialized = false;
let rbWorkExperiences = [];       // content bank, each with nested .bullets[]
let rbCurrentResumeId = null;     // currently selected resume version
let rbSelectedBulletIds = new Set();
let rbAiActiveBullet = null;      // { id, workExperienceId, displayOrder }

function rbNotify(msg, type) {
    if (typeof showToast === "function") {
        showToast(msg, type || "info");
    } else {
        console.log("[" + (type || "info") + "]", msg);
    }
}

function rbEscapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str || "";
    return div.innerHTML;
}

function rbFormatDateRange(start, end) {
    const s = start ? String(start).substring(0, 7) : "?";
    const e = end ? String(end).substring(0, 7) : "Present";
    return `${s} – ${e}`;
}

// ---------------------------------------------------------------
// PUBLIC ENTRY POINT — called by the router every time #/resume-builder loads
// ---------------------------------------------------------------
function loadResumeBuilderView() {
    if (!rbInitialized) {
        rbWireStaticElements();
        rbInitialized = true;
    }
    rbLoadWorkExperiences();
    rbLoadResumes();
    rbLoadSkills();
    rbLoadEducation();
}

// ---------------------------------------------------------------
// WORK EXPERIENCE + BULLET CONTENT BANK
// ---------------------------------------------------------------
async function rbLoadWorkExperiences() {
    const list = document.getElementById("workExpList");
    if (!list) return;
    try {
        rbWorkExperiences = await apiRequest("/work-experiences", "GET") || [];
        rbRenderWorkExperiences();
    } catch (err) {
        rbNotify("Failed to load work experience: " + err.message, "error");
    }
}

function rbRenderWorkExperiences() {
    const list = document.getElementById("workExpList");
    if (!list) return;
    list.innerHTML = "";

    if (!rbWorkExperiences || rbWorkExperiences.length === 0) {
        list.innerHTML = `<div class="bg-white/[0.03] border border-dashed border-white/10 rounded-2xl p-6 text-center text-xs font-medium text-slate-500">No work experience yet — add your first one above.</div>`;
        return;
    }

    rbWorkExperiences.forEach(exp => {
        const card = document.createElement("div");
        card.className = "bg-white/[0.03] border border-white/10 rounded-2xl p-5 shadow-sm space-y-3";

        const dateRange = rbFormatDateRange(exp.startDate, exp.endDate);

        card.innerHTML = `
            <div class="flex items-start justify-between gap-3 border-b border-white/5 pb-3">
                <div>
                    <h4 class="font-display font-bold text-sm text-white">${rbEscapeHtml(exp.jobTitle)} — ${rbEscapeHtml(exp.companyName)}</h4>
                    <p class="text-xs text-slate-500 font-medium mt-0.5">${dateRange}${exp.location ? " · " + rbEscapeHtml(exp.location) : ""}</p>
                </div>
                <button type="button" data-action="delete-exp" data-id="${exp.id}" class="text-xs font-bold text-rose-500 hover:text-rose-300 shrink-0">Delete</button>
            </div>
            <div class="space-y-2" data-exp-id="${exp.id}"></div>
            <div class="flex gap-2 pt-1">
                <textarea rows="2" placeholder="Add a new bullet point..." data-new-bullet-for="${exp.id}" class="flex-1 px-3 py-2 bg-white/[0.05] border border-white/10 rounded-xl text-xs font-medium focus:outline-none focus:border-indigo-500 focus:bg-white/[0.03] resize-none"></textarea>
                <button type="button" data-action="add-bullet" data-exp-id="${exp.id}" class="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shrink-0 self-end">Add</button>
            </div>
        `;

        const bulletsContainer = card.querySelector(`[data-exp-id="${exp.id}"]`);
        (exp.bullets || []).forEach(bullet => {
            bulletsContainer.appendChild(rbCreateBulletRow(bullet, exp.id));
        });

        list.appendChild(card);
    });

    list.querySelectorAll('[data-action="delete-exp"]').forEach(btn => {
        btn.addEventListener("click", () => rbDeleteWorkExperience(btn.dataset.id));
    });
    list.querySelectorAll('[data-action="add-bullet"]').forEach(btn => {
        btn.addEventListener("click", () => rbAddBullet(btn.dataset.expId));
    });

    if (window.lucide) window.lucide.createIcons();
}

function rbCreateBulletRow(bullet, expId) {
    const row = document.createElement("div");
    row.className = "flex items-start gap-2 bg-white/[0.05] border border-white/5 rounded-xl p-3";
    row.dataset.bulletId = bullet.id;

    const showCheckbox = rbCurrentResumeId !== null;
    const isChecked = rbSelectedBulletIds.has(bullet.id);

    row.innerHTML = `
        ${showCheckbox ? `<input type="checkbox" ${isChecked ? "checked" : ""} data-bullet-id="${bullet.id}" class="mt-1 w-3.5 h-3.5 accent-indigo-600 shrink-0">` : ""}
        <div class="flex-1 min-w-0">
            <div class="text-xs font-medium text-slate-200 leading-relaxed rb-bullet-text">${rbEscapeHtml(bullet.content)}</div>
            <div class="flex items-center gap-3 mt-2">
                <button type="button" data-action="ai" class="text-[11px] font-bold text-purple-400 hover:text-purple-800">✦ Improve with AI</button>
                <button type="button" data-action="edit" class="text-[11px] font-bold text-indigo-400 hover:text-indigo-800">Edit</button>
                <button type="button" data-action="delete" class="text-[11px] font-bold text-rose-500 hover:text-rose-300">Delete</button>
            </div>
        </div>
    `;

    if (showCheckbox) {
        row.querySelector('input[type="checkbox"]').addEventListener("change", (e) => {
            rbToggleBullet(bullet.id, e.target);
        });
    }

    row.querySelector('[data-action="ai"]').addEventListener("click", () => rbOpenAiModal(bullet, expId));
    row.querySelector('[data-action="edit"]').addEventListener("click", () => rbEditBullet(bullet, expId, row));
    row.querySelector('[data-action="delete"]').addEventListener("click", () => rbDeleteBullet(bullet.id));

    return row;
}

// ---- Work experience add / delete ----
function rbWireStaticElements() {
    const addExpBtn = document.getElementById("addExpBtn");
    const addExpForm = document.getElementById("addExpForm");
    const cancelExpBtn = document.getElementById("cancelExpBtn");
    const saveExpBtn = document.getElementById("saveExpBtn");

    addExpBtn?.addEventListener("click", () => {
        addExpForm.classList.toggle("hidden");
    });

    cancelExpBtn?.addEventListener("click", () => {
        addExpForm.classList.add("hidden");
    });

    saveExpBtn?.addEventListener("click", async () => {
        const payload = {
            companyName: document.getElementById("expCompany").value,
            jobTitle: document.getElementById("expTitle").value,
            startDate: document.getElementById("expStart").value,
            endDate: document.getElementById("expEnd").value || null,
            location: document.getElementById("expLocation").value
        };

        if (!payload.companyName || !payload.jobTitle || !payload.startDate) {
            rbNotify("Company, job title, and start date are required.", "error");
            return;
        }

        try {
            await apiRequest("/work-experiences", "POST", payload);
            addExpForm.classList.add("hidden");
            ["expCompany", "expTitle", "expStart", "expEnd", "expLocation"].forEach(id => {
                document.getElementById(id).value = "";
            });
            rbNotify("Work experience added.", "success");
            await rbLoadWorkExperiences();
        } catch (err) {
            rbNotify("Failed to save: " + err.message, "error");
        }
    });

    // Resume version controls
    const resumeSelect = document.getElementById("resumeSelect");
    resumeSelect?.addEventListener("change", rbOnResumeSelectChange);
    document.getElementById("newResumeBtn")?.addEventListener("click", rbCreateNewResume);
    document.getElementById("duplicateResumeBtn")?.addEventListener("click", rbDuplicateResume);
    document.getElementById("deleteResumeBtn")?.addEventListener("click", rbDeleteResume);

    // Match score
    document.getElementById("checkScoreBtn")?.addEventListener("click", rbCheckMatchScore);

    // AI modal
    document.getElementById("aiCloseBtn")?.addEventListener("click", () => {
        document.getElementById("aiModalOverlay").classList.remove("active");
        rbAiActiveBullet = null;
    });
    document.getElementById("aiModalOverlay")?.addEventListener("click", (e) => {
        if (e.target.id === "aiModalOverlay") {
            e.currentTarget.classList.remove("active");
            rbAiActiveBullet = null;
        }
    });
    document.getElementById("aiGetSuggestionsBtn")?.addEventListener("click", rbGetAiSuggestions);

    // Skills
    const addSkillBtn = document.getElementById("addSkillBtn");
    const addSkillForm = document.getElementById("addSkillForm");
    addSkillBtn?.addEventListener("click", () => addSkillForm.classList.toggle("hidden"));
    document.getElementById("cancelSkillBtn")?.addEventListener("click", () => addSkillForm.classList.add("hidden"));
    document.getElementById("saveSkillBtn")?.addEventListener("click", async () => {
        const name = document.getElementById("skillName").value.trim();
        const category = document.getElementById("skillCategory").value;
        if (!name) {
            rbNotify("Skill name is required.", "error");
            return;
        }
        try {
            await apiRequest("/skills", "POST", { name, category });
            addSkillForm.classList.add("hidden");
            document.getElementById("skillName").value = "";
            rbNotify("Skill added.", "success");
            await rbLoadSkills();
        } catch (err) {
            rbNotify("Failed to save skill: " + err.message, "error");
        }
    });

    // Education
    const addEduBtn = document.getElementById("addEducationBtn");
    const addEduForm = document.getElementById("addEducationForm");
    addEduBtn?.addEventListener("click", () => addEduForm.classList.toggle("hidden"));
    document.getElementById("cancelEducationBtn")?.addEventListener("click", () => addEduForm.classList.add("hidden"));
    document.getElementById("saveEducationBtn")?.addEventListener("click", async () => {
        const payload = {
            institution: document.getElementById("eduInstitution").value.trim(),
            degree: document.getElementById("eduDegree").value.trim(),
            fieldOfStudy: document.getElementById("eduFieldOfStudy").value.trim() || null,
            startDate: document.getElementById("eduStart").value,
            endDate: document.getElementById("eduEnd").value || null
        };
        if (!payload.institution || !payload.degree || !payload.startDate) {
            rbNotify("Institution, degree, and start date are required.", "error");
            return;
        }
        try {
            await apiRequest("/education", "POST", payload);
            addEduForm.classList.add("hidden");
            ["eduInstitution", "eduDegree", "eduFieldOfStudy", "eduStart", "eduEnd"].forEach(id => {
                document.getElementById(id).value = "";
            });
            rbNotify("Education added.", "success");
            await rbLoadEducation();
        } catch (err) {
            rbNotify("Failed to save education: " + err.message, "error");
        }
    });
}

// ---------------------------------------------------------------
// SKILLS
// ---------------------------------------------------------------
async function rbLoadSkills() {
    try {
        const skills = await apiRequest("/skills", "GET") || [];
        rbRenderSkills(skills);
        if (typeof rtRefreshPreview === "function") rtRefreshPreview();
    } catch (err) {
        rbNotify("Failed to load skills: " + err.message, "error");
    }
}

function rbRenderSkills(skills) {
    const container = document.getElementById("skillsList");
    if (!container) return;
    container.innerHTML = "";

    if (skills.length === 0) {
        container.innerHTML = '<p class="text-xs text-slate-500 font-medium">No skills added yet.</p>';
        return;
    }

    skills.forEach(skill => {
        const chip = document.createElement("span");
        chip.className = "inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 text-slate-200 rounded-full text-xs font-semibold";
        chip.innerHTML = `${rbEscapeHtml(skill.name)}${skill.category ? `<span class="text-slate-500 font-normal">· ${rbEscapeHtml(skill.category)}</span>` : ""}
            <button type="button" class="text-slate-500 hover:text-rose-400" data-id="${skill.id}">&times;</button>`;
        chip.querySelector("button").addEventListener("click", () => rbDeleteSkill(skill.id));
        container.appendChild(chip);
    });
}

async function rbDeleteSkill(id) {
    try {
        await apiRequest(`/skills/${id}`, "DELETE");
        rbNotify("Skill removed.", "success");
        await rbLoadSkills();
    } catch (err) {
        rbNotify("Failed to remove skill: " + err.message, "error");
    }
}

// ---------------------------------------------------------------
// EDUCATION
// ---------------------------------------------------------------
async function rbLoadEducation() {
    try {
        const education = await apiRequest("/education", "GET") || [];
        rbRenderEducation(education);
        if (typeof rtRefreshPreview === "function") rtRefreshPreview();
    } catch (err) {
        rbNotify("Failed to load education: " + err.message, "error");
    }
}

function rbRenderEducation(educationList) {
    const container = document.getElementById("educationList");
    if (!container) return;
    container.innerHTML = "";

    if (educationList.length === 0) {
        container.innerHTML = '<p class="text-xs text-slate-500 font-medium">No education added yet.</p>';
        return;
    }

    educationList.forEach(edu => {
        const row = document.createElement("div");
        row.className = "flex items-start justify-between gap-2 bg-white/[0.05] border border-white/5 rounded-xl p-3";
        row.innerHTML = `
            <div>
                <p class="text-xs font-bold text-white">${rbEscapeHtml(edu.institution)}</p>
                <p class="text-xs text-slate-400">${rbEscapeHtml(edu.degree)}${edu.fieldOfStudy ? ", " + rbEscapeHtml(edu.fieldOfStudy) : ""}</p>
                <p class="text-[10px] text-slate-500 font-medium mt-0.5">${rbFormatDateRange(edu.startDate, edu.endDate)}</p>
            </div>
            <button type="button" class="text-slate-500 hover:text-rose-400 text-xs font-bold flex-shrink-0" data-id="${edu.id}">Delete</button>
        `;
        row.querySelector("button").addEventListener("click", () => rbDeleteEducation(edu.id));
        container.appendChild(row);
    });
}

async function rbDeleteEducation(id) {
    try {
        await apiRequest(`/education/${id}`, "DELETE");
        rbNotify("Education removed.", "success");
        await rbLoadEducation();
    } catch (err) {
        rbNotify("Failed to remove education: " + err.message, "error");
    }
}

async function rbDeleteWorkExperience(id) {
    const confirmed = typeof showConfirm === "function"
        ? await showConfirm("Delete this work experience and all its bullets?")
        : confirm("Delete this work experience and all its bullets?");
    if (!confirmed) return;
    try {
        await apiRequest(`/work-experiences/${id}`, "DELETE");
        rbNotify("Deleted.", "success");
        await rbLoadWorkExperiences();
    } catch (err) {
        rbNotify("Failed to delete: " + err.message, "error");
    }
}

// ---- Bullets: add / edit / delete ----
async function rbAddBullet(expId) {
    const textarea = document.querySelector(`[data-new-bullet-for="${expId}"]`);
    const content = textarea.value.trim();
    if (!content) return;

    try {
        await apiRequest("/bullets", "POST", { workExperienceId: parseInt(expId), content });
        textarea.value = "";
        rbNotify("Bullet added.", "success");
        await rbLoadWorkExperiences();
    } catch (err) {
        rbNotify("Failed to add bullet: " + err.message, "error");
    }
}

function rbEditBullet(bullet, expId, row) {
    const textDiv = row.querySelector(".rb-bullet-text");
    const current = bullet.content;

    textDiv.innerHTML = `
        <textarea class="w-full px-2 py-1.5 border border-white/10 rounded-lg text-xs font-medium" rows="2">${rbEscapeHtml(current)}</textarea>
        <button type="button" class="mt-1.5 px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold rounded-lg">Save</button>
    `;

    textDiv.querySelector("button").addEventListener("click", async () => {
        const newContent = textDiv.querySelector("textarea").value.trim();
        if (!newContent) return;
        try {
            await apiRequest(`/bullets/${bullet.id}`, "PUT", {
                workExperienceId: parseInt(expId),
                content: newContent,
                displayOrder: bullet.displayOrder
            });
            rbNotify("Bullet updated.", "success");
            await rbLoadWorkExperiences();
        } catch (err) {
            rbNotify("Failed to update: " + err.message, "error");
        }
    });
}

async function rbDeleteBullet(id) {
    const confirmed = typeof showConfirm === "function"
        ? await showConfirm("Delete this bullet?")
        : confirm("Delete this bullet?");
    if (!confirmed) return;
    try {
        await apiRequest(`/bullets/${id}`, "DELETE");
        rbNotify("Bullet deleted.", "success");
        await rbLoadWorkExperiences();
    } catch (err) {
        rbNotify("Failed to delete: " + err.message, "error");
    }
}

// ---------------------------------------------------------------
// AI IMPROVE MODAL
// ---------------------------------------------------------------
function rbOpenAiModal(bullet, expId) {
    rbAiActiveBullet = { id: bullet.id, workExperienceId: expId, displayOrder: bullet.displayOrder };
    document.getElementById("aiOriginalText").textContent = bullet.content;
    document.getElementById("aiJobDescription").value = "";
    document.getElementById("aiSuggestions").innerHTML = "";
    document.getElementById("aiModalOverlay").classList.add("active");
}

async function rbGetAiSuggestions() {
    if (!rbAiActiveBullet) return;
    const suggestionsEl = document.getElementById("aiSuggestions");
    suggestionsEl.innerHTML = `<p class="text-xs text-slate-500 font-medium">Thinking... this can take up to a minute.</p>`;

    try {
        const body = { jobDescription: document.getElementById("aiJobDescription").value || null };
        const result = await apiRequest(`/bullets/${rbAiActiveBullet.id}/improve`, "POST", body);
        const suggestions = (result && result.suggestions) || [];

        if (suggestions.length === 0) {
            suggestionsEl.innerHTML = `<p class="text-xs text-slate-500 font-medium">No suggestions returned.</p>`;
            return;
        }

        suggestionsEl.innerHTML = "";
        suggestions.forEach(text => {
            const item = document.createElement("div");
            item.className = "bg-purple-500/10 border border-purple-500/20 rounded-xl p-3 space-y-2";
            item.innerHTML = `
                <div class="text-xs font-medium text-slate-200">${rbEscapeHtml(text)}</div>
                <button type="button" class="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-bold rounded-lg">Use this version</button>
            `;
            item.querySelector("button").addEventListener("click", async () => {
                try {
                    await apiRequest(`/bullets/${rbAiActiveBullet.id}`, "PUT", {
                        workExperienceId: parseInt(rbAiActiveBullet.workExperienceId),
                        content: text,
                        displayOrder: rbAiActiveBullet.displayOrder
                    });
                    rbNotify("Bullet updated with AI suggestion.", "success");
                    document.getElementById("aiModalOverlay").classList.remove("active");
                    await rbLoadWorkExperiences();
                } catch (err) {
                    rbNotify("Failed to apply suggestion: " + err.message, "error");
                }
            });
            suggestionsEl.appendChild(item);
        });
    } catch (err) {
        suggestionsEl.innerHTML = `<p class="text-xs text-rose-500 font-medium">Failed to get suggestions: ${rbEscapeHtml(err.message)}</p>`;
    }
}

// ---------------------------------------------------------------
// RESUME VERSIONS
// ---------------------------------------------------------------
async function rbLoadResumes() {
    const resumeSelect = document.getElementById("resumeSelect");
    if (!resumeSelect) return;
    try {
        const resumes = await apiRequest("/resumes", "GET") || [];
        const previousValue = resumeSelect.value;
        resumeSelect.innerHTML = '<option value="">-- Select a resume --</option>';
        resumes.forEach(r => {
            const opt = document.createElement("option");
            opt.value = r.id;
            opt.textContent = r.title || `Resume #${r.id}`;
            resumeSelect.appendChild(opt);
        });
        if (previousValue && resumes.some(r => String(r.id) === previousValue)) {
            resumeSelect.value = previousValue;
        }
    } catch (err) {
        rbNotify("Failed to load resumes: " + err.message, "error");
    }
}

async function rbOnResumeSelectChange() {
    const resumeSelect = document.getElementById("resumeSelect");
    const id = resumeSelect.value;
    const duplicateBtn = document.getElementById("duplicateResumeBtn");
    const deleteBtn = document.getElementById("deleteResumeBtn");
    const noResumeNote = document.getElementById("noResumeNote");
    const matchScorePanel = document.getElementById("matchScorePanel");
    const matchScoreResult = document.getElementById("matchScoreResult");

    if (!id) {
        rbCurrentResumeId = null;
        rbSelectedBulletIds = new Set();
        if (duplicateBtn) duplicateBtn.disabled = true;
        if (deleteBtn) deleteBtn.disabled = true;
        if (noResumeNote) noResumeNote.classList.remove("hidden");
        if (matchScorePanel) matchScorePanel.classList.add("hidden");
        rbRenderWorkExperiences();
        return;
    }

    rbCurrentResumeId = parseInt(id);
    if (duplicateBtn) duplicateBtn.disabled = false;
    if (deleteBtn) deleteBtn.disabled = false;
    if (noResumeNote) noResumeNote.classList.add("hidden");
    if (matchScorePanel) matchScorePanel.classList.remove("hidden");
    if (matchScoreResult) matchScoreResult.classList.add("hidden");

    try {
        const resume = await apiRequest(`/resumes/${rbCurrentResumeId}`, "GET");
        rbSelectedBulletIds = new Set();
        (resume.workExperiences || []).forEach(exp => {
            (exp.selectedBullets || []).forEach(b => rbSelectedBulletIds.add(b.id));
        });
        rbRenderWorkExperiences();
    } catch (err) {
        rbNotify("Failed to load resume: " + err.message, "error");
    }
}

async function rbCreateNewResume() {
    const title = prompt('Name this resume version (e.g. "Backend - Google"):');
    if (!title) return;
    try {
        const created = await apiRequest("/resumes", "POST", { title });
        rbNotify("Resume created.", "success");
        await rbLoadResumes();
        const resumeSelect = document.getElementById("resumeSelect");
        resumeSelect.value = created.id;
        resumeSelect.dispatchEvent(new Event("change"));
    } catch (err) {
        rbNotify("Failed to create resume: " + err.message, "error");
    }
}

async function rbDuplicateResume() {
    if (!rbCurrentResumeId) return;
    try {
        const dup = await apiRequest(`/resumes/${rbCurrentResumeId}/duplicate`, "POST");
        rbNotify("Resume duplicated.", "success");
        await rbLoadResumes();
        const resumeSelect = document.getElementById("resumeSelect");
        resumeSelect.value = dup.id;
        resumeSelect.dispatchEvent(new Event("change"));
    } catch (err) {
        rbNotify("Failed to duplicate: " + err.message, "error");
    }
}

async function rbDeleteResume() {
    if (!rbCurrentResumeId) return;
    const confirmed = typeof showConfirm === "function"
        ? await showConfirm("Delete this resume version? Bullets in your content bank are unaffected.")
        : confirm("Delete this resume version? Bullets in your content bank are unaffected.");
    if (!confirmed) return;
    try {
        await apiRequest(`/resumes/${rbCurrentResumeId}`, "DELETE");
        rbNotify("Resume deleted.", "success");
        rbCurrentResumeId = null;
        rbSelectedBulletIds = new Set();
        await rbLoadResumes();
        const resumeSelect = document.getElementById("resumeSelect");
        resumeSelect.value = "";
        resumeSelect.dispatchEvent(new Event("change"));
    } catch (err) {
        rbNotify("Failed to delete: " + err.message, "error");
    }
}

async function rbToggleBullet(bulletId, checkboxEl) {
    if (!rbCurrentResumeId) return;
    try {
        const result = await apiRequest(`/resumes/${rbCurrentResumeId}/toggle-bullet/${bulletId}`, "POST");
        if (result.selected) {
            rbSelectedBulletIds.add(bulletId);
        } else {
            rbSelectedBulletIds.delete(bulletId);
        }
        checkboxEl.checked = result.selected;
    } catch (err) {
        rbNotify("Failed to toggle bullet: " + err.message, "error");
        checkboxEl.checked = !checkboxEl.checked;
    }
}

// ---------------------------------------------------------------
// MATCH SCORE  (MatchScoreResponseDto confirmed: score, matchedKeywords, missingKeywords)
// ---------------------------------------------------------------
async function rbCheckMatchScore() {
    if (!rbCurrentResumeId) return;
    const jdTextEl = document.getElementById("jdText");
    const text = jdTextEl.value.trim();
    if (!text) {
        rbNotify("Paste a job description first.", "error");
        return;
    }

    const btn = document.getElementById("checkScoreBtn");
    const originalLabel = btn.textContent;
    btn.textContent = "Checking...";
    btn.disabled = true;

    try {
        const result = await apiRequest(`/resumes/${rbCurrentResumeId}/match-score`, "POST", {
            jobDescriptionText: text
        });
        rbRenderMatchScore(result);
    } catch (err) {
        rbNotify("Failed to check match score: " + err.message, "error");
    } finally {
        btn.textContent = originalLabel;
        btn.disabled = false;
    }
}

function rbRenderMatchScore(result) {
    const score = result.score || 0;
    const missing = result.missingKeywords || [];
    const matched = result.matchedKeywords || [];

    const scoreValue = document.getElementById("scoreValue");
    scoreValue.textContent = Math.round(score) + "%";
    scoreValue.className = "font-display text-3xl font-bold" +
        (score >= 70 ? "text-emerald-400" : score >= 40 ? "text-amber-400" : "text-rose-400");

    document.getElementById("missingKeywords").innerHTML = missing.length
        ? missing.map(k => `<span class="px-2 py-1 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-lg text-[11px] font-bold">${rbEscapeHtml(k)}</span>`).join("")
        : `<span class="text-xs text-slate-500 font-medium">None — great coverage!</span>`;

    document.getElementById("matchedKeywords").innerHTML = matched.length
        ? matched.map(k => `<span class="px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded-lg text-[11px] font-bold">${rbEscapeHtml(k)}</span>`).join("")
        : `<span class="text-xs text-slate-500 font-medium">—</span>`;

    document.getElementById("matchScoreResult").classList.remove("hidden");
}