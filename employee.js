document.addEventListener('DOMContentLoaded', () => {
    const employeePanel = document.getElementById('employee-panel');
    const assistantsButtons = document.getElementById('assistants-buttons');
    const finalSubmitBtn = document.getElementById('final-submit-btn');
    const surveyModal = document.getElementById('survey-modal');
    const surveyAssistantName = document.getElementById('survey-assistant-name');
    const surveyCriteria = document.getElementById('survey-criteria');
    const submitAssistantSurveyBtn = document.getElementById('submit-assistant-survey-btn');

    let currentAssistantIndex = -1;
    let employeeResponses = [];

    async function initEmployeePanel() {
        employeePanel.classList.remove('hidden');
        const data = await getData();
        if (!data) return;

        data.surveyData.pageViews++;
        await updateData(data, 'Increment page views');

        renderAssistantButtons(data.assistants);
    }

    function renderAssistantButtons(assistants) {
        assistantsButtons.innerHTML = '';
        assistants.forEach((assistant, index) => {
            const button = document.createElement('button');
            button.textContent = assistant;
            button.dataset.index = index;
            button.addEventListener('click', () => startSurveyForAssistant(index, assistant));
            assistantsButtons.appendChild(button);
        });
    }

    async function startSurveyForAssistant(index, name) {
        currentAssistantIndex = index;
        surveyAssistantName.textContent = name;
        const data = await getData();
        renderCriteriaForSurvey(data.criteria);
        surveyModal.classList.remove('hidden');
    }

    function renderCriteriaForSurvey(criteria) {
        surveyCriteria.innerHTML = '';
        criteria.forEach((criterion, index) => {
            const div = document.createElement('div');
            div.className = 'criterion';
            div.innerHTML = `<p>${criterion}</p>`;
            
            const goodBtn = document.createElement('button');
            goodBtn.textContent = 'خوب';
            goodBtn.dataset.score = 100;
            
            const mediumBtn = document.createElement('button');
            mediumBtn.textContent = 'متوسط';
            mediumBtn.dataset.score = 50;

            const weakBtn = document.createElement('button');
            weakBtn.textContent = 'ضعیف';
            weakBtn.dataset.score = 0;

            div.appendChild(goodBtn);
            div.appendChild(mediumBtn);
            div.appendChild(weakBtn);

            [goodBtn, mediumBtn, weakBtn].forEach(btn => {
                btn.addEventListener('click', (e) => {
                    // Remove selected from siblings
                    [...e.target.parentElement.children].forEach(child => child.classList.remove('selected'));
                    e.target.classList.add('selected');
                });
            });

            surveyCriteria.appendChild(div);
        });
    }

    submitAssistantSurveyBtn.addEventListener('click', () => {
        const scores = [];
        const criteriaElements = surveyCriteria.querySelectorAll('.criterion');
        let allAnswered = true;
        criteriaElements.forEach(c => {
            const selected = c.querySelector('button.selected');
            if (selected) {
                scores.push(parseInt(selected.dataset.score));
            } else {
                allAnswered = false;
            }
        });

        if (allAnswered) {
            employeeResponses.push({
                assistantIndex: currentAssistantIndex,
                scores: scores
            });
            surveyModal.classList.add('hidden');
            
            const assistantButton = assistantsButtons.querySelector(`button[data-index='${currentAssistantIndex}']`);
            assistantButton.classList.add('completed');

            checkIfAllCompleted();
        } else {
            alert('لطفا به تمام معیارها پاسخ دهید.');
        }
    });

    function checkIfAllCompleted() {
        const allButtons = assistantsButtons.querySelectorAll('button');
        const completedButtons = assistantsButtons.querySelectorAll('button.completed');
        if (allButtons.length === completedButtons.length) {
            finalSubmitBtn.classList.remove('hidden');
        }
    }

    finalSubmitBtn.addEventListener('click', async () => {
        const data = await getData();
        employeeResponses.forEach(res => {
            data.surveyData.responses.push({
                ...res,
                timestamp: new Date().toISOString()
            });
        });
        data.surveyData.completedSurveys++;
        await updateData(data, 'Submit new survey');
        alert('نظرسنجی شما با موفقیت ثبت شد.');
        employeePanel.classList.add('hidden');
        document.getElementById('entry-page').classList.remove('hidden');
    });

    window.initEmployeePanel = initEmployeePanel;
});
