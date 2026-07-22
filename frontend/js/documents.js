// let documentsList = [];
// let docLinks = {}; // docId -> Array of JobApplication objects
//
// async function loadDocumentsView() {
//     try {
//         // Fetch documents and applications in parallel
//         const [docs, apps] = await Promise.all([
//             apiRequest("/documents", "GET"),
//             apiRequest("/applications", "GET")
//         ]);
//
//         documentsList = docs || [];
//         const applications = apps || [];
//
//         // Build links mapping: for each application, fetch its documents
//         docLinks = {};
//         await Promise.all(
//             applications.map(async (app) => {
//                 try {
//                     const appDocs = await apiRequest(`/applications/${app.id}/documents`, "GET");
//                     if (appDocs) {
//                         appDocs.forEach(d => {
//                             if (!docLinks[d.id]) {
//                                 docLinks[d.id] = [];
//                             }
//                             // Store reference to the linked app
//                             docLinks[d.id].push(app);
//                         });
//                     }
//                 } catch (err) {
//                     console.error(`Error loading documents for application ${app.id}:`, err);
//                 }
//             })
//         );
//
//         renderDocumentsGrid();
//         populateAppSelectForLinking(applications);
//         populateDocSelectForLinking();
//     } catch (err) {
//         console.error("Failed to load documents view:", err);
//         showToast("Couldn't retrieve document records.", "error");
//     }
// }
//
// // Group documents by documentType and render
// function renderDocumentsGrid() {
//     const types = ["RESUME", "COVER_LETTER", "TRANSCRIPT", "OTHER"];
//     const containerIds = {
//         RESUME: "docs-resumes",
//         COVER_LETTER: "docs-covers",
//         TRANSCRIPT: "docs-transcripts",
//         OTHER: "docs-others"
//     };
//
//     const emptyMessages = {
//         RESUME: "No resumes uploaded yet.",
//         COVER_LETTER: "No cover letters uploaded yet.",
//         TRANSCRIPT: "No transcripts uploaded yet.",
//         OTHER: "No other document types uploaded."
//     };
//
//     types.forEach(type => {
//         const container = document.getElementById(containerIds[type]);
//         if (!container) return;
//         container.innerHTML = "";
//
//         const filtered = documentsList.filter(d => d.documentType === type);
//
//         if (filtered.length === 0) {
//             container.innerHTML = `
//                 <div class="empty-docs-placeholder">
//                     <p>${emptyMessages[type]}</p>
//                 </div>
//             `;
//             return;
//         }
//
//         filtered.forEach(doc => {
//             container.appendChild(createDocCard(doc));
//         });
//     });
// }
//
// function createDocCard(doc) {
//     const card = document.createElement("div");
//     card.className = "doc-item-card";
//
//     // Format date
//     const dateFormatted = doc.uploadedAt
//         ? new Date(doc.uploadedAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
//         : "Unknown";
//
//     // Format size
//     const kb = (doc.fileSizeBytes / 1024).toFixed(1);
//     const sizeStr = kb > 1000 ? (kb / 1024).toFixed(2) + " MB" : kb + " KB";
//
//     // Linked applications list
//     const linkedApps = docLinks[doc.id] || [];
//     let linksHtml = "";
//     if (linkedApps.length > 0) {
//         linksHtml = `<div class="doc-card-links">
//             <span class="links-label">Linked to:</span>
//             ${linkedApps.map(app => `
//                 <span class="linked-app-badge" title="${escapeHtml(app.jobRole)} at ${escapeHtml(app.companyName)}">
//                     ${escapeHtml(app.companyName)}
//                     <button class="unlink-btn" onclick="unlinkDocFromApp(${app.id}, ${doc.id}, event)">&times;</button>
//                 </span>
//             `).join('')}
//         </div>`;
//     } else {
//         linksHtml = `<div class="doc-card-links text-muted">
//             <span class="links-label">No job records linked.</span>
//         </div>`;
//     }
//
//     card.innerHTML = `
//         <div class="doc-card-header">
//             <div class="doc-card-icon">
//                 <i data-lucide="file-text"></i>
//             </div>
//             <div class="doc-card-details">
//                 <h4 class="doc-card-title" title="${escapeHtml(doc.fileName)}">${escapeHtml(doc.fileName)}</h4>
//                 <p class="doc-card-meta">${sizeStr} &bull; Uploaded ${dateFormatted}</p>
//             </div>
//         </div>
//         ${linksHtml}
//         <div class="doc-card-actions">
//             <button class="btn-doc-download" onclick="downloadDocument(${doc.id}, '${escapeJsString(doc.fileName)}')">
//                 <i data-lucide="download"></i> Download
//             </button>
//             <button class="btn-doc-delete" onclick="deleteDocument(${doc.id})">
//                 <i data-lucide="trash-2"></i> Delete
//             </button>
//         </div>
//     `;
//
//     // Process Lucide icons on card creation
//     if (window.lucide) {
//         window.lucide.createIcons({
//             attrs: {
//                 class: 'lucide-icon'
//             },
//             nodeList: card.querySelectorAll('[data-lucide]')
//         });
//     }
//
//     return card;
// }
//
// // Populators for linking form
// function populateAppSelectForLinking(applications) {
//     const select = document.getElementById("linkAppSelect");
//     if (!select) return;
//
//     select.innerHTML = '<option value="">-- Choose Job Application --</option>';
//     applications.forEach(app => {
//         const option = document.createElement("option");
//         option.value = app.id;
//         option.textContent = `${app.companyName} - ${app.jobRole} (${app.status.toLowerCase()})`;
//         select.appendChild(option);
//     });
// }
//
// function populateDocSelectForLinking() {
//     const select = document.getElementById("linkDocSelect");
//     if (!select) return;
//
//     select.innerHTML = '<option value="">-- Choose File --</option>';
//     documentsList.forEach(doc => {
//         const option = document.createElement("option");
//         option.value = doc.id;
//         option.textContent = `${doc.fileName} (${doc.documentType.toLowerCase().replace('_', ' ')})`;
//         select.appendChild(option);
//     });
// }
//
// // --- Upload Handler ---
// function initDocumentUpload() {
//     const dragZone = document.getElementById("docDragZone");
//     const fileInput = document.getElementById("docFileInput");
//     const uploadForm = document.getElementById("docUploadForm");
//
//     if (!dragZone || !fileInput || !uploadForm) return;
//
//     // Trigger click on input when dragzone is clicked
//     dragZone.onclick = () => fileInput.click();
//
//     dragZone.ondragover = (e) => {
//         e.preventDefault();
//         dragZone.classList.add("drag-over");
//     };
//
//     dragZone.ondragleave = () => {
//         dragZone.classList.remove("drag-over");
//     };
//
//     dragZone.ondrop = (e) => {
//         e.preventDefault();
//         dragZone.classList.remove("drag-over");
//         if (e.dataTransfer.files.length > 0) {
//             fileInput.files = e.dataTransfer.files;
//             updateDragZoneLabel(e.dataTransfer.files[0].name);
//         }
//     };
//
//     fileInput.onchange = () => {
//         if (fileInput.files.length > 0) {
//             updateDragZoneLabel(fileInput.files[0].name);
//         }
//     };
//
//     uploadForm.onsubmit = async (e) => {
//         e.preventDefault();
//
//         const file = fileInput.files[0];
//         const docType = document.getElementById("docTypeSelect").value;
//         const uploadBtn = uploadForm.querySelector("button[type='submit']");
//
//         if (!file) {
//             showToast("Please choose a file to upload.", "error");
//             return;
//         }
//         if (!docType) {
//             showToast("Please select a document type.", "error");
//             return;
//         }
//
//         // Validate file type (PDF/Word)
//         const allowedTypes = [
//             "application/pdf",
//             "application/msword",
//             "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
//         ];
//         if (!allowedTypes.includes(file.type)) {
//             showToast("Unsupported file type. Only PDF and Word files allowed.", "error");
//             return;
//         }
//
//         // Validate size (5MB)
//         if (file.size > 5 * 1024 * 1024) {
//             showToast("File is too large. Limit is 5MB.", "error");
//             return;
//         }
//
//         const formData = new FormData();
//         formData.append("file", file);
//         formData.append("documentType", docType);
//
//         uploadBtn.disabled = true;
//         uploadBtn.textContent = "Uploading...";
//
//         try {
//             await apiRequest("/documents", "POST", formData);
//             showToast("Document uploaded successfully!", "success");
//             uploadForm.reset();
//             resetDragZoneLabel();
//             await loadDocumentsView();
//         } catch (err) {
//             console.error("Upload failed:", err);
//             showToast("Upload failed: " + err.message, "error");
//         } finally {
//             uploadBtn.disabled = false;
//             uploadBtn.textContent = "Upload Document";
//         }
//     };
// }
//
// function updateDragZoneLabel(name) {
//     const label = document.querySelector("#docDragZone p");
//     if (label) {
//         label.innerHTML = `Selected file: <strong style="color:var(--primary);">${escapeHtml(name)}</strong>`;
//     }
// }
//
// function resetDragZoneLabel() {
//     const label = document.querySelector("#docDragZone p");
//     if (label) {
//         label.innerHTML = `Drag & drop your files here, or <span style="color:var(--primary); font-weight:600;">browse</span><br><span style="font-size:0.75rem; color:var(--ink-faint);">Supports PDF, DOC, DOCX up to 5MB</span>`;
//     }
// }
//
// // --- Linking Actions ---
// async function handleLinkSubmit(e) {
//     e.preventDefault();
//     const appId = document.getElementById("linkAppSelect").value;
//     const docId = document.getElementById("linkDocSelect").value;
//     const linkBtn = document.querySelector("#docLinkForm button[type='submit']");
//
//     if (!appId || !docId) {
//         showToast("Please select both a job application and a file.", "error");
//         return;
//     }
//
//     linkBtn.disabled = true;
//
//     try {
//         await apiRequest(`/applications/${appId}/documents/${docId}`, "POST");
//         showToast("Linked document to application!", "success");
//         document.getElementById("docLinkForm").reset();
//         await loadDocumentsView();
//     } catch (err) {
//         console.error("Linking failed:", err);
//         showToast("Failed to link: " + err.message, "error");
//     } finally {
//         linkBtn.disabled = false;
//     }
// }
//
// async function unlinkDocFromApp(appId, docId, event) {
//     if (event) event.stopPropagation();
//     const confirmed = await showConfirm("Unlink this document from the application?");
//     if (!confirmed) return;
//
//     try {
//         await apiRequest(`/applications/${appId}/documents/${docId}`, "DELETE");
//         showToast("Unlinked successfully", "info");
//         await loadDocumentsView();
//     } catch (err) {
//         console.error("Unlinking failed:", err);
//         showToast("Failed to unlink: " + err.message, "error");
//     }
// }
//
// // --- Download & Delete Actions ---
// async function downloadDocument(id, fileName) {
//     try {
//         await apiDownloadFile(`/documents/${id}/download`, fileName);
//         showToast("Download started", "success");
//     } catch (err) {
//         console.error("Download failed:", err);
//         showToast("Failed to download document.", "error");
//     }
// }
//
// async function deleteDocument(id) {
//     const confirmed = await showConfirm("Are you sure you want to delete this document permanently? All links to applications will be removed.");
//     if (!confirmed) return;
//
//     try {
//         await apiRequest(`/documents/${id}`, "DELETE");
//         showToast("Document deleted", "info");
//         await loadDocumentsView();
//     } catch (err) {
//         console.error("Deletion failed:", err);
//         showToast("Failed to delete document: " + err.message, "error");
//     }
// }
//
// // Utility escapers
// function escapeJsString(str) {
//     return str.replace(/'/g, "\\'").replace(/"/g, '\\"');
// }


let documentsList = [];
let docLinks = {}; // docId -> Array of JobApplication objects

async function loadDocumentsView() {
    try {
        // Fetch documents and applications in parallel
        const [docs, apps] = await Promise.all([
            apiRequest("/documents", "GET"),
            apiRequest("/applications", "GET")
        ]);

        documentsList = docs || [];
        const applications = apps || [];

        // Build links mapping: for each application, fetch its documents
        docLinks = {};
        await Promise.all(
            applications.map(async (app) => {
                try {
                    const appDocs = await apiRequest(`/applications/${app.id}/documents`, "GET");
                    if (appDocs) {
                        appDocs.forEach(d => {
                            if (!docLinks[d.id]) {
                                docLinks[d.id] = [];
                            }
                            // Store reference to the linked app
                            docLinks[d.id].push(app);
                        });
                    }
                } catch (err) {
                    console.error(`Error loading documents for application ${app.id}:`, err);
                }
            })
        );

        renderDocumentsGrid();
        populateAppSelectForLinking(applications);
        populateDocSelectForLinking();
    } catch (err) {
        console.error("Failed to load documents view:", err);
        showToast("Couldn't retrieve document records.", "error");
    }
}

// Group documents by documentType and render
function renderDocumentsGrid() {
    const types = ["RESUME", "COVER_LETTER", "TRANSCRIPT", "OTHER"];
    const containerIds = {
        RESUME: "docs-resumes",
        COVER_LETTER: "docs-covers",
        TRANSCRIPT: "docs-transcripts",
        OTHER: "docs-others"
    };

    const emptyMessages = {
        RESUME: "No resumes uploaded yet.",
        COVER_LETTER: "No cover letters uploaded yet.",
        TRANSCRIPT: "No transcripts uploaded yet.",
        OTHER: "No other document types uploaded."
    };

    types.forEach(type => {
        const container = document.getElementById(containerIds[type]);
        if (!container) return;
        container.innerHTML = "";

        const filtered = documentsList.filter(d => d.documentType === type);

        if (filtered.length === 0) {
            container.innerHTML = `
                <div class="empty-docs-placeholder">
                    <p>${emptyMessages[type]}</p>
                </div>
            `;
            return;
        }

        filtered.forEach(doc => {
            container.appendChild(createDocCard(doc));
        });
    });
}

function createDocCard(doc) {
    const card = document.createElement("div");
    card.className = "doc-item-card";

    // Format date
    const dateFormatted = doc.uploadedAt
        ? new Date(doc.uploadedAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
        : "Unknown";

    // Format size
    const kb = (doc.fileSizeBytes / 1024).toFixed(1);
    const sizeStr = kb > 1000 ? (kb / 1024).toFixed(2) + " MB" : kb + " KB";

    // Linked applications list
    const linkedApps = docLinks[doc.id] || [];
    let linksHtml = "";
    if (linkedApps.length > 0) {
        linksHtml = `<div class="doc-card-links">
            <span class="links-label">Linked to:</span>
            ${linkedApps.map(app => `
                <span class="linked-app-badge" title="${escapeHtml(app.jobRole)} at ${escapeHtml(app.companyName)}">
                    ${escapeHtml(app.companyName)}
                    <button class="unlink-btn" onclick="unlinkDocFromApp(${app.id}, ${doc.id}, event)">&times;</button>
                </span>
            `).join('')}
        </div>`;
    } else {
        linksHtml = `<div class="doc-card-links text-muted">
            <span class="links-label">No job records linked.</span>
        </div>`;
    }

    card.innerHTML = `
        <div class="doc-card-header">
            <div class="doc-card-icon">
                <i data-lucide="file-text"></i>
            </div>
            <div class="doc-card-details">
                <h4 class="doc-card-title" title="${escapeHtml(doc.fileName)}">${escapeHtml(doc.fileName)}</h4>
                <p class="doc-card-meta">${sizeStr} &bull; Uploaded ${dateFormatted}</p>
            </div>
        </div>
        ${linksHtml}
        <div class="doc-card-actions">
            <button class="btn-doc-download" onclick="downloadDocument(${doc.id}, '${escapeJsString(doc.fileName)}')">
                <i data-lucide="download"></i> Download
            </button>
            <button class="btn-doc-delete" onclick="deleteDocument(${doc.id})">
                <i data-lucide="trash-2"></i> Delete
            </button>
        </div>
    `;

    // Process Lucide icons on card creation
    if (window.lucide) {
        window.lucide.createIcons({
            attrs: {
                class: 'lucide-icon'
            },
            nodeList: card.querySelectorAll('[data-lucide]')
        });
    }

    return card;
}

// Populators for linking form
function populateAppSelectForLinking(applications) {
    const select = document.getElementById("linkAppSelect");
    if (!select) return;

    select.innerHTML = '<option value="">-- Choose Job Application --</option>';
    applications.forEach(app => {
        const option = document.createElement("option");
        option.value = app.id;
        option.textContent = `${app.companyName} - ${app.jobRole} (${app.status.toLowerCase()})`;
        select.appendChild(option);
    });
}

function populateDocSelectForLinking() {
    const select = document.getElementById("linkDocSelect");
    if (!select) return;

    select.innerHTML = '<option value="">-- Choose File --</option>';
    documentsList.forEach(doc => {
        const option = document.createElement("option");
        option.value = doc.id;
        option.textContent = `${doc.fileName} (${doc.documentType.toLowerCase().replace('_', ' ')})`;
        select.appendChild(option);
    });
}

// --- Upload Handler ---
function initDocumentUpload() {
    const dragZone = document.getElementById("docDragZone");
    const fileInput = document.getElementById("docFileInput");
    const uploadForm = document.getElementById("docUploadForm");

    if (!dragZone || !fileInput || !uploadForm) return;

    // Trigger click on input when dragzone is clicked
    dragZone.onclick = () => fileInput.click();

    dragZone.ondragover = (e) => {
        e.preventDefault();
        dragZone.classList.add("drag-over");
    };

    dragZone.ondragleave = () => {
        dragZone.classList.remove("drag-over");
    };

    dragZone.ondrop = (e) => {
        e.preventDefault();
        dragZone.classList.remove("drag-over");
        if (e.dataTransfer.files.length > 0) {
            fileInput.files = e.dataTransfer.files;
            updateDragZoneLabel(e.dataTransfer.files[0].name);
        }
    };

    fileInput.onchange = () => {
        if (fileInput.files.length > 0) {
            updateDragZoneLabel(fileInput.files[0].name);
        }
    };

    uploadForm.onsubmit = async (e) => {
        e.preventDefault();

        const file = fileInput.files[0];
        const docType = document.getElementById("docTypeSelect").value;
        const uploadBtn = uploadForm.querySelector("button[type='submit']");

        if (!file) {
            showToast("Please choose a file to upload.", "error");
            return;
        }
        if (!docType) {
            showToast("Please select a document type.", "error");
            return;
        }

        // Validate file type (PDF/Word)
        const allowedTypes = [
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ];
        if (!allowedTypes.includes(file.type)) {
            showToast("Unsupported file type. Only PDF and Word files allowed.", "error");
            return;
        }

        // Validate size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            showToast("File is too large. Limit is 5MB.", "error");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("documentType", docType);

        uploadBtn.disabled = true;
        uploadBtn.textContent = "Uploading...";

        try {
            await apiRequest("/documents", "POST", formData);
            showToast("Document uploaded successfully!", "success");
            uploadForm.reset();
            resetDragZoneLabel();
            await loadDocumentsView();
        } catch (err) {
            console.error("Upload failed:", err);
            showToast("Upload failed: " + err.message, "error");
        } finally {
            uploadBtn.disabled = false;
            uploadBtn.textContent = "Upload Document";
        }
    };
}

function updateDragZoneLabel(name) {
    const label = document.querySelector("#docDragZone p");
    if (label) {
        label.innerHTML = `Selected file: <strong style="color:var(--primary);">${escapeHtml(name)}</strong>`;
    }
}

function resetDragZoneLabel() {
    const label = document.querySelector("#docDragZone p");
    if (label) {
        label.innerHTML = `Drag & drop your files here, or <span style="color:var(--primary); font-weight:600;">browse</span><br><span style="font-size:0.75rem; color:var(--ink-faint);">Supports PDF, DOC, DOCX up to 5MB</span>`;
    }
}

// --- Linking Actions ---
async function handleLinkSubmit(e) {
    e.preventDefault();
    const appId = document.getElementById("linkAppSelect").value;
    const docId = document.getElementById("linkDocSelect").value;
    const linkBtn = document.querySelector("#docLinkForm button[type='submit']");

    if (!appId || !docId) {
        showToast("Please select both a job application and a file.", "error");
        return;
    }

    linkBtn.disabled = true;

    try {
        await apiRequest(`/applications/${appId}/documents/${docId}`, "POST");
        showToast("Linked document to application!", "success");
        document.getElementById("docLinkForm").reset();
        await loadDocumentsView();
    } catch (err) {
        console.error("Linking failed:", err);
        showToast("Failed to link: " + err.message, "error");
    } finally {
        linkBtn.disabled = false;
    }
}

async function unlinkDocFromApp(appId, docId, event) {
    if (event) event.stopPropagation();
    const confirmed = await showConfirm("Unlink this document from the application?");
    if (!confirmed) return;

    try {
        await apiRequest(`/applications/${appId}/documents/${docId}`, "DELETE");
        showToast("Unlinked successfully", "info");
        await loadDocumentsView();
    } catch (err) {
        console.error("Unlinking failed:", err);
        showToast("Failed to unlink: " + err.message, "error");
    }
}

// --- Download & Delete Actions ---
async function downloadDocument(id, fileName) {
    try {
        await apiDownloadFile(`/documents/${id}/download`, fileName);
        showToast("Download started", "success");
    } catch (err) {
        console.error("Download failed:", err);
        showToast("Failed to download document.", "error");
    }
}

async function deleteDocument(id) {
    const confirmed = await showConfirm("Are you sure you want to delete this document permanently? All links to applications will be removed.");
    if (!confirmed) return;

    try {
        await apiRequest(`/documents/${id}`, "DELETE");
        showToast("Document deleted", "info");
        await loadDocumentsView();
    } catch (err) {
        console.error("Deletion failed:", err);
        showToast("Failed to delete document: " + err.message, "error");
    }
}

// Utility escapers
function escapeJsString(str) {
    return str.replace(/'/g, "\\'").replace(/"/g, '\\"');
}
