// Global state
let surveyData = {};

// Initialize the application
document.addEventListener('DOMContentLoaded', async () => {
    await loadInitialData();
    setupRoleSelection();
});

// Load initial data from the central repository
async function loadInitialData() {
    let data = await getData();
    if (!data) {
        data = {
            assistants: [],
            criteria: [],
            surveyData: {
                pageViews: 0,
                completedSurveys: 0,
                responses: []
            }
        };
        await updateData(data, 'Initial commit');
    }
    surveyData = data;
    // Increment page views
    surveyData.pageViews++;
    await updateData(surveyData, 'Increment page views');
    updateDashboardStats();
}

// Set up role selection buttons
function setupRoleSelection() {
    document.getElementById('manager-btn').addEventListener('click', () => selectRole('manager'));
    document.getElementById('employee-btn').addEventListener('click', () => selectRole('employee'));
}

// Handle role selection
function selectRole(role) {
    document.getElementById('role-selection').classList.add('hidden');
    if (role === 'manager') {
        initManagerPanel();
    } else {
        initEmployeePanel();
    }
}

// Update dashboard statistics
function updateDashboardStats() {
    document.getElementById('page-views').textContent = surveyData.pageViews.toLocaleString();
    document.getElementById('survey-count').textContent = surveyData.completedSurveys.toLocaleString();
}

// Logout and return to role selection
function logout() {
    document.getElementById('manager-panel').classList.add('hidden');
    document.getElementById('employee-panel').classList.add('hidden');
    document.getElementById('role-selection').classList.remove('hidden');
}

function backToRoleSelection() {
    document.getElementById('manager-dashboard').classList.add('hidden');
    document.getElementById('manager-login').classList.add('hidden');
    document.getElementById('employee-survey').classList.add('hidden');
    document.getElementById('role-selection').classList.remove('hidden');
}
