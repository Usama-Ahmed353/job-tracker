// // // Global Chart instances to prevent canvas re-use errors
// // let trendChartInstance = null;
// // let statusChartInstance = null;
// // let platformChartInstance = null;
// //
// // let useMockData = false;
// //
// // // Mock data generator for fallback showcase
// // const MOCK_DATA = {
// //     summary: {
// //         totalApplications: 48,
// //         activePipeline: 18,
// //         responseRatePct: 37.5,
// //         offerRatePct: 8.3
// //     },
// //     trends: [
// //         { periodLabel: "Jan", count: 4 },
// //         { periodLabel: "Feb", count: 8 },
// //         { periodLabel: "Mar", count: 12 },
// //         { periodLabel: "Apr", count: 9 },
// //         { periodLabel: "May", count: 15 },
// //         { periodLabel: "Jun", count: 11 },
// //         { periodLabel: "Jul", count: 19 }
// //     ],
// //     byStatus: [
// //         { status: "WISHLIST", count: 6 },
// //         { status: "APPLIED", count: 14 },
// //         { status: "ASSESSMENT", count: 5 },
// //         { status: "INTERVIEW", count: 7 },
// //         { status: "OFFER", count: 4 },
// //         { status: "REJECTED", count: 10 },
// //         { status: "WITHDRAWN", count: 2 }
// //     ],
// //     byPlatform: [
// //         { platform: "LINKEDIN", totalApplications: 22, offers: 2, successRatePct: 9.1 },
// //         { platform: "INDEED", totalApplications: 12, offers: 1, successRatePct: 8.3 },
// //         { platform: "COMPANY_WEBSITE", totalApplications: 8, offers: 1, successRatePct: 12.5 },
// //         { platform: "REFERRAL", totalApplications: 4, offers: 0, successRatePct: 0.0 },
// //         { platform: "OTHER", totalApplications: 2, offers: 0, successRatePct: 0.0 }
// //     ],
// //     goals: {
// //         weeklyGoal: 5,
// //         appliedThisWeek: 4,
// //         monthlyGoal: 20,
// //         appliedThisMonth: 15
// //     }
// // };
// //
// // async function loadAnalytics() {
// //     try {
// //         let summaryData, trendsData, statusData, platformData, goalsData;
// //
// //         if (useMockData) {
// //             summaryData = MOCK_DATA.summary;
// //             trendsData = MOCK_DATA.trends;
// //             statusData = MOCK_DATA.byStatus;
// //             platformData = MOCK_DATA.byPlatform;
// //             goalsData = MOCK_DATA.goals;
// //         } else {
// //             // Fetch live data from backend
// //             summaryData = await apiRequest("/analytics/summary", "GET");
// //             trendsData = await apiRequest("/analytics/trends?period=monthly", "GET");
// //             platformData = await apiRequest("/analytics/by-platform", "GET");
// //             statusData = await apiRequest("/analytics/by-status", "GET");
// //             goalsData = await apiRequest("/analytics/goals-progress", "GET");
// //
// //             // Auto-fallback to mock data if there are no applications in the live DB
// //             if (!summaryData || summaryData.totalApplications === 0) {
// //                 console.log("No live data found, falling back to showcase mock data");
// //                 useMockData = true;
// //                 document.getElementById("mockDataWarning").style.display = "flex";
// //                 loadAnalytics();
// //                 return;
// //             } else {
// //                 document.getElementById("mockDataWarning").style.display = "none";
// //             }
// //         }
// //
// //         renderKPICards(summaryData);
// //         renderGoalsProgress(goalsData);
// //         renderTrendChart(trendsData);
// //         renderStatusChart(statusData);
// //         renderPlatformChart(platformData);
// //
// //     } catch (err) {
// //         console.error("Failed to load analytics:", err);
// //         showToast("Error retrieving analytics metrics. Falling back to mock data.", "error");
// //         useMockData = true;
// //         document.getElementById("mockDataWarning").style.display = "flex";
// //         loadAnalytics();
// //     }
// // }
// //
// // function toggleMockData(enable) {
// //     useMockData = enable;
// //     document.getElementById("mockDataWarning").style.display = enable ? "flex" : "none";
// //     loadAnalytics();
// // }
// //
// // function renderKPICards(summary) {
// //     document.getElementById("kpiTotal").textContent = summary.totalApplications;
// //     document.getElementById("kpiActive").textContent = summary.activePipeline;
// //     document.getElementById("kpiResponseRate").textContent = summary.responseRatePct.toFixed(1) + "%";
// //     document.getElementById("kpiOfferRate").textContent = summary.offerRatePct.toFixed(1) + "%";
// // }
// //
// // function renderGoalsProgress(goals) {
// //     const weeklyGoalVal = goals.weeklyGoal || 0;
// //     const weeklyPct = weeklyGoalVal > 0 ? Math.min(100, Math.round((goals.appliedThisWeek / weeklyGoalVal) * 100)) : 0;
// //
// //     document.getElementById("weeklyGoalText").innerHTML = `
// //         <strong>${goals.appliedThisWeek}</strong> / ${weeklyGoalVal || "—"} applications
// //     `;
// //     const weeklyBar = document.getElementById("weeklyGoalBar");
// //     weeklyBar.style.width = weeklyPct + "%";
// //     weeklyBar.textContent = weeklyPct > 10 ? weeklyPct + "%" : "";
// //
// //     const monthlyGoalVal = goals.monthlyGoal || 0;
// //     const monthlyPct = monthlyGoalVal > 0 ? Math.min(100, Math.round((goals.appliedThisMonth / monthlyGoalVal) * 100)) : 0;
// //
// //     document.getElementById("monthlyGoalText").innerHTML = `
// //         <strong>${goals.appliedThisMonth}</strong> / ${monthlyGoalVal || "—"} applications
// //     `;
// //     const monthlyBar = document.getElementById("monthlyGoalBar");
// //     monthlyBar.style.width = monthlyPct + "%";
// //     monthlyBar.textContent = monthlyPct > 10 ? monthlyPct + "%" : "";
// // }
// //
// // function renderTrendChart(trends) {
// //     const ctx = document.getElementById("trendChart").getContext("2d");
// //
// //     if (trendChartInstance) {
// //         trendChartInstance.destroy();
// //     }
// //
// //     const labels = trends.map(t => t.periodLabel);
// //     const data = trends.map(t => t.count);
// //
// //     trendChartInstance = new Chart(ctx, {
// //         type: 'line',
// //         data: {
// //             labels: labels,
// //             datasets: [{
// //                 label: 'Applications Submitted',
// //                 data: data,
// //                 borderColor: '#205072',
// //                 backgroundColor: 'rgba(32, 80, 114, 0.1)',
// //                 borderWidth: 3,
// //                 fill: true,
// //                 tension: 0.35,
// //                 pointBackgroundColor: '#F2A541',
// //                 pointBorderColor: '#fff',
// //                 pointHoverRadius: 7
// //             }]
// //         },
// //         options: {
// //             responsive: true,
// //             maintainAspectRatio: false,
// //             plugins: {
// //                 legend: { display: false }
// //             },
// //             scales: {
// //                 y: {
// //                     beginAtZero: true,
// //                     ticks: { stepSize: 1, color: '#94A0AF' },
// //                     grid: { color: '#EEF1F6' }
// //                 },
// //                 x: {
// //                     ticks: { color: '#94A0AF' },
// //                     grid: { display: false }
// //                 }
// //             }
// //         }
// //     });
// // }
// //
// // function renderStatusChart(statusCounts) {
// //     const ctx = document.getElementById("statusChart").getContext("2d");
// //
// //     if (statusChartInstance) {
// //         statusChartInstance.destroy();
// //     }
// //
// //     const colorMap = {
// //         WISHLIST: '#94A0AF',
// //         APPLIED: '#6B7A99',
// //         ASSESSMENT: '#8F71E1',
// //         INTERVIEW: '#F2A541',
// //         OFFER: '#2F9E58',
// //         REJECTED: '#D64545',
// //         WITHDRAWN: '#A3B1C6'
// //     };
// //
// //     const labels = statusCounts.map(s => s.status.charAt(0) + s.status.slice(1).toLowerCase());
// //     const data = statusCounts.map(s => s.count);
// //     const backgroundColors = statusCounts.map(s => colorMap[s.status] || '#DFE3EA');
// //
// //     statusChartInstance = new Chart(ctx, {
// //         type: 'doughnut',
// //         data: {
// //             labels: labels,
// //             datasets: [{
// //                 data: data,
// //                 backgroundColor: backgroundColors,
// //                 borderWidth: 2,
// //                 borderColor: '#ffffff',
// //                 hoverOffset: 4
// //             }]
// //         },
// //         options: {
// //             responsive: true,
// //             maintainAspectRatio: false,
// //             plugins: {
// //                 legend: {
// //                     position: 'right',
// //                     labels: {
// //                         color: '#15181F',
// //                         font: { family: 'Inter', size: 12 },
// //                         padding: 15
// //                     }
// //                 }
// //             },
// //             cutout: '65%'
// //         }
// //     });
// // }
// //
// // function renderPlatformChart(platformStats) {
// //     const ctx = document.getElementById("platformChart").getContext("2d");
// //
// //     if (platformChartInstance) {
// //         platformChartInstance.destroy();
// //     }
// //
// //     const labels = platformStats.map(p => p.platform.replace('_', ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase()));
// //     const totalApps = platformStats.map(p => p.totalApplications);
// //     const successRates = platformStats.map(p => p.successRatePct);
// //
// //     platformChartInstance = new Chart(ctx, {
// //         type: 'bar',
// //         data: {
// //             labels: labels,
// //             datasets: [
// //                 {
// //                     label: 'Total Applications',
// //                     data: totalApps,
// //                     backgroundColor: 'rgba(32, 80, 114, 0.7)',
// //                     borderColor: '#205072',
// //                     borderWidth: 1,
// //                     yAxisID: 'y'
// //                 },
// //                 {
// //                     label: 'Offer Success Rate (%)',
// //                     data: successRates,
// //                     backgroundColor: 'rgba(242, 165, 65, 0.7)',
// //                     borderColor: '#F2A541',
// //                     borderWidth: 1,
// //                     yAxisID: 'yPercent'
// //                 }
// //             ]
// //         },
// //         options: {
// //             responsive: true,
// //             maintainAspectRatio: false,
// //             plugins: {
// //                 legend: { position: 'top', labels: { color: '#15181F' } }
// //             },
// //             scales: {
// //                 y: {
// //                     type: 'linear',
// //                     display: true,
// //                     position: 'left',
// //                     title: { display: true, text: 'Applications Count', color: '#5B6472' },
// //                     ticks: { color: '#94A0AF', stepSize: 1 },
// //                     grid: { color: '#EEF1F6' }
// //                 },
// //                 yPercent: {
// //                     type: 'linear',
// //                     display: true,
// //                     position: 'right',
// //                     title: { display: true, text: 'Success Rate %', color: '#5B6472' },
// //                     ticks: { color: '#94A0AF', callback: value => value + "%" },
// //                     grid: { drawOnChartArea: false } // only draw grid lines for first y axis
// //                 },
// //                 x: {
// //                     ticks: { color: '#94A0AF' },
// //                     grid: { display: false }
// //                 }
// //             }
// //         }
// //     });
// // }
// //
// //
// //
// //
// //
// //
// //
//
//
//
//
// // Global Chart instances to prevent canvas re-use errors
// let trendChartInstance = null;
// let statusChartInstance = null;
// let platformChartInstance = null;
//
// let useMockData = false;
//
// // Mock data generator for fallback showcase
// const MOCK_DATA = {
//     summary: {
//         totalApplications: 48,
//         activePipeline: 18,
//         responseRatePct: 37.5,
//         offerRatePct: 8.3
//     },
//     trends: [
//         { periodLabel: "Jan", count: 4 },
//         { periodLabel: "Feb", count: 8 },
//         { periodLabel: "Mar", count: 12 },
//         { periodLabel: "Apr", count: 9 },
//         { periodLabel: "May", count: 15 },
//         { periodLabel: "Jun", count: 11 },
//         { periodLabel: "Jul", count: 19 }
//     ],
//     byStatus: [
//         { status: "WISHLIST", count: 6 },
//         { status: "APPLIED", count: 14 },
//         { status: "ASSESSMENT", count: 5 },
//         { status: "INTERVIEW", count: 7 },
//         { status: "OFFER", count: 4 },
//         { status: "REJECTED", count: 10 },
//         { status: "WITHDRAWN", count: 2 }
//     ],
//     byPlatform: [
//         { platform: "LINKEDIN", totalApplications: 22, offers: 2, successRatePct: 9.1 },
//         { platform: "INDEED", totalApplications: 12, offers: 1, successRatePct: 8.3 },
//         { platform: "COMPANY_WEBSITE", totalApplications: 8, offers: 1, successRatePct: 12.5 },
//         { platform: "REFERRAL", totalApplications: 4, offers: 0, successRatePct: 0.0 },
//         { platform: "OTHER", totalApplications: 2, offers: 0, successRatePct: 0.0 }
//     ],
//     goals: {
//         weeklyGoal: 5,
//         appliedThisWeek: 4,
//         monthlyGoal: 20,
//         appliedThisMonth: 15
//     }
// };
//
// async function loadAnalytics() {
//     try {
//         let summaryData, trendsData, statusData, platformData, goalsData;
//
//         if (useMockData) {
//             summaryData = MOCK_DATA.summary;
//             trendsData = MOCK_DATA.trends;
//             statusData = MOCK_DATA.byStatus;
//             platformData = MOCK_DATA.byPlatform;
//             goalsData = MOCK_DATA.goals;
//         } else {
//             // Fetch live data from backend
//             summaryData = await apiRequest("/analytics/summary", "GET");
//             trendsData = await apiRequest("/analytics/trends?period=monthly", "GET");
//             platformData = await apiRequest("/analytics/by-platform", "GET");
//             statusData = await apiRequest("/analytics/by-status", "GET");
//             goalsData = await apiRequest("/analytics/goals-progress", "GET");
//
//             // Auto-fallback to mock data if there are no applications in the live DB
//             if (!summaryData || summaryData.totalApplications === 0) {
//                 console.log("No live data found, falling back to showcase mock data");
//                 useMockData = true;
//                 document.getElementById("mockDataWarning").classList.remove("hidden");
//                 document.getElementById("mockDataWarning").classList.add("flex");
//                 loadAnalytics();
//                 return;
//             } else {
//                 document.getElementById("mockDataWarning").classList.add("hidden");
//                 document.getElementById("mockDataWarning").classList.remove("flex");
//             }
//         }
//
//         renderKPICards(summaryData);
//         renderGoalsProgress(goalsData);
//         renderTrendChart(trendsData);
//         renderStatusChart(statusData);
//         renderPlatformChart(platformData);
//
//     } catch (err) {
//         console.error("Failed to load analytics:", err);
//         showToast("Error retrieving analytics metrics. Falling back to mock data.", "error");
//         useMockData = true;
//         document.getElementById("mockDataWarning").classList.remove("hidden");
//         document.getElementById("mockDataWarning").classList.add("flex");
//         loadAnalytics();
//     }
// }
//
// function toggleMockData(enable) {
//     useMockData = enable;
//     if (enable) {
//         document.getElementById("mockDataWarning").classList.remove("hidden");
//         document.getElementById("mockDataWarning").classList.add("flex");
//     } else {
//         document.getElementById("mockDataWarning").classList.add("hidden");
//         document.getElementById("mockDataWarning").classList.remove("flex");
//     }
//     loadAnalytics();
// }
//
// function renderKPICards(summary) {
//     document.getElementById("kpiTotal").textContent = summary.totalApplications;
//     document.getElementById("kpiActive").textContent = summary.activePipeline;
//     document.getElementById("kpiResponseRate").textContent = summary.responseRatePct.toFixed(1) + "%";
//     document.getElementById("kpiOfferRate").textContent = summary.offerRatePct.toFixed(1) + "%";
// }
//
// function renderGoalsProgress(goals) {
//     const weeklyGoalVal = goals.weeklyGoal || 0;
//     const weeklyPct = weeklyGoalVal > 0 ? Math.min(100, Math.round((goals.appliedThisWeek / weeklyGoalVal) * 100)) : 0;
//
//     document.getElementById("weeklyGoalPercent").textContent = weeklyPct + "%";
//     document.getElementById("weeklyGoalText").innerHTML = `
//         <strong>${goals.appliedThisWeek}</strong> / ${weeklyGoalVal || "—"} applications targets completed
//     `;
//     const weeklyBar = document.getElementById("weeklyGoalBar");
//     weeklyBar.style.width = weeklyPct + "%";
//
//     const monthlyGoalVal = goals.monthlyGoal || 0;
//     const monthlyPct = monthlyGoalVal > 0 ? Math.min(100, Math.round((goals.appliedThisMonth / monthlyGoalVal) * 100)) : 0;
//
//     document.getElementById("monthlyGoalPercent").textContent = monthlyPct + "%";
//     document.getElementById("monthlyGoalText").innerHTML = `
//         <strong>${goals.appliedThisMonth}</strong> / ${monthlyGoalVal || "—"} applications targets completed
//     `;
//     const monthlyBar = document.getElementById("monthlyGoalBar");
//     monthlyBar.style.width = monthlyPct + "%";
// }
//
// function renderTrendChart(trends) {
//     const ctx = document.getElementById("trendChart").getContext("2d");
//
//     if (trendChartInstance) {
//         trendChartInstance.destroy();
//     }
//
//     const labels = trends.map(t => t.periodLabel);
//     const data = trends.map(t => t.count);
//
//     trendChartInstance = new Chart(ctx, {
//         type: 'line',
//         data: {
//             labels: labels,
//             datasets: [{
//                 label: 'Applications Submitted',
//                 data: data,
//                 borderColor: '#4f46e5',
//                 backgroundColor: 'rgba(79, 70, 229, 0.05)',
//                 borderWidth: 3,
//                 fill: true,
//                 tension: 0.35,
//                 pointBackgroundColor: '#f59e0b',
//                 pointBorderColor: '#fff',
//                 pointHoverRadius: 7
//             }]
//         },
//         options: {
//             responsive: true,
//             maintainAspectRatio: false,
//             plugins: {
//                 legend: { display: false }
//             },
//             scales: {
//                 y: {
//                     beginAtZero: true,
//                     ticks: { stepSize: 1, color: '#94a3b8' },
//                     grid: { color: '#f1f5f9' }
//                 },
//                 x: {
//                     ticks: { color: '#94a3b8' },
//                     grid: { display: false }
//                 }
//             }
//         }
//     });
// }
//
// function renderStatusChart(statusCounts) {
//     const ctx = document.getElementById("statusChart").getContext("2d");
//
//     if (statusChartInstance) {
//         statusChartInstance.destroy();
//     }
//
//     const colorMap = {
//         WISHLIST: '#94a3b8',
//         APPLIED: '#3b82f6',
//         ASSESSMENT: '#a855f7',
//         INTERVIEW: '#f59e0b',
//         OFFER: '#10b981',
//         REJECTED: '#ef4444',
//         WITHDRAWN: '#71717a'
//     };
//
//     const labels = statusCounts.map(s => s.status.charAt(0) + s.status.slice(1).toLowerCase());
//     const data = statusCounts.map(s => s.count);
//     const backgroundColors = statusCounts.map(s => colorMap[s.status] || '#cbd5e1');
//
//     statusChartInstance = new Chart(ctx, {
//         type: 'doughnut',
//         data: {
//             labels: labels,
//             datasets: [{
//                 data: data,
//                 backgroundColor: backgroundColors,
//                 borderWidth: 2,
//                 borderColor: '#ffffff',
//                 hoverOffset: 4
//             }]
//         },
//         options: {
//             responsive: true,
//             maintainAspectRatio: false,
//             plugins: {
//                 legend: {
//                     position: 'right',
//                     labels: {
//                         color: '#0f172a',
//                         font: { family: 'Inter', size: 11, weight: '500' },
//                         padding: 10
//                     }
//                 }
//             },
//             cutout: '70%'
//         }
//     });
// }
//
// function renderPlatformChart(platformStats) {
//     const ctx = document.getElementById("platformChart").getContext("2d");
//
//     if (platformChartInstance) {
//         platformChartInstance.destroy();
//     }
//
//     const labels = platformStats.map(p => p.platform.replace('_', ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase()));
//     const totalApps = platformStats.map(p => p.totalApplications);
//     const successRates = platformStats.map(p => p.successRatePct);
//
//     platformChartInstance = new Chart(ctx, {
//         type: 'bar',
//         data: {
//             labels: labels,
//             datasets: [
//                 {
//                     label: 'Total Applications',
//                     data: totalApps,
//                     backgroundColor: 'rgba(79, 70, 229, 0.8)',
//                     borderColor: '#4f46e5',
//                     borderWidth: 1,
//                     yAxisID: 'y'
//                 },
//                 {
//                     label: 'Offer Success Rate (%)',
//                     data: successRates,
//                     backgroundColor: 'rgba(245, 158, 11, 0.8)',
//                     borderColor: '#f59e0b',
//                     borderWidth: 1,
//                     yAxisID: 'yPercent'
//                 }
//             ]
//         },
//         options: {
//             responsive: true,
//             maintainAspectRatio: false,
//             plugins: {
//                 legend: { position: 'top', labels: { color: '#0f172a', font: { size: 11, weight: '500' } } }
//             },
//             scales: {
//                 y: {
//                     type: 'linear',
//                     display: true,
//                     position: 'left',
//                     title: { display: true, text: 'Applications Count', color: '#475569', font: { size: 10, weight: '600' } },
//                     ticks: { color: '#94a3b8', stepSize: 1 },
//                     grid: { color: '#f1f5f9' }
//                 },
//                 yPercent: {
//                     type: 'linear',
//                     display: true,
//                     position: 'right',
//                     title: { display: true, text: 'Success Rate %', color: '#475569', font: { size: 10, weight: '600' } },
//                     ticks: { color: '#94a3b8', callback: value => value + "%" },
//                     grid: { drawOnChartArea: false }
//                 },
//                 x: {
//                     ticks: { color: '#94a3b8', font: { size: 10 } },
//                     grid: { display: false }
//                 }
//             }
//         }
//     });
// }


// // Global Chart instances to prevent canvas re-use errors
// let trendChartInstance = null;
// let statusChartInstance = null;
// let platformChartInstance = null;
//
// let useMockData = false;
//
// // Mock data generator for fallback showcase
// const MOCK_DATA = {
//     summary: {
//         totalApplications: 48,
//         activePipeline: 18,
//         responseRatePct: 37.5,
//         offerRatePct: 8.3
//     },
//     trends: [
//         { periodLabel: "Jan", count: 4 },
//         { periodLabel: "Feb", count: 8 },
//         { periodLabel: "Mar", count: 12 },
//         { periodLabel: "Apr", count: 9 },
//         { periodLabel: "May", count: 15 },
//         { periodLabel: "Jun", count: 11 },
//         { periodLabel: "Jul", count: 19 }
//     ],
//     byStatus: [
//         { status: "WISHLIST", count: 6 },
//         { status: "APPLIED", count: 14 },
//         { status: "ASSESSMENT", count: 5 },
//         { status: "INTERVIEW", count: 7 },
//         { status: "OFFER", count: 4 },
//         { status: "REJECTED", count: 10 },
//         { status: "WITHDRAWN", count: 2 }
//     ],
//     byPlatform: [
//         { platform: "LINKEDIN", totalApplications: 22, offers: 2, successRatePct: 9.1 },
//         { platform: "INDEED", totalApplications: 12, offers: 1, successRatePct: 8.3 },
//         { platform: "COMPANY_WEBSITE", totalApplications: 8, offers: 1, successRatePct: 12.5 },
//         { platform: "REFERRAL", totalApplications: 4, offers: 0, successRatePct: 0.0 },
//         { platform: "OTHER", totalApplications: 2, offers: 0, successRatePct: 0.0 }
//     ],
//     goals: {
//         weeklyGoal: 5,
//         appliedThisWeek: 4,
//         monthlyGoal: 20,
//         appliedThisMonth: 15
//     }
// };
//
// async function loadAnalytics() {
//     try {
//         let summaryData, trendsData, statusData, platformData, goalsData;
//
//         if (useMockData) {
//             summaryData = MOCK_DATA.summary;
//             trendsData = MOCK_DATA.trends;
//             statusData = MOCK_DATA.byStatus;
//             platformData = MOCK_DATA.byPlatform;
//             goalsData = MOCK_DATA.goals;
//         } else {
//             // Fetch live data from backend
//             summaryData = await apiRequest("/analytics/summary", "GET");
//             trendsData = await apiRequest("/analytics/trends?period=monthly", "GET");
//             platformData = await apiRequest("/analytics/by-platform", "GET");
//             statusData = await apiRequest("/analytics/by-status", "GET");
//             goalsData = await apiRequest("/analytics/goals-progress", "GET");
//
//             // Auto-fallback to mock data if there are no applications in the live DB
//             if (!summaryData || summaryData.totalApplications === 0) {
//                 console.log("No live data found, falling back to showcase mock data");
//                 useMockData = true;
//                 document.getElementById("mockDataWarning").style.display = "flex";
//                 loadAnalytics();
//                 return;
//             } else {
//                 document.getElementById("mockDataWarning").style.display = "none";
//             }
//         }
//
//         renderKPICards(summaryData);
//         renderGoalsProgress(goalsData);
//         renderTrendChart(trendsData);
//         renderStatusChart(statusData);
//         renderPlatformChart(platformData);
//
//     } catch (err) {
//         console.error("Failed to load analytics:", err);
//         showToast("Error retrieving analytics metrics. Falling back to mock data.", "error");
//         useMockData = true;
//         document.getElementById("mockDataWarning").style.display = "flex";
//         loadAnalytics();
//     }
// }
//
// function toggleMockData(enable) {
//     useMockData = enable;
//     document.getElementById("mockDataWarning").style.display = enable ? "flex" : "none";
//     loadAnalytics();
// }
//
// function renderKPICards(summary) {
//     document.getElementById("kpiTotal").textContent = summary.totalApplications;
//     document.getElementById("kpiActive").textContent = summary.activePipeline;
//     document.getElementById("kpiResponseRate").textContent = summary.responseRatePct.toFixed(1) + "%";
//     document.getElementById("kpiOfferRate").textContent = summary.offerRatePct.toFixed(1) + "%";
// }
//
// function renderGoalsProgress(goals) {
//     const weeklyGoalVal = goals.weeklyGoal || 0;
//     const weeklyPct = weeklyGoalVal > 0 ? Math.min(100, Math.round((goals.appliedThisWeek / weeklyGoalVal) * 100)) : 0;
//
//     document.getElementById("weeklyGoalText").innerHTML = `
//         <strong>${goals.appliedThisWeek}</strong> / ${weeklyGoalVal || "—"} applications
//     `;
//     const weeklyBar = document.getElementById("weeklyGoalBar");
//     weeklyBar.style.width = weeklyPct + "%";
//     weeklyBar.textContent = weeklyPct > 10 ? weeklyPct + "%" : "";
//
//     const monthlyGoalVal = goals.monthlyGoal || 0;
//     const monthlyPct = monthlyGoalVal > 0 ? Math.min(100, Math.round((goals.appliedThisMonth / monthlyGoalVal) * 100)) : 0;
//
//     document.getElementById("monthlyGoalText").innerHTML = `
//         <strong>${goals.appliedThisMonth}</strong> / ${monthlyGoalVal || "—"} applications
//     `;
//     const monthlyBar = document.getElementById("monthlyGoalBar");
//     monthlyBar.style.width = monthlyPct + "%";
//     monthlyBar.textContent = monthlyPct > 10 ? monthlyPct + "%" : "";
// }
//
// function renderTrendChart(trends) {
//     const ctx = document.getElementById("trendChart").getContext("2d");
//
//     if (trendChartInstance) {
//         trendChartInstance.destroy();
//     }
//
//     const labels = trends.map(t => t.periodLabel);
//     const data = trends.map(t => t.count);
//
//     trendChartInstance = new Chart(ctx, {
//         type: 'line',
//         data: {
//             labels: labels,
//             datasets: [{
//                 label: 'Applications Submitted',
//                 data: data,
//                 borderColor: '#205072',
//                 backgroundColor: 'rgba(32, 80, 114, 0.1)',
//                 borderWidth: 3,
//                 fill: true,
//                 tension: 0.35,
//                 pointBackgroundColor: '#F2A541',
//                 pointBorderColor: '#fff',
//                 pointHoverRadius: 7
//             }]
//         },
//         options: {
//             responsive: true,
//             maintainAspectRatio: false,
//             plugins: {
//                 legend: { display: false }
//             },
//             scales: {
//                 y: {
//                     beginAtZero: true,
//                     ticks: { stepSize: 1, color: '#94A0AF' },
//                     grid: { color: '#EEF1F6' }
//                 },
//                 x: {
//                     ticks: { color: '#94A0AF' },
//                     grid: { display: false }
//                 }
//             }
//         }
//     });
// }
//
// function renderStatusChart(statusCounts) {
//     const ctx = document.getElementById("statusChart").getContext("2d");
//
//     if (statusChartInstance) {
//         statusChartInstance.destroy();
//     }
//
//     const colorMap = {
//         WISHLIST: '#94A0AF',
//         APPLIED: '#6B7A99',
//         ASSESSMENT: '#8F71E1',
//         INTERVIEW: '#F2A541',
//         OFFER: '#2F9E58',
//         REJECTED: '#D64545',
//         WITHDRAWN: '#A3B1C6'
//     };
//
//     const labels = statusCounts.map(s => s.status.charAt(0) + s.status.slice(1).toLowerCase());
//     const data = statusCounts.map(s => s.count);
//     const backgroundColors = statusCounts.map(s => colorMap[s.status] || '#DFE3EA');
//
//     statusChartInstance = new Chart(ctx, {
//         type: 'doughnut',
//         data: {
//             labels: labels,
//             datasets: [{
//                 data: data,
//                 backgroundColor: backgroundColors,
//                 borderWidth: 2,
//                 borderColor: '#ffffff',
//                 hoverOffset: 4
//             }]
//         },
//         options: {
//             responsive: true,
//             maintainAspectRatio: false,
//             plugins: {
//                 legend: {
//                     position: 'right',
//                     labels: {
//                         color: '#15181F',
//                         font: { family: 'Inter', size: 12 },
//                         padding: 15
//                     }
//                 }
//             },
//             cutout: '65%'
//         }
//     });
// }
//
// function renderPlatformChart(platformStats) {
//     const ctx = document.getElementById("platformChart").getContext("2d");
//
//     if (platformChartInstance) {
//         platformChartInstance.destroy();
//     }
//
//     const labels = platformStats.map(p => p.platform.replace('_', ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase()));
//     const totalApps = platformStats.map(p => p.totalApplications);
//     const successRates = platformStats.map(p => p.successRatePct);
//
//     platformChartInstance = new Chart(ctx, {
//         type: 'bar',
//         data: {
//             labels: labels,
//             datasets: [
//                 {
//                     label: 'Total Applications',
//                     data: totalApps,
//                     backgroundColor: 'rgba(32, 80, 114, 0.7)',
//                     borderColor: '#205072',
//                     borderWidth: 1,
//                     yAxisID: 'y'
//                 },
//                 {
//                     label: 'Offer Success Rate (%)',
//                     data: successRates,
//                     backgroundColor: 'rgba(242, 165, 65, 0.7)',
//                     borderColor: '#F2A541',
//                     borderWidth: 1,
//                     yAxisID: 'yPercent'
//                 }
//             ]
//         },
//         options: {
//             responsive: true,
//             maintainAspectRatio: false,
//             plugins: {
//                 legend: { position: 'top', labels: { color: '#15181F' } }
//             },
//             scales: {
//                 y: {
//                     type: 'linear',
//                     display: true,
//                     position: 'left',
//                     title: { display: true, text: 'Applications Count', color: '#5B6472' },
//                     ticks: { color: '#94A0AF', stepSize: 1 },
//                     grid: { color: '#EEF1F6' }
//                 },
//                 yPercent: {
//                     type: 'linear',
//                     display: true,
//                     position: 'right',
//                     title: { display: true, text: 'Success Rate %', color: '#5B6472' },
//                     ticks: { color: '#94A0AF', callback: value => value + "%" },
//                     grid: { drawOnChartArea: false } // only draw grid lines for first y axis
//                 },
//                 x: {
//                     ticks: { color: '#94A0AF' },
//                     grid: { display: false }
//                 }
//             }
//         }
//     });
// }
//
//
//
//
//
//
//




// Global Chart instances to prevent canvas re-use errors
let trendChartInstance = null;
let statusChartInstance = null;
let platformChartInstance = null;

let useMockData = false;

// Mock data generator for fallback showcase
const MOCK_DATA = {
    summary: {
        totalApplications: 48,
        activePipeline: 18,
        responseRatePct: 37.5,
        offerRatePct: 8.3
    },
    trends: [
        { periodLabel: "Jan", count: 4 },
        { periodLabel: "Feb", count: 8 },
        { periodLabel: "Mar", count: 12 },
        { periodLabel: "Apr", count: 9 },
        { periodLabel: "May", count: 15 },
        { periodLabel: "Jun", count: 11 },
        { periodLabel: "Jul", count: 19 }
    ],
    byStatus: [
        { status: "WISHLIST", count: 6 },
        { status: "APPLIED", count: 14 },
        { status: "ASSESSMENT", count: 5 },
        { status: "INTERVIEW", count: 7 },
        { status: "OFFER", count: 4 },
        { status: "REJECTED", count: 10 },
        { status: "WITHDRAWN", count: 2 }
    ],
    byPlatform: [
        { platform: "LINKEDIN", totalApplications: 22, offers: 2, successRatePct: 9.1 },
        { platform: "INDEED", totalApplications: 12, offers: 1, successRatePct: 8.3 },
        { platform: "COMPANY_WEBSITE", totalApplications: 8, offers: 1, successRatePct: 12.5 },
        { platform: "REFERRAL", totalApplications: 4, offers: 0, successRatePct: 0.0 },
        { platform: "OTHER", totalApplications: 2, offers: 0, successRatePct: 0.0 }
    ],
    goals: {
        weeklyGoal: 5,
        appliedThisWeek: 4,
        monthlyGoal: 20,
        appliedThisMonth: 15
    }
};

async function loadAnalytics() {
    try {
        let summaryData, trendsData, statusData, platformData, goalsData;

        if (useMockData) {
            summaryData = MOCK_DATA.summary;
            trendsData = MOCK_DATA.trends;
            statusData = MOCK_DATA.byStatus;
            platformData = MOCK_DATA.byPlatform;
            goalsData = MOCK_DATA.goals;
        } else {
            // Fetch live data from backend
            summaryData = await apiRequest("/analytics/summary", "GET");
            trendsData = await apiRequest("/analytics/trends?period=monthly", "GET");
            platformData = await apiRequest("/analytics/by-platform", "GET");
            statusData = await apiRequest("/analytics/by-status", "GET");
            goalsData = await apiRequest("/analytics/goals-progress", "GET");

            // Auto-fallback to mock data if there are no applications in the live DB
            if (!summaryData || summaryData.totalApplications === 0) {
                console.log("No live data found, falling back to showcase mock data");
                useMockData = true;
                document.getElementById("mockDataWarning").classList.remove("hidden");
                document.getElementById("mockDataWarning").classList.add("flex");
                loadAnalytics();
                return;
            } else {
                document.getElementById("mockDataWarning").classList.add("hidden");
                document.getElementById("mockDataWarning").classList.remove("flex");
            }
        }

        renderKPICards(summaryData);
        renderGoalsProgress(goalsData);
        renderTrendChart(trendsData);
        renderStatusChart(statusData);
        renderPlatformChart(platformData);

    } catch (err) {
        console.error("Failed to load analytics:", err);
        showToast("Error retrieving analytics metrics. Falling back to mock data.", "error");
        useMockData = true;
        document.getElementById("mockDataWarning").classList.remove("hidden");
        document.getElementById("mockDataWarning").classList.add("flex");
        loadAnalytics();
    }
}

function toggleMockData(enable) {
    useMockData = enable;
    if (enable) {
        document.getElementById("mockDataWarning").classList.remove("hidden");
        document.getElementById("mockDataWarning").classList.add("flex");
    } else {
        document.getElementById("mockDataWarning").classList.add("hidden");
        document.getElementById("mockDataWarning").classList.remove("flex");
    }
    loadAnalytics();
}

function renderKPICards(summary) {
    document.getElementById("kpiTotal").textContent = summary.totalApplications;
    document.getElementById("kpiActive").textContent = summary.activePipeline;
    document.getElementById("kpiResponseRate").textContent = summary.responseRatePct.toFixed(1) + "%";
    document.getElementById("kpiOfferRate").textContent = summary.offerRatePct.toFixed(1) + "%";
}

function renderGoalsProgress(goals) {
    const weeklyGoalVal = goals.weeklyGoal || 0;
    const weeklyPct = weeklyGoalVal > 0 ? Math.min(100, Math.round((goals.appliedThisWeek / weeklyGoalVal) * 100)) : 0;

    document.getElementById("weeklyGoalPercent").textContent = weeklyPct + "%";
    document.getElementById("weeklyGoalText").innerHTML = `
        <strong>${goals.appliedThisWeek}</strong> / ${weeklyGoalVal || "—"} applications targets completed
    `;
    const weeklyBar = document.getElementById("weeklyGoalBar");
    weeklyBar.style.width = weeklyPct + "%";

    const monthlyGoalVal = goals.monthlyGoal || 0;
    const monthlyPct = monthlyGoalVal > 0 ? Math.min(100, Math.round((goals.appliedThisMonth / monthlyGoalVal) * 100)) : 0;

    document.getElementById("monthlyGoalPercent").textContent = monthlyPct + "%";
    document.getElementById("monthlyGoalText").innerHTML = `
        <strong>${goals.appliedThisMonth}</strong> / ${monthlyGoalVal || "—"} applications targets completed
    `;
    const monthlyBar = document.getElementById("monthlyGoalBar");
    monthlyBar.style.width = monthlyPct + "%";
}

function renderTrendChart(trends) {
    const ctx = document.getElementById("trendChart").getContext("2d");

    if (trendChartInstance) {
        trendChartInstance.destroy();
    }

    const isLight = document.body.classList.contains('light-theme');
    const tickColor = isLight ? '#475569' : '#94a3b8';
    const gridColor = isLight ? 'rgba(0,0,0,0.07)' : 'rgba(255,255,255,0.06)';
    const pointBorder = isLight ? '#ffffff' : '#0B0F1A';

    const labels = trends.map(t => t.periodLabel);
    const data = trends.map(t => t.count);

    trendChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Applications Submitted',
                data: data,
                borderColor: '#4f46e5',
                backgroundColor: isLight ? 'rgba(79, 70, 229, 0.08)' : 'rgba(79, 70, 229, 0.05)',
                borderWidth: 3,
                fill: true,
                tension: 0.35,
                pointBackgroundColor: '#f59e0b',
                pointBorderColor: pointBorder,
                pointBorderWidth: 2,
                pointHoverRadius: 7
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { stepSize: 1, color: tickColor, font: { size: 11, weight: '500' } },
                    grid: { color: gridColor }
                },
                x: {
                    ticks: { color: tickColor, font: { size: 11 } },
                    grid: { display: false }
                }
            }
        }
    });
}

function renderStatusChart(statusCounts) {
    const ctx = document.getElementById("statusChart").getContext("2d");

    if (statusChartInstance) {
        statusChartInstance.destroy();
    }

    const isLight = document.body.classList.contains('light-theme');
    const legendColor = isLight ? '#0f172a' : '#e2e8f0';
    const borderColor = isLight ? '#f8fafc' : '#0B0F1A';

    const colorMap = {
        WISHLIST: '#94a3b8',
        APPLIED: '#3b82f6',
        ASSESSMENT: '#a855f7',
        INTERVIEW: '#f59e0b',
        OFFER: '#10b981',
        REJECTED: '#ef4444',
        WITHDRAWN: '#71717a'
    };

    const labels = statusCounts.map(s => s.status.charAt(0) + s.status.slice(1).toLowerCase());
    const data = statusCounts.map(s => s.count);
    const backgroundColors = statusCounts.map(s => colorMap[s.status] || '#cbd5e1');

    statusChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: backgroundColors,
                borderWidth: 3,
                borderColor: borderColor,
                hoverOffset: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        color: legendColor,
                        font: { family: 'Inter', size: 12, weight: '600' },
                        padding: 14,
                        usePointStyle: true,
                        pointStyleWidth: 10
                    }
                }
            },
            cutout: '70%'
        }
    });
}

function renderPlatformChart(platformStats) {
    const ctx = document.getElementById("platformChart").getContext("2d");

    if (platformChartInstance) {
        platformChartInstance.destroy();
    }

    const isLight = document.body.classList.contains('light-theme');
    const tickColor = isLight ? '#475569' : '#94a3b8';
    const gridColor = isLight ? 'rgba(0,0,0,0.07)' : 'rgba(255,255,255,0.06)';
    const legendColor = isLight ? '#0f172a' : '#e2e8f0';
    const titleColor = isLight ? '#475569' : '#94a3b8';

    const labels = platformStats.map(p => p.platform.replace('_', ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase()));
    const totalApps = platformStats.map(p => p.totalApplications);
    const successRates = platformStats.map(p => p.successRatePct);

    platformChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Total Applications',
                    data: totalApps,
                    backgroundColor: 'rgba(79, 70, 229, 0.8)',
                    borderColor: '#4f46e5',
                    borderWidth: 1,
                    borderRadius: 4,
                    yAxisID: 'y'
                },
                {
                    label: 'Offer Success Rate (%)',
                    data: successRates,
                    backgroundColor: 'rgba(245, 158, 11, 0.8)',
                    borderColor: '#f59e0b',
                    borderWidth: 1,
                    borderRadius: 4,
                    yAxisID: 'yPercent'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'top', labels: { color: legendColor, font: { size: 12, weight: '600' }, usePointStyle: true } }
            },
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: { display: true, text: 'Applications Count', color: titleColor, font: { size: 11, weight: '600' } },
                    ticks: { color: tickColor, stepSize: 1, font: { size: 11 } },
                    grid: { color: gridColor }
                },
                yPercent: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: { display: true, text: 'Success Rate %', color: titleColor, font: { size: 11, weight: '600' } },
                    ticks: { color: tickColor, callback: value => value + "%", font: { size: 11 } },
                    grid: { drawOnChartArea: false }
                },
                x: {
                    ticks: { color: tickColor, font: { size: 11 } },
                    grid: { display: false }
                }
            }
        }
    });
}
