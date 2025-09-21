// متغیرهای وضعیت فعلی
let surveyData = {};
let currentRole = null;
let currentAssistantId = null;
let currentCriterionIndex = 0;
let currentRatings = {};
let completedAssistants = [];

// بارگذاری اولیه صفحه
document.addEventListener('DOMContentLoaded', function() {
    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            surveyData = data;
            // افزایش تعداد بازدیدها
            surveyData.pageViews++;
            
            // نمایش تعداد بازدیدها و نظرسنجی‌ها
            document.getElementById('page-views').textContent = surveyData.pageViews.toLocaleString();
            document.getElementById('survey-count').textContent = surveyData.completedSurveys.toLocaleString();
            
            // رسم نمودار اولیه
            renderChart();
        });
});

// انتخاب نقش
function selectRole(role) {
    currentRole = role;
    document.getElementById('role-selection').classList.add('hidden');
    
    if (role === 'manager') {
        document.getElementById('manager-login').classList.remove('hidden');
    } else if (role === 'employee') {
        showEmployeeSurvey();
    }
}

// بازگشت به صفحه انتخاب نقش
function backToRoleSelection() {
    currentRole = null;
    document.getElementById('manager-login').classList.add('hidden');
    document.getElementById('role-selection').classList.remove('hidden');
}

// ورود مدیر
function loginManager() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    if (username === 'abbas' && password === '1335') {
        document.getElementById('manager-login').classList.add('hidden');
        document.getElementById('manager-dashboard').classList.remove('hidden');
        renderAssistantsList();
        renderCriteriaList();
    } else {
        alert('نام کاربری یا رمز عبور اشتباه است!');
    }
}

// نمایش صفحه نظرسنجی کارمند
function showEmployeeSurvey() {
    document.getElementById('employee-survey').classList.remove('hidden');
    renderAssistantList();
}

// خروج از سیستم
function logout() {
    currentRole = null;
    document.getElementById('manager-dashboard').classList.add('hidden');
    document.getElementById('employee-survey').classList.add('hidden');
    document.getElementById('assistant-evaluation').classList.add('hidden');
    document.getElementById('manager-settings').classList.add('hidden');
    document.getElementById('role-selection').classList.remove('hidden');
    
    // بازنشانی وضعیت
    currentAssistantId = null;
    currentCriterionIndex = 0;
    currentRatings = {};
    completedAssistants = [];
}

// نمایش تنظیمات مدیر
function showSettings() {
    document.getElementById('main-dashboard-content').classList.add('hidden');
    document.getElementById('manager-settings').classList.remove('hidden');
}

// پنهان کردن تنظیمات مدیر
function hideSettings() {
    document.getElementById('manager-settings').classList.add('hidden');
    document.getElementById('main-dashboard-content').classList.remove('hidden');
}

// افزودن معاون جدید
function addNewAssistant() {
    const name = prompt('لطفاً نام معاون جدید را وارد کنید:');
    if (name && name.trim() !== '') {
        const newId = surveyData.assistants.length > 0 ? Math.max(...surveyData.assistants.map(a => a.id)) + 1 : 1;
        surveyData.assistants.push({ id: newId, name: name.trim() });
        renderAssistantsList(); // Refresh the manager's list
        if (currentRole === 'employee') {
            renderAssistantList(); // Refresh the employee's list
        }
        renderChart();
    }
}

// افزودن شاخص جدید
function addNewCriterion() {
    const text = prompt('لطفاً شاخص جدید را وارد کنید:');
    if (text && text.trim() !== '') {
        const newId = surveyData.criteria.length > 0 ? Math.max(...surveyData.criteria.map(c => c.id)) + 1 : 1;
        surveyData.criteria.push({ id: newId, text: text.trim() });
        renderCriteriaList(); // Refresh the criteria list
    }
}

// حذف معاون
function removeAssistant(id) {
    if (confirm('آیا از حذف این معاون اطمینان دارید؟')) {
        surveyData.assistants = surveyData.assistants.filter(a => a.id !== id);
        renderAssistantsList();
        renderAssistantList();
        renderChart();
    }
}

// حذف شاخص
function removeCriterion(id) {
    if (confirm('آیا از حذف این شاخص اطمینان دارید؟')) {
        surveyData.criteria = surveyData.criteria.filter(c => c.id !== id);
        renderCriteriaList();
    }
}

// نمایش لیست معاونین برای مدیر
function renderAssistantsList() {
    const listElement = document.getElementById('assistants-list');
    listElement.innerHTML = '';
    
    surveyData.assistants.forEach(assistant => {
        const item = document.createElement('div');
        item.className = 'list-item';
        item.innerHTML = `
            <span>${assistant.name}</span>
            <div class="list-item-actions">
                <button class="btn btn-warning action-btn" onclick="editAssistant(${assistant.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-danger action-btn" onclick="removeAssistant(${assistant.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        listElement.appendChild(item);
    });
}

// نمایش لیست شاخص‌ها برای مدیر
function renderCriteriaList() {
    const listElement = document.getElementById('criteria-list');
    listElement.innerHTML = '';
    
    surveyData.criteria.forEach(criterion => {
        const item = document.createElement('div');
        item.className = 'list-item';
        item.innerHTML = `
            <span>${criterion.text}</span>
            <div class="list-item-actions">
                <button class="btn btn-warning action-btn" onclick="editCriterion(${criterion.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-danger action-btn" onclick="removeCriterion(${criterion.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        listElement.appendChild(item);
    });
}

// نمایش لیست معاونین برای کارمند
function renderAssistantList() {
    const listElement = document.getElementById('assistant-list');
    listElement.innerHTML = '';
    
    surveyData.assistants.forEach(assistant => {
        const isCompleted = completedAssistants.includes(assistant.id);
        const item = document.createElement('div');
        item.className = `assistant-item card ${isCompleted ? 'completed' : 'incomplete'}`;
        item.onclick = () => startEvaluation(assistant.id);
        item.innerHTML = `
            <div class="status-badge">${isCompleted ? 'تکمیل شده' : 'تکمیل نشده'}</div>
            <h3>${assistant.name}</h3>
            <p>برای ارزیابی این معاون کلیک کنید</p>
        `;
        listElement.appendChild(item);
    });
    
    // نمایش دکمه ثبت نهایی فقط وقتی همه معاونین تکمیل شده باشند
    const allCompleted = surveyData.assistants.every(a => completedAssistants.includes(a.id));
    document.getElementById('final-submit-btn').style.display = allCompleted ? 'block' : 'none';
}

// شروع ارزیابی یک معاون
function startEvaluation(assistantId) {
    currentAssistantId = assistantId;
    currentCriterionIndex = 0;
    currentRatings = {};
    
    document.getElementById('employee-survey').classList.add('hidden');
    document.getElementById('assistant-evaluation').classList.remove('hidden');
    
    const assistant = surveyData.assistants.find(a => a.id === assistantId);
    document.getElementById('evaluation-title').textContent = `ارزیابی ${assistant.name}`;
    
    renderCriterion();
}

// نمایش معیار جاری
function renderCriterion() {
    const container = document.getElementById('criteria-container');
    container.innerHTML = '';
    
    const criterion = surveyData.criteria[currentCriterionIndex];
    const currentRating = currentRatings[criterion.id] || null;
    
    const criterionElement = document.createElement('div');
    criterionElement.className = 'criteria-item';
    criterionElement.innerHTML = `
        <h3 class="criteria-title">${criterion.text}</h3>
        <div class="rating-options">
            <div class="rating-btn good ${currentRating === 'good' ? 'selected' : ''}" onclick="selectRating('good')">
                خوب
            </div>
            <div class="rating-btn medium ${currentRating === 'medium' ? 'selected' : ''}" onclick="selectRating('medium')">
                متوسط
            </div>
            <div class="rating-btn poor ${currentRating === 'poor' ? 'selected' : ''}" onclick="selectRating('poor')">
                ضعیف
            </div>
        </div>
    `;
    
    container.appendChild(criterionElement);
    
    // مدیریت نمایش دکمه‌های ناوبری
    document.getElementById('prev-criterion').style.display = currentCriterionIndex > 0 ? 'block' : 'none';
    
    if (currentCriterionIndex < surveyData.criteria.length - 1) {
        document.getElementById('next-criterion').style.display = 'block';
        document.getElementById('submit-evaluation').classList.add('hidden');
    } else {
        document.getElementById('next-criterion').style.display = 'none';
        document.getElementById('submit-evaluation').classList.remove('hidden');
    }
}

// انتخاب امتیاز برای معیار جاری
function selectRating(rating) {
    const criterion = surveyData.criteria[currentCriterionIndex];
    currentRatings[criterion.id] = rating;
    
    // برجسته کردن گزینه انتخاب شده
    const buttons = document.querySelectorAll('.rating-btn');
    buttons.forEach(btn => btn.classList.remove('selected'));
    
    event.target.classList.add('selected');
}

// معیار بعدی
function nextCriterion() {
    if (currentCriterionIndex < surveyData.criteria.length - 1) {
        currentCriterionIndex++;
        renderCriterion();
    }
}

// معیار قبلی
function prevCriterion() {
    if (currentCriterionIndex > 0) {
        currentCriterionIndex--;
        renderCriterion();
    }
}

// ثبت ارزیابی معاون
function submitEvaluation() {
    // ذخیره پاسخ‌ها
    surveyData.responses.push({
        assistantId: currentAssistantId,
        ratings: {...currentRatings},
        timestamp: new Date().toISOString()
    });
    
    // افزایش تعداد نظرسنجی‌های تکمیل شده
    surveyData.completedSurveys++;
    
    // به روزرسانی نمودار
    renderChart();
    
    // اضافه کردن به لیست معاونین تکمیل شده
    if (!completedAssistants.includes(currentAssistantId)) {
        completedAssistants.push(currentAssistantId);
    }
    
    // بازگشت به صفحه نظرسنجی
    document.getElementById('assistant-evaluation').classList.add('hidden');
    document.getElementById('employee-survey').classList.remove('hidden');
    
    // به روزرسانی لیست معاونین
    renderAssistantList();
    
    alert('ارزیابی با موفقیت ثبت شد.');
}

// ثبت نهایی نظرسنجی
function submitFinalSurvey() {
    alert('نظرسنجی شما با موفقیت ثبت شد. از مشارکت شما سپاسگزاریم.');
    logout();
}

// رسم نمودار عملکرد معاونین
function renderChart() {
    const ctx = document.getElementById('assistant-chart').getContext('2d');
    
    // محاسبه میانگین امتیازات برای هر معاون
    const datasets = surveyData.assistants.map(assistant => {
        // یافتن تمام پاسخ‌های مربوط به این معاون
        const assistantResponses = surveyData.responses.filter(r => r.assistantId === assistant.id);
        
        if (assistantResponses.length === 0) {
            return 0;
        }
        
        // محاسبه میانگین امتیاز برای این معاون
        let totalScore = 0;
        let totalCriteria = 0;
        
        assistantResponses.forEach(response => {
            Object.values(response.ratings).forEach(rating => {
                if (rating === 'good') totalScore += 100;
                else if (rating === 'medium') totalScore += 50;
                totalCriteria++;
            });
        });
        
        return totalCriteria > 0 ? Math.round(totalScore / totalCriteria) : 0;
    });
    
    // تعریف رنگ‌های ثابت برای نمودار
    const chartColors = [
        'rgba(255, 99, 132, 0.7)',  // قرمز
        'rgba(255, 159, 64, 0.7)', // نارنجی
        'rgba(75, 192, 192, 0.7)',  // سبز
        'rgba(255, 255, 255, 0.7)',// سفید
        'rgba(54, 162, 235, 0.7)', // آبی
        'rgba(153, 102, 255, 0.7)',// بنفش
        'rgba(255, 206, 86, 0.7)'  // زرد
    ];

    const colors = surveyData.assistants.map((_, index) => chartColors[index % chartColors.length]);
    
    // ایجاد نمودار
    if (window.assistantChart) {
        window.assistantChart.destroy();
    }
    
    window.assistantChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: surveyData.assistants.map(a => a.name),
            datasets: [{
                label: 'میانگین امتیاز (%)',
                data: datasets,
                backgroundColor: colors,
                borderColor: colors.map(c => c.replace('0.7', '1')),
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: 'میانگین امتیازات معاونین'
                }
            }
        }
    });
    
    // به روزرسانی آمار
    document.getElementById('page-views').textContent = surveyData.pageViews.toLocaleString();
    document.getElementById('survey-count').textContent = surveyData.completedSurveys.toLocaleString();
}

// توابع ویرایش (جهت تکمیل شدن)
function editAssistant(id) {
    const assistant = surveyData.assistants.find(a => a.id === id);
    const newName = prompt('نام جدید معاون:', assistant.name);
    if (newName && newName.trim() !== '') {
        assistant.name = newName.trim();
        renderAssistantsList();
        renderAssistantList();
        renderChart();
    }
}

function editCriterion(id) {
    const criterion = surveyData.criteria.find(c => c.id === id);
    const newText = prompt('شاخص جدید:', criterion.text);
    if (newText && newText.trim() !== '') {
        criterion.text = newText.trim();
        renderCriteriaList();
    }
}
