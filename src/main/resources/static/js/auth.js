function showError(message) {
    const box = document.getElementById("errorBox");
    box.textContent = message;
    box.style.display = "block";
}

function hideError() {
    const box = document.getElementById("errorBox");
    box.style.display = "none";
}

function setButtonLoading(button, isLoading, loadingText, defaultText) {
    button.disabled = isLoading;
    button.textContent = isLoading ? loadingText : defaultText;
}

// ----- Register form -----
const registerForm = document.getElementById("registerForm");
if (registerForm) {
    const submitBtn = registerForm.querySelector('button[type="submit"]');

    registerForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        hideError();

        const fullName = document.getElementById("fullName").value;
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        setButtonLoading(submitBtn, true, "Creating account...", "Register");

        try {
            const data = await apiRequest("/auth/register", "POST", { fullName, email, password });
            if (data && data.accessToken) {
                saveToken(data.accessToken);
                if (data.refreshToken) sessionStorage.setItem("refresh_token", data.refreshToken);
                if (data.fullName) sessionStorage.setItem("user_name", data.fullName);
                if (data.email) sessionStorage.setItem("user_email", data.email);
                if (window.showToast) showToast("Account created — welcome!", "success");
                window.location.href = "/dashboard.html";
            } else {
                showError("Unexpected response from server. Please try again.");
                setButtonLoading(submitBtn, false, "", "Register");
            }
        } catch (err) {
            showError(err.message || "Couldn't create account. Try again.");
            setButtonLoading(submitBtn, false, "", "Register");
        }
    });
}

// ----- Login form -----
const loginForm = document.getElementById("loginForm");
if (loginForm) {
    const submitBtn = loginForm.querySelector('button[type="submit"]');

    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        hideError();

        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        setButtonLoading(submitBtn, true, "Logging in...", "Log In");

        try {
            const data = await apiRequest("/auth/login", "POST", { email, password });
            if (data && data.accessToken) {
                saveToken(data.accessToken);
                if (data.refreshToken) sessionStorage.setItem("refresh_token", data.refreshToken);
                if (data.fullName) sessionStorage.setItem("user_name", data.fullName);
                if (data.email) sessionStorage.setItem("user_email", data.email);
                if (window.showToast) showToast("Welcome back!", "success");
                window.location.href = "/dashboard.html";
            } else {
                showError("Invalid email or password");
                setButtonLoading(submitBtn, false, "", "Log In");
            }
        } catch (err) {
            showError("Invalid email or password");
            setButtonLoading(submitBtn, false, "", "Log In");
        }
    });
}