async function loadSettingsView() {
    try {
        const goals = await apiRequest("/analytics/goals-progress", "GET");
        if (goals) {
            document.getElementById("settingsWeeklyGoal").value = goals.weeklyGoal || "";
            document.getElementById("settingsMonthlyGoal").value = goals.monthlyGoal || "";
        }
    } catch (err) {
        console.error("Failed to load settings:", err);
        showToast("Could not retrieve existing goal values.", "error");
    }
}

async function handleSettingsSubmit(e) {
    e.preventDefault();
    
    const weeklyGoalVal = document.getElementById("settingsWeeklyGoal").value;
    const monthlyGoalVal = document.getElementById("settingsMonthlyGoal").value;

    const weeklyGoal = weeklyGoalVal ? parseInt(weeklyGoalVal) : null;
    const monthlyGoal = monthlyGoalVal ? parseInt(monthlyGoalVal) : null;

    if (weeklyGoal !== null && weeklyGoal < 0) {
        showToast("Weekly goal cannot be negative.", "error");
        return;
    }
    if (monthlyGoal !== null && monthlyGoal < 0) {
        showToast("Monthly goal cannot be negative.", "error");
        return;
    }

    const submitBtn = document.querySelector("#settingsForm button[type='submit']");
    submitBtn.disabled = true;
    submitBtn.textContent = "Saving...";

    try {
        await apiRequest("/users/me/goals", "PUT", {
            weeklyGoal,
            monthlyGoal
        });
        showToast("Application goals updated successfully!", "success");
        await loadSettingsView();
    } catch (err) {
        console.error("Failed to save goals:", err);
        showToast("Failed to save goals: " + err.message, "error");
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "Save Changes";
    }
}
