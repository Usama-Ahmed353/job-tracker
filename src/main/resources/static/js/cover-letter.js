let clDraftsCache = [];
let currentClDraftId = null;

async function loadCoverLetterBuilderView() {
    clearCoverLetterEditorWorkspace();
    await fetchSavedCoverLetterDraftsList();

    // Auto-populate profile information bank placeholders if present
    const cachedName = document.getElementById("cvFullName")?.value || "";
    const cachedEmail = document.getElementById("cvEmail")?.value || "";
    if (cachedName || cachedEmail) {
        console.log("Profile data loaded into workspace safely.");
    }
}

function clearCoverLetterEditorWorkspace() {
    document.getElementById("clJobDescription").value = "";
    document.getElementById("clEditorContent").innerHTML = `<p class="text-slate-400 font-sans italic">Your custom tailored cover letter will populate here after you click "Generate Cover Letter"...</p>`;
    currentClDraftId = null;
}

async function fetchSavedCoverLetterDraftsList() {
    const container = document.getElementById("clSavedDraftsContainer");
    if (!container) return;

    try {
        const allDocs = await apiRequest("/documents", "GET") || [];
        clDraftsCache = allDocs.filter(d => d.documentType === "COVER_LETTER");

        container.innerHTML = "";
        if (clDraftsCache.length === 0) {
            container.innerHTML = `<p class="text-slate-400 font-medium text-[11px] py-2 italic text-center">No cover letter drafts archived yet.</p>`;
            return;
        }

        clDraftsCache.forEach(draft => {
            const dateStr = new Date(draft.uploadedAt).toLocaleDateString(undefined, {month: 'short', day: 'numeric'});
            const div = document.createElement("div");
            div.className = "p-2.5 bg-white/[0.05] border border-white/10 rounded-xl flex items-center justify-between gap-2 hover:bg-white/[0.08] transition-all cursor-pointer text-white";
            div.onclick = () => loadDraftIntoWorkspace(draft.id);
            div.innerHTML = `
                <div class="min-w-0 flex-1">
                    <p class="font-bold text-slate-200 truncate">${escapeHtml(draft.fileName)}</p>
                    <p class="text-[10px] text-slate-400 font-semibold uppercase">${dateStr}</p>
                </div>
                <button onclick="deleteCoverLetterDraftVersion(${draft.id}, event)" class="text-slate-400 hover:text-rose-400 transition-all font-bold p-1">&times;</button>
            `;
            container.appendChild(div);
        });
    } catch(err) {
        console.error("Failed to load archived cover letters list:", err);
    }
}

async function generateCoverLetterDraft() {
    const jdText = document.getElementById("clJobDescription").value.trim();
    const generateBtn = document.getElementById("clGenerateBtn");
    const editor = document.getElementById("clEditorContent");

    if (!jdText) {
        showToast("Please enter the target job description details.", "error");
        return;
    }

    generateBtn.disabled = true;
    generateBtn.textContent = "AI Is Reviewing Profiles...";
    editor.innerHTML = `<p class="text-slate-400 font-sans animate-pulse italic">Gemini is synthesizing content banks and tailoring paragraphs line-by-line...</p>`;

    try {
        const response = await apiRequest("/applications/generate-cover-letter", "POST", { jobDescription: jdText });
        editor.innerHTML = response.content.replace(/\n/g, "<br>");
        showToast("Cover letter generated successfully!", "success");
    } catch (err) {
        editor.innerHTML = `<p class="text-rose-500 font-sans text-xs font-semibold">Failed to process engine request sequence: ${err.message}</p>`;
        showToast("Generation sequence failed.", "error");
    } finally {
        generateBtn.disabled = false;
        generateBtn.textContent = "Generate Cover Letter";
    }
}

async function loadDraftIntoWorkspace(id) {
    const match = clDraftsCache.find(d => d.id === id);
    if (!match) return;
    currentClDraftId = id;
    try {
        const response = await apiRequest(`/documents/${id}/text-content`, "GET");
        document.getElementById("clEditorContent").innerHTML = response.content.replace(/\n/g, "<br>");
        showToast("Loaded selected draft snapshot.", "info");
    } catch (err) {
        showToast("Failed to pull text contents.", "error");
    }
}

async function saveCoverLetterDraftText() {
    const rawContent = document.getElementById("clEditorContent").innerText.trim();
    if (!rawContent || rawContent.startsWith("Your custom tailored")) {
        showToast("There is no structural document content typed out inside the layout frame yet.", "error");
        return;
    }

    const titleInput = window.prompt("Enter a storage descriptor filename for this version:", "AI_Cover_Letter_Draft.txt");
    if (!titleInput) return;

    try {
        const payload = {
            fileName: titleInput.endsWith(".txt") ? titleInput : titleInput + ".txt",
            content: rawContent
        };
        await apiRequest("/documents/save-text-draft", "POST", payload);
        showToast("Draft safely archived to database cluster!", "success");
        await fetchSavedCoverLetterDraftsList();
    } catch (err) {
        showToast("Storage capture failed: " + err.message, "error");
    }
}

function downloadCoverLetterAsPdf() {
    const element = document.getElementById("clEditorContent");
    const options = {
        margin:       1,
        filename:     'Tailored_Cover_Letter.pdf',
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2 },
        jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    html2pdf().set(options).from(element).save();
}

async function deleteCoverLetterDraftVersion(id, event) {
    if (event) event.stopPropagation();
    const check = window.confirm("Delete this generated document file from database permanence logs permanently?");
    if (!check) return;
    try {
        await apiRequest(`/documents/${id}`, "DELETE");
        showToast("Draft element destroyed", "info");
        if (currentClDraftId === id) clearCoverLetterEditorWorkspace();
        await fetchSavedCoverLetterDraftsList();
    } catch (err) {
        showToast("Deletion layer error thrown: " + err.message, "error");
    }
}