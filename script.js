// Global state
let surveyData = {};

// Initialize the application
document.addEventListener('DOMContentLoaded', async () => {
    await loadInitialData();
});


// Load initial data from the central repository
async function loadInitialData() {
    // Load the initial survey data from the local JSON file
    const data = await getData();
    surveyData = data.surveyData; // Directly use the nested surveyData object
    updateDashboardStats();
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
    // Ensure surveyData is not null or undefined before accessing its properties
    if (surveyData) {
        document.getElementById('page-views').textContent = (surveyData.pageViews || 0).toLocaleString();
        document.getElementById('survey-count').textContent = (surveyData.completedSurveys || 0).toLocaleString();
    }
}

// Logout and return to role selection
function logout() {
    document.getElementById('manager-dashboard').classList.add('hidden');
    document.getElementById('employee-survey').classList.add('hidden');
    document.getElementById('role-selection').classList.remove('hidden');
}

function backToRoleSelection() {
    document.getElementById('manager-dashboard').classList.add('hidden');
    document.getElementById('manager-login').classList.add('hidden');
    document.getElementById('employee-survey').classList.add('hidden');
    document.getElementById('role-selection').classList.remove('hidden');
}
