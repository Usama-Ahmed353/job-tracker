// Lightweight toast notifications — replaces alert()/confirm() calls.
// Include this script on any page BEFORE the page-specific script (dashboard.js etc).

(function () {
    let container = document.querySelector(".toast-container");
    if (!container) {
        container = document.createElement("div");
        container.className = "toast-container";
        document.body.appendChild(container);
    }

    window.showToast = function (message, type = "info", duration = 3200) {
        const toast = document.createElement("div");
        toast.className = `toast ${type}`;
        toast.textContent = message;
        container.appendChild(toast);

        setTimeout(() => {
            toast.classList.add("hide");
            toast.addEventListener("animationend", () => toast.remove());
        }, duration);
    };

    // Promise-based confirm dialog styled like the rest of the app,
    // used in place of window.confirm(). Usage: await showConfirm("Delete this?")
    window.showConfirm = function (message, confirmLabel = "Delete") {
        return new Promise((resolve) => {
            const overlay = document.createElement("div");
            overlay.className = "modal-overlay active";
            overlay.innerHTML = `
                <div class="modal" style="max-width: 360px;">
                    <h3>Are you sure?</h3>
                    <p style="color: var(--ink-muted); font-size: 0.9rem; margin-bottom: 1.2rem;">${message}</p>
                    <div class="modal-actions">
                        <button class="btn-secondary" data-action="cancel">Cancel</button>
                        <button class="btn-primary" style="width:auto; padding:0.65rem 1.2rem; background: var(--stage-rejected);" data-action="confirm">${confirmLabel}</button>
                    </div>
                </div>
            `;
            document.body.appendChild(overlay);

            overlay.addEventListener("click", (e) => {
                if (e.target === overlay) { overlay.remove(); resolve(false); }
                const action = e.target.dataset.action;
                if (action === "cancel") { overlay.remove(); resolve(false); }
                if (action === "confirm") { overlay.remove(); resolve(true); }
            });
        });
    };
})();