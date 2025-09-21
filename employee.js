// employee.js - بازنویسی برای مدیریت کامل نظرسنجی کارمندان، راست‌چین و فارسی

import { fetchData, saveData } from './github.js';

let currentUser = null;
let currentSurvey = {};
let managers = [];
let factors = {};
let finishedManagers = [];

async function init() {
    document.body.dir = "rtl";
    document.getElementById("employee-panel").style.display = "block";
    document.getElementById("manager-panel").style.display = "none";
    currentUser = prompt("لطفاً نام خود را وارد کنید:");
    if (!currentUser) {
        alert("ورود نام الزامی است.");
        return;
    }
    await loadMeta();
    renderManagerButtons();
}

async function loadMeta() {
    const data = await fetchData();
    managers = data.managers;
    factors = data.factors;
    // ساختار ذخیره‌سازی: { surveys: { [username]: { [manager]: { [factor]: rate } } } }
    if (!data.surveys) data.surveys = {};
    currentSurvey = data.surveys[currentUser] || {};
}

function renderManagerButtons() {
    const btnContainer = document.getElementById('manager-buttons');
    btnContainer.innerHTML = '';
    managers.forEach(manager => {
        const btn = document.createElement('button');
        btn.innerText = manager;
        btn.className = 'button' + (currentSurvey[manager] ? ' finished' : '');
        btn.onclick = () => showManagerSurvey(manager);
        btnContainer.appendChild(btn);
    });
    document.getElementById('final-submit').onclick = submitAll;
}

function showManagerSurvey(manager) {
    const container = document.getElementById('survey-container');
    container.innerHTML = `<h3>ارزیابی ${manager}</h3>`;
    const ul = document.createElement('ul');
    factors[manager].forEach(factor => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${factor}</span>
            <button onclick="selectRate('${manager}','${factor}','خوب', this)">خوب</button>
            <button onclick="selectRate('${manager}','${factor}','متوسط', this)">متوسط</button>
            <button onclick="selectRate('${manager}','${factor}','ضعیف', this)">ضعیف</button>
        `;
        ul.appendChild(li);
    });
    container.appendChild(ul);

    const saveBtn = document.createElement('button');
    saveBtn.className = "button";
    saveBtn.innerText = "ثبت ارزیابی این معاون";
    saveBtn.onclick = () => saveManagerSurvey(manager);
    container.appendChild(saveBtn);
}

window.selectRate = function(manager, factor, rate, btn) {
    if (!currentSurvey[manager]) currentSurvey[manager] = {};
    currentSurvey[manager][factor] = rate;
    // Highlight selected
    Array.from(btn.parentElement.querySelectorAll('button')).forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
}

function saveManagerSurvey(manager) {
    // بررسی تکمیل بودن همه شاخص‌ها
    let allDone = true;
    factors[manager].forEach(factor => {
        if (!currentSurvey[manager] || !currentSurvey[manager][factor]) allDone = false;
    });
    if (!allDone) {
        alert('لطفاً همه شاخص‌ها را امتیاز دهید.');
        return;
    }
    finishedManagers.push(manager);
    renderManagerButtons();
    document.getElementById('survey-container').innerHTML = `<span style="color:green;">ارزیابی ${manager} با موفقیت ثبت شد.</span>`;
}

async function submitAll() {
    if (finishedManagers.length < managers.length) {
        alert('ابتدا همه معاونین را ارزیابی کنید.');
        return;
    }
    const data = await fetchData();
    if (!data.surveys) data.surveys = {};
    data.surveys[currentUser] = currentSurvey;
    await saveData(data);
    alert('نظرسنجی شما با موفقیت ثبت شد. متشکریم!');
    document.getElementById('employee-panel').style.display = "none";
}

window.onload = init;
