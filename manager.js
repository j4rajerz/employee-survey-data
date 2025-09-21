document.addEventListener('DOMContentLoaded', () => {
    const managerPanel = document.getElementById('manager-panel');
    const pageViewsEl = document.getElementById('page-views');
    const completedSurveysEl = document.getElementById('completed-surveys');
    const resultsChartEl = document.getElementById('results-chart');
    const assistantsList = document.getElementById('assistants-list');
    const newAssistantInput = document.getElementById('new-assistant');
    const addAssistantBtn = document.getElementById('add-assistant-btn');
    const criteriaList = document.getElementById('criteria-list');
    const newCriterionInput = document.getElementById('new-criterion');
    const addCriterionBtn = document.getElementById('add-criterion-btn');

    let chart;

    async function initManagerPanel() {
        managerPanel.classList.remove('hidden');
        await loadDashboard();
        setupEventListeners();
    }

    function setupEventListeners() {
        addAssistantBtn.addEventListener('click', addAssistant);
        addCriterionBtn.addEventListener('click', addCriterion);
    }

    async function loadDashboard() {
        const data = await getData();
        if (!data) return;

        pageViewsEl.textContent = data.surveyData.pageViews;
        completedSurveysEl.textContent = data.surveyData.completedSurveys;

        renderAssistants(data.assistants);
        renderCriteria(data.criteria);
        renderChart(data.assistants, data.surveyData.responses);
    }

    function renderAssistants(assistants) {
        assistantsList.innerHTML = '';
        assistants.forEach((assistant, index) => {
            const li = document.createElement('li');
            li.textContent = assistant;
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'حذف';
            deleteBtn.onclick = () => deleteAssistant(index);
            li.appendChild(deleteBtn);
            assistantsList.appendChild(li);
        });
    }

    function renderCriteria(criteria) {
        criteriaList.innerHTML = '';
        criteria.forEach((criterion, index) => {
            const li = document.createElement('li');
            li.textContent = criterion;
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'حذف';
            deleteBtn.onclick = () => deleteCriterion(index);
            li.appendChild(deleteBtn);
            criteriaList.appendChild(li);
        });
    }

    function renderChart(assistants, responses) {
        const averageScores = assistants.map((_, assistantIndex) => {
            const assistantResponses = responses.filter(r => r.assistantIndex === assistantIndex);
            if (assistantResponses.length === 0) return 0;
            const totalScore = assistantResponses.reduce((sum, r) => sum + r.scores.reduce((s, c) => s + c, 0), 0);
            const totalCriteria = assistantResponses.length * assistantResponses[0].scores.length;
            return (totalScore / (totalCriteria * 100)) * 100;
        });

        if (chart) {
            chart.data.labels = assistants;
            chart.data.datasets[0].data = averageScores;
            chart.update();
        } else {
            chart = new Chart(resultsChartEl, {
                type: 'bar',
                data: {
                    labels: assistants,
                    datasets: [{
                        label: 'میانگین امتیاز',
                        data: averageScores,
                        backgroundColor: assistants.map(() => `hsl(${Math.random() * 360}, 70%, 50%)`)
                    }]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 100
                        }
                    }
                }
            });
        }
    }

    async function addAssistant() {
        const newAssistant = newAssistantInput.value.trim();
        if (newAssistant) {
            const data = await getData();
            data.assistants.push(newAssistant);
            await updateData(data, 'Add new assistant');
            newAssistantInput.value = '';
            loadDashboard();
        }
    }

    async function deleteAssistant(index) {
        const data = await getData();
        data.assistants.splice(index, 1);
        // Also remove related responses
        data.surveyData.responses = data.surveyData.responses.filter(r => r.assistantIndex !== index);
        await updateData(data, 'Delete assistant');
        loadDashboard();
    }

    async function addCriterion() {
        const newCriterion = newCriterionInput.value.trim();
        if (newCriterion) {
            const data = await getData();
            data.criteria.push(newCriterion);
            await updateData(data, 'Add new criterion');
            newCriterionInput.value = '';
            loadDashboard();
        }
    }

    async function deleteCriterion(index) {
        const data = await getData();
        data.criteria.splice(index, 1);
        // Also remove related scores from responses
        data.surveyData.responses.forEach(r => r.scores.splice(index, 1));
        await updateData(data, 'Delete criterion');
        loadDashboard();
    }

    window.initManagerPanel = initManagerPanel;

    window.logout = function() {
        managerPanel.classList.add('hidden');
        document.getElementById('role-selection').classList.remove('hidden');
    }
});
