const API_BASE_URL = "http://localhost:8080/api";

// Stores/retrieves the JWT from the browser session
function saveToken(token) {
    sessionStorage.setItem("jwt_token", token);
}

function getToken() {
    return sessionStorage.getItem("jwt_token");
}

function clearToken() {
    sessionStorage.removeItem("jwt_token");
}

// Central fetch wrapper — automatically attaches the JWT if present. Supports FormData.
async function apiRequest(endpoint, method = "GET", body = null) {
    const headers = {};
    const token = getToken();
    if (token) {
        headers["Authorization"] = "Bearer " + token;
    }

    let requestBody = body;
    if (body && !(body instanceof FormData)) {
        headers["Content-Type"] = "application/json";
        requestBody = JSON.stringify(body);
    }

    const url = endpoint.startsWith("http")
        ? endpoint
        : endpoint.startsWith("/api")
            ? "http://localhost:8080" + endpoint
            : API_BASE_URL + (endpoint.startsWith("/") ? endpoint : "/" + endpoint);

    const response = await fetch(url, {
        method,
        headers,
        body: requestBody
    });

    // For auth endpoints, do NOT auto-redirect on 401 — let the caller handle the error
    const isAuthEndpoint = endpoint.startsWith("/auth/") || endpoint.startsWith("/api/auth/");

    if (!isAuthEndpoint && (response.status === 401 || response.status === 403)) {
        clearToken();
        window.location.href = "/login.html";
        return null;
    }

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Request failed");
    }

    if (response.status === 204) return null; // no content (e.g. DELETE)
    
    // In case the response is empty (e.g. standard ok with no body)
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
        return response.json();
    }
    return null;
}

// Helper to download files with authentication headers
async function apiDownloadFile(endpoint, fileName) {
    const token = getToken();
    const headers = {};
    if (token) {
        headers["Authorization"] = "Bearer " + token;
    }

    const requestUrl = endpoint.startsWith("http")
        ? endpoint
        : endpoint.startsWith("/api")
            ? "http://localhost:8080" + endpoint
            : API_BASE_URL + (endpoint.startsWith("/") ? endpoint : "/" + endpoint);

    const response = await fetch(requestUrl, {
        method: "GET",
        headers
    });

    if (response.status === 401 || response.status === 403) {
        clearToken();
        window.location.href = "/login.html";
        return;
    }

    if (!response.ok) {
        throw new Error("Download failed");
    }

    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = blobUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(blobUrl);
    document.body.removeChild(a);
}