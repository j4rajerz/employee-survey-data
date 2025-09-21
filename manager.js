// manager.js - داشبورد مدیر، نمودار زنده و مدیریت معاونین/شاخص‌ها

import { fetchData, saveData } from './github.js';

let chart = null;

async function initManager() {
    document.body.dir = "rtl";
    document.getElementById("employee-panel").style.display = "none";
    document.getElementById("manager-panel").style.display = "block";
    await renderDashboard();
    document.getElementById("refresh-btn").onclick = renderDashboard;
    document.getElementById("logout-btn").onclick = () => location.reload();
}

async function renderDashboard() {
    const data = await fetchData();
    document.getElementById("survey-count").innerText = Object.keys(data.surveys || {}).length;
    document.getElementById("visit-count").innerText = data.visits || "-";

    await renderChart(data);
    renderManagePanel(data);
}

async function renderChart(data) {
    const ctx = document.getElementById('chart').getContext('2d');
    let managers = data.managers || [];
    let factors = data.factors || {};
    let surveys = data.surveys || {};

    let avgScores = managers.map(manager => {
        let total = 0, count = 0;
        Object.values(surveys).forEach(survey => {
            if (survey[manager]) {
                Object.entries(survey[manager]).forEach(([factor, rate]) => {
                    if (rate === "خوب") total += 2;
                    else if (rate === "متوسط") total += 1;
                    count++;
                });
            }
        });
        return count ? (total / count).toFixed(2) : 0;
    });

    if (chart) chart.destroy();
    chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: managers,
            datasets: [{
                label: 'میانگین امتیاز',
                data: avgScores,
                backgroundColor: '#4CAF50'
            }]
        },
        options: {
            scales: {
                y: { min: 0, max: 2 }
            }
        }
    });
}

function renderManagePanel(data) {
    // مدیریت اسامی معاونین و شاخص‌ها
    const managerList = document.getElementById('managers-list');
    managerList.innerHTML = '';
    (data.managers || []).forEach(m => {
        const li = document.createElement('li');
        li.innerText = m + ' - شاخص‌ها: ' + (data.factors[m] || []).join(", ");
        managerList.appendChild(li);
    });
    // دکمه افزودن
    document.getElementById('add-manager-btn').onclick = async () => {
        const name = prompt('نام معاون جدید؟');
        if (!name) return;
        data.managers.push(name);
        data.factors[name] = [];
        await saveData(data);
        renderDashboard();
    };
    // افزودن شاخص برای هر معاون
    document.getElementById('add-factor-btn').onclick = async () => {
        const name = prompt('نام معاون؟');
        if (!data.managers.includes(name)) { alert('معاون یافت نشد!'); return; }
        const factor = prompt('عنوان شاخص جدید؟');
        if (!factor) return;
        data.factors[name].push(factor);
        await saveData(data);
        renderDashboard();
    };
}

window.initManager = initManager;
