// let currentYear = new Date().getFullYear();
// let currentMonth = new Date().getMonth(); // 0-11
// let eventsList = [];
// let selectedDayKey = null; // YYYY-MM-DD format
//
// const EVENT_COLORS = {
//     INTERVIEW: '#F2A541',
//     ASSESSMENT: '#8F71E1',
//     FOLLOW_UP: '#205072',
//     DEADLINE: '#D64545',
//     OTHER: '#94A0AF'
// };
//
// async function loadCalendarView() {
//     try {
//         const [events, apps] = await Promise.all([
//             fetchEventsForCurrentMonth(),
//             apiRequest("/applications", "GET")
//         ]);
//
//         eventsList = events || [];
//         const applications = apps || [];
//
//         renderCalendarGrid();
//         renderEventList();
//         populateAppSelectForEvents(applications);
//     } catch (err) {
//         console.error("Failed to load calendar view:", err);
//         showToast("Error retrieving calendar events.", "error");
//     }
// }
//
// async function fetchEventsForCurrentMonth() {
//     const firstDay = new Date(currentYear, currentMonth, 1);
//     const lastDay = new Date(currentYear, currentMonth + 1, 0);
//
//     const pad = (num) => String(num).padStart(2, '0');
//     const fromStr = `${currentYear}-${pad(currentMonth + 1)}-01T00:00:00`;
//     const toStr = `${currentYear}-${pad(currentMonth + 1)}-${pad(lastDay.getDate())}T23:59:59`;
//
//     return apiRequest(`/events?from=${encodeURIComponent(fromStr)}&to=${encodeURIComponent(toStr)}`, "GET");
// }
//
// function renderCalendarGrid() {
//     const gridContainer = document.getElementById("calendarGrid");
//     const monthYearLabel = document.getElementById("calendarMonthYear");
//     if (!gridContainer || !monthYearLabel) return;
//
//     gridContainer.innerHTML = "";
//
//     const months = [
//         "January", "February", "March", "April", "May", "June",
//         "July", "August", "September", "October", "November", "December"
//     ];
//     monthYearLabel.textContent = `${months[currentMonth]} ${currentYear}`;
//
//     const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
//     const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();
//     const prevMonthTotalDays = new Date(currentYear, currentMonth, 0).getDate();
//
//     // 1. Previous month buffer days
//     for (let i = firstDayIndex - 1; i >= 0; i--) {
//         const dayNum = prevMonthTotalDays - i;
//         const cell = document.createElement("div");
//         cell.className = "calendar-day buffer-day";
//         cell.innerHTML = `<span class="day-num">${dayNum}</span>`;
//         gridContainer.appendChild(cell);
//     }
//
//     // 2. Current month days
//     const pad = (num) => String(num).padStart(2, '0');
//     const today = new Date();
//     const todayKey = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
//
//     for (let day = 1; day <= totalDays; day++) {
//         const cell = document.createElement("div");
//         cell.className = "calendar-day";
//
//         const dateKey = `${currentYear}-${pad(currentMonth + 1)}-${pad(day)}`;
//         cell.dataset.date = dateKey;
//
//         if (dateKey === todayKey) cell.classList.add("today");
//         if (dateKey === selectedDayKey) cell.classList.add("selected");
//
//         cell.innerHTML = `<span class="day-num">${day}</span>`;
//
//         const dayEvents = eventsList.filter(e => e.eventDatetime.split('T')[0] === dateKey);
//
//         if (dayEvents.length > 0) {
//             const dotsContainer = document.createElement("div");
//             dotsContainer.className = "day-event-dots";
//             dayEvents.forEach(ev => {
//                 const dot = document.createElement("span");
//                 dot.className = "event-dot";
//                 dot.style.backgroundColor = EVENT_COLORS[ev.eventType] || EVENT_COLORS.OTHER;
//                 dot.title = ev.title;
//                 dotsContainer.appendChild(dot);
//             });
//             cell.appendChild(dotsContainer);
//         }
//
//         cell.onclick = () => {
//             document.querySelectorAll(".calendar-day").forEach(c => c.classList.remove("selected"));
//             cell.classList.add("selected");
//             selectedDayKey = dateKey;
//             renderEventList();
//         };
//
//         gridContainer.appendChild(cell);
//     }
//
//     // 3. Next month buffer days
//     const totalCells = firstDayIndex + totalDays;
//     const remainingCells = 42 - totalCells;
//     for (let day = 1; day <= remainingCells; day++) {
//         const cell = document.createElement("div");
//         cell.className = "calendar-day buffer-day";
//         cell.innerHTML = `<span class="day-num">${day}</span>`;
//         gridContainer.appendChild(cell);
//     }
// }
//
// function renderEventList() {
//     const listContainer = document.getElementById("dayEventsList");
//     if (!listContainer) return;
//
//     listContainer.innerHTML = "";
//
//     const activeLabel = document.getElementById("selectedDateLabel");
//     if (selectedDayKey) {
//         const [y, m, d] = selectedDayKey.split('-');
//         const dateObj = new Date(y, m - 1, d);
//         activeLabel.textContent = dateObj.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
//     } else {
//         activeLabel.textContent = "All Month Events";
//     }
//
//     const filteredEvents = selectedDayKey
//         ? eventsList.filter(e => e.eventDatetime.split('T')[0] === selectedDayKey)
//         : eventsList;
//
//     filteredEvents.sort((a, b) => new Date(a.eventDatetime) - new Date(b.eventDatetime));
//
//     if (filteredEvents.length === 0) {
//         listContainer.innerHTML = `
//             <div class="text-center py-8 text-slate-400 text-xs font-medium">
//                 <p>No events scheduled ${selectedDayKey ? "for this day" : "this month"}.</p>
//             </div>
//         `;
//         return;
//     }
//
//     filteredEvents.forEach(ev => {
//         const item = document.createElement("div");
//         item.className = `p-4 rounded-xl border border-slate-200 bg-slate-50 relative flex flex-col gap-1.5 shadow-xs transition-all ${ev.completed ? 'opacity-60 bg-slate-100' : ''}`;
//         item.style.borderLeftWidth = "4px";
//         item.style.borderLeftColor = EVENT_COLORS[ev.eventType] || EVENT_COLORS.OTHER;
//
//         const timeFormatted = new Date(ev.eventDatetime).toLocaleTimeString(undefined, {
//             hour: '2-digit',
//             minute: '2-digit'
//         });
//
//         const appTag = ev.companyName
//             ? `<span class="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-500 bg-slate-200/60 px-1.5 py-0.5 rounded">
//                 <i data-lucide="briefcase" class="w-3 h-3"></i>${escapeHtml(ev.companyName)}
//                </span>`
//             : "";
//
//         const locationHtml = ev.locationOrLink
//             ? (ev.locationOrLink.startsWith("http")
//                 ? `<p class="text-xs text-indigo-600 font-medium flex items-center gap-1 mt-1"><i data-lucide="link" class="w-3.5 h-3.5"></i> <a href="${escapeHtml(ev.locationOrLink)}" target="_blank" class="hover:underline">Join Meeting</a></p>`
//                 : `<p class="text-xs text-slate-500 font-medium flex items-center gap-1 mt-1"><i data-lucide="map-pin" class="w-3.5 h-3.5 text-slate-400"></i> ${escapeHtml(ev.locationOrLink)}</p>`)
//             : "";
//
//         // Fixed Button Structures to force visibility
//         item.innerHTML = `
//             <div class="flex items-start justify-between gap-2">
//                 <div class="flex flex-wrap items-center gap-1.5">
//                     <span class="text-xs font-bold text-slate-700">${timeFormatted}</span>
//                     <span class="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.25 rounded" style="background-color: ${EVENT_COLORS[ev.eventType]}15; color: ${EVENT_COLORS[ev.eventType]};">
//                         ${ev.eventType.toLowerCase()}
//                     </span>
//                     ${appTag}
//                 </div>
//                 <div class="flex items-center gap-2">
//                     <button class="btn-complete text-emerald-600 hover:bg-emerald-50 px-2 py-0.5 text-[10px] font-bold rounded border border-emerald-200 transition-all ${ev.completed ? 'hidden' : ''}">
//                         ✓ Done
//                     </button>
//                     <button class="btn-delete text-rose-600 hover:bg-rose-50 px-2 py-0.5 text-[10px] font-bold rounded border border-rose-200 transition-all">
//                         ✕ Delete
//                     </button>
//                 </div>
//             </div>
//             <h4 class="text-sm font-bold text-slate-900 ${ev.completed ? 'line-through text-slate-400' : ''}">${escapeHtml(ev.title)}</h4>
//             ${ev.description ? `<p class="text-xs text-slate-500 leading-relaxed font-medium">${escapeHtml(ev.description)}</p>` : ""}
//             ${locationHtml}
//         `;
//
//         item.querySelector(".btn-complete")?.addEventListener("click", () => completeCalendarEvent(ev.id));
//         item.querySelector(".btn-delete")?.addEventListener("click", () => deleteCalendarEvent(ev.id));
//
//         if (window.lucide) {
//             window.lucide.createIcons({
//                 attrs: { class: 'lucide-icon' },
//                 nodeList: item.querySelectorAll('[data-lucide]')
//             });
//         }
//
//         listContainer.appendChild(item);
//     });
// }
//
// function populateAppSelectForEvents(applications) {
//     const select = document.getElementById("eventAppSelect");
//     if (!select) return;
//
//     select.innerHTML = '<option value="">-- Standalone Event (None) --</option>';
//     applications.forEach(app => {
//         const option = document.createElement("option");
//         option.value = app.id;
//         option.textContent = `${app.companyName} - ${app.jobRole}`;
//         select.appendChild(option);
//     });
// }
//
// async function prevMonth() {
//     currentMonth--;
//     if (currentMonth < 0) {
//         currentMonth = 11;
//         currentYear--;
//     }
//     selectedDayKey = null;
//     await loadCalendarView();
// }
//
// async function nextMonth() {
//     currentMonth++;
//     if (currentMonth > 11) {
//         currentMonth = 0;
//         currentYear++;
//     }
//     selectedDayKey = null;
//     await loadCalendarView();
// }
//
// function openEventModal() {
//     const modal = document.getElementById("eventModalOverlay");
//     if (!modal) return;
//
//     if (selectedDayKey) {
//         document.getElementById("eventDatetime").value = `${selectedDayKey}T12:00`;
//     } else {
//         const now = new Date();
//         const pad = (n) => String(n).padStart(2, '0');
//         document.getElementById("eventDatetime").value = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T12:00`;
//     }
//
//     modal.classList.add("active");
// }
//
// function closeEventModal() {
//     const modal = document.getElementById("eventModalOverlay");
//     if (modal) {
//         modal.classList.remove("active");
//         document.getElementById("eventForm").reset();
//     }
// }
//
// async function handleEventSubmit(e) {
//     e.preventDefault();
//     const payload = {
//         title: document.getElementById("eventTitle").value,
//         eventType: document.getElementById("eventTypeSelect").value,
//         eventDatetime: document.getElementById("eventDatetime").value,
//         locationOrLink: document.getElementById("eventLocation").value,
//         description: document.getElementById("eventDesc").value,
//         applicationId: document.getElementById("eventAppSelect").value ? parseInt(document.getElementById("eventAppSelect").value) : null
//     };
//
//     const submitBtn = document.querySelector("#eventForm button[type='submit']");
//     submitBtn.disabled = true;
//
//     try {
//         await apiRequest("/events", "POST", payload);
//         showToast("Calendar event created!", "success");
//         closeEventModal();
//         await loadCalendarView();
//     } catch (err) {
//         showToast("Error creating event: " + err.message, "error");
//     } finally {
//         submitBtn.disabled = false;
//     }
// }
//
// async function completeCalendarEvent(id) {
//     try {
//         await apiRequest(`/events/${id}/complete`, "PATCH");
//         showToast("Event marked as completed!", "success");
//         await loadCalendarView();
//     } catch (err) {
//         showToast("Error completing event: " + err.message, "error");
//     }
// }
//
// async function deleteCalendarEvent(id) {
//     // Replaced custom showConfirm with native window.confirm to avoid script blocking
//     const confirmed = window.confirm("Are you sure you want to delete this calendar event permanently?");
//     if (!confirmed) return;
//
//     try {
//         await apiRequest(`/events/${id}`, "DELETE");
//         showToast("Event removed successfully", "info");
//         await loadCalendarView();
//     } catch (err) {
//         showToast("Error deleting event: " + err.message, "error");
//     }
//
// }


let currentYear = new Date().getFullYear();
let currentMonth = new Date().getMonth(); // 0-11
let eventsList = [];
let selectedDayKey = null; // YYYY-MM-DD format

const EVENT_COLORS = {
    INTERVIEW: '#F2A541',
    ASSESSMENT: '#8F71E1',
    FOLLOW_UP: '#205072',
    DEADLINE: '#D64545',
    OTHER: '#94A0AF'
};

async function loadCalendarView() {
    try {
        const [events, apps] = await Promise.all([
            fetchEventsForCurrentMonth(),
            apiRequest("/applications", "GET")
        ]);

        eventsList = events || [];
        const applications = apps || [];

        renderCalendarGrid();
        renderEventList();
        populateAppSelectForEvents(applications);
    } catch (err) {
        console.error("Failed to load calendar view:", err);
        showToast("Error retrieving calendar events.", "error");
    }
}

async function fetchEventsForCurrentMonth() {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);

    const pad = (num) => String(num).padStart(2, '0');
    const fromStr = `${currentYear}-${pad(currentMonth + 1)}-01T00:00:00`;
    const toStr = `${currentYear}-${pad(currentMonth + 1)}-${pad(lastDay.getDate())}T23:59:59`;

    return apiRequest(`/events?from=${encodeURIComponent(fromStr)}&to=${encodeURIComponent(toStr)}`, "GET");
}

function renderCalendarGrid() {
    const gridContainer = document.getElementById("calendarGrid");
    const monthYearLabel = document.getElementById("calendarMonthYear");
    if (!gridContainer || !monthYearLabel) return;

    gridContainer.innerHTML = "";

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    monthYearLabel.textContent = `${months[currentMonth]} ${currentYear}`;

    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
    const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();
    const prevMonthTotalDays = new Date(currentYear, currentMonth, 0).getDate();

    // 1. Previous month buffer days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
        const dayNum = prevMonthTotalDays - i;
        const cell = document.createElement("div");
        cell.className = "calendar-day buffer-day";
        cell.innerHTML = `<span class="day-num">${dayNum}</span>`;
        gridContainer.appendChild(cell);
    }

    // 2. Current month days
    const pad = (num) => String(num).padStart(2, '0');
    const today = new Date();
    const todayKey = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;

    for (let day = 1; day <= totalDays; day++) {
        const cell = document.createElement("div");
        cell.className = "calendar-day";

        const dateKey = `${currentYear}-${pad(currentMonth + 1)}-${pad(day)}`;
        cell.dataset.date = dateKey;

        if (dateKey === todayKey) cell.classList.add("today");
        if (dateKey === selectedDayKey) cell.classList.add("selected");

        cell.innerHTML = `<span class="day-num">${day}</span>`;

        const dayEvents = eventsList.filter(e => e.eventDatetime.split('T')[0] === dateKey);

        if (dayEvents.length > 0) {
            const dotsContainer = document.createElement("div");
            dotsContainer.className = "day-event-dots";
            dayEvents.forEach(ev => {
                const dot = document.createElement("span");
                dot.className = "event-dot";
                dot.style.backgroundColor = EVENT_COLORS[ev.eventType] || EVENT_COLORS.OTHER;
                dot.title = ev.title;
                dotsContainer.appendChild(dot);
            });
            cell.appendChild(dotsContainer);
        }

        cell.onclick = () => {
            document.querySelectorAll(".calendar-day").forEach(c => c.classList.remove("selected"));
            cell.classList.add("selected");
            selectedDayKey = dateKey;
            renderEventList();
        };

        gridContainer.appendChild(cell);
    }

    // 3. Next month buffer days
    const totalCells = firstDayIndex + totalDays;
    const remainingCells = 42 - totalCells;
    for (let day = 1; day <= remainingCells; day++) {
        const cell = document.createElement("div");
        cell.className = "calendar-day buffer-day";
        cell.innerHTML = `<span class="day-num">${day}</span>`;
        gridContainer.appendChild(cell);
    }
}

function renderEventList() {
    const listContainer = document.getElementById("dayEventsList");
    if (!listContainer) return;

    listContainer.innerHTML = "";

    const activeLabel = document.getElementById("selectedDateLabel");
    if (selectedDayKey) {
        const [y, m, d] = selectedDayKey.split('-');
        const dateObj = new Date(y, m - 1, d);
        activeLabel.textContent = dateObj.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
    } else {
        activeLabel.textContent = "All Month Events";
    }

    const filteredEvents = selectedDayKey
        ? eventsList.filter(e => e.eventDatetime.split('T')[0] === selectedDayKey)
        : eventsList;

    filteredEvents.sort((a, b) => new Date(a.eventDatetime) - new Date(b.eventDatetime));

    if (filteredEvents.length === 0) {
        listContainer.innerHTML = `
            <div class="text-center py-8 text-slate-500 text-xs font-medium">
                <p>No events scheduled ${selectedDayKey ? "for this day" : "this month"}.</p>
            </div>
        `;
        return;
    }

    filteredEvents.forEach(ev => {
        const item = document.createElement("div");
        item.className = `p-4 rounded-xl border border-white/10 bg-white/[0.05] relative flex flex-col gap-1.5 shadow-xs transition-all ${ev.completed ? 'opacity-60 bg-white/10' : ''}`;
        item.style.borderLeftWidth = "4px";
        item.style.borderLeftColor = EVENT_COLORS[ev.eventType] || EVENT_COLORS.OTHER;

        const timeFormatted = new Date(ev.eventDatetime).toLocaleTimeString(undefined, {
            hour: '2-digit',
            minute: '2-digit'
        });

        const appTag = ev.companyName
            ? `<span class="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-400 bg-slate-200/60 px-1.5 py-0.5 rounded">
                <i data-lucide="briefcase" class="w-3 h-3"></i>${escapeHtml(ev.companyName)}
               </span>`
            : "";

        const locationHtml = ev.locationOrLink
            ? (ev.locationOrLink.startsWith("http")
                ? `<p class="text-xs text-indigo-400 font-medium flex items-center gap-1 mt-1"><i data-lucide="link" class="w-3.5 h-3.5"></i> <a href="${escapeHtml(ev.locationOrLink)}" target="_blank" class="hover:underline">Join Meeting</a></p>`
                : `<p class="text-xs text-slate-400 font-medium flex items-center gap-1 mt-1"><i data-lucide="map-pin" class="w-3.5 h-3.5 text-slate-500"></i> ${escapeHtml(ev.locationOrLink)}</p>`)
            : "";

        // Fixed Button Structures to force visibility
        item.innerHTML = `
            <div class="flex items-start justify-between gap-2">
                <div class="flex flex-wrap items-center gap-1.5">
                    <span class="text-xs font-bold text-slate-200">${timeFormatted}</span>
                    <span class="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.25 rounded" style="background-color: ${EVENT_COLORS[ev.eventType]}15; color: ${EVENT_COLORS[ev.eventType]};">
                        ${ev.eventType.toLowerCase()}
                    </span>
                    ${appTag}
                </div>
                <div class="flex items-center gap-2">
                    <button class="btn-complete text-emerald-400 hover:bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold rounded border border-emerald-200 transition-all ${ev.completed ?'hidden' : ''}">
                        ✓ Done
                    </button>
                    <button class="btn-delete text-rose-400 hover:bg-rose-500/10 px-2 py-0.5 text-[10px] font-bold rounded border border-rose-200 transition-all">
                        ✕ Delete
                    </button>
                </div>
            </div>
            <h4 class="text-sm font-bold text-white ${ev.completed ?'line-through text-slate-400' : ''}">${escapeHtml(ev.title)}</h4>
            ${ev.description ? `<p class="text-xs text-slate-400 leading-relaxed font-medium">${escapeHtml(ev.description)}</p>` : ""}
            ${locationHtml}
        `;

        item.querySelector(".btn-complete")?.addEventListener("click", () => completeCalendarEvent(ev.id));
        item.querySelector(".btn-delete")?.addEventListener("click", () => deleteCalendarEvent(ev.id));

        if (window.lucide) {
            window.lucide.createIcons({
                attrs: { class: 'lucide-icon' },
                nodeList: item.querySelectorAll('[data-lucide]')
            });
        }

        listContainer.appendChild(item);
    });
}

function populateAppSelectForEvents(applications) {
    const select = document.getElementById("eventAppSelect");
    if (!select) return;

    select.innerHTML = '<option value="">-- Standalone Event (None) --</option>';
    applications.forEach(app => {
        const option = document.createElement("option");
        option.value = app.id;
        option.textContent = `${app.companyName} - ${app.jobRole}`;
        select.appendChild(option);
    });
}

async function prevMonth() {
    currentMonth--;
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }
    selectedDayKey = null;
    await loadCalendarView();
}

async function nextMonth() {
    currentMonth++;
    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    selectedDayKey = null;
    await loadCalendarView();
}

function openEventModal() {
    const modal = document.getElementById("eventModalOverlay");
    if (!modal) return;

    if (selectedDayKey) {
        document.getElementById("eventDatetime").value = `${selectedDayKey}T12:00`;
    } else {
        const now = new Date();
        const pad = (n) => String(n).padStart(2, '0');
        document.getElementById("eventDatetime").value = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T12:00`;
    }

    modal.classList.add("active");
}

function closeEventModal() {
    const modal = document.getElementById("eventModalOverlay");
    if (modal) {
        modal.classList.remove("active");
        document.getElementById("eventForm").reset();
    }
}

async function handleEventSubmit(e) {
    e.preventDefault();
    const payload = {
        title: document.getElementById("eventTitle").value,
        eventType: document.getElementById("eventTypeSelect").value,
        eventDatetime: document.getElementById("eventDatetime").value,
        locationOrLink: document.getElementById("eventLocation").value,
        description: document.getElementById("eventDesc").value,
        applicationId: document.getElementById("eventAppSelect").value ? parseInt(document.getElementById("eventAppSelect").value) : null
    };

    const submitBtn = document.querySelector("#eventForm button[type='submit']");
    submitBtn.disabled = true;

    try {
        await apiRequest("/events", "POST", payload);
        showToast("Calendar event created!", "success");
        closeEventModal();
        await loadCalendarView();
    } catch (err) {
        showToast("Error creating event: " + err.message, "error");
    } finally {
        submitBtn.disabled = false;
    }
}

async function completeCalendarEvent(id) {
    try {
        await apiRequest(`/events/${id}/complete`, "PATCH");
        showToast("Event marked as completed!", "success");
        await loadCalendarView();
    } catch (err) {
        showToast("Error completing event: " + err.message, "error");
    }
}

async function deleteCalendarEvent(id) {
    // Replaced custom showConfirm with native window.confirm to avoid script blocking
    const confirmed = window.confirm("Are you sure you want to delete this calendar event permanently?");
    if (!confirmed) return;

    try {
        await apiRequest(`/events/${id}`, "DELETE");
        showToast("Event removed successfully", "info");
        await loadCalendarView();
    } catch (err) {
        showToast("Error deleting event: " + err.message, "error");
    }

}