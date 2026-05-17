// Theme Toggle
const themeToggle = document.getElementById('themeToggle');
const html = document.documentElement;
const themeIcon = document.querySelector('.theme-icon');

// Check for saved theme preference or default to dark mode
const currentTheme = localStorage.getItem('theme') || 'dark';
if (currentTheme === 'light') {
    document.body.classList.add('light-mode');
    themeIcon.textContent = '☀️';
}

themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
    
    let theme = 'dark';
    if (document.body.classList.contains('light-mode')) {
        theme = 'light';
        themeIcon.textContent = '☀️';
    } else {
        themeIcon.textContent = '🌙';
    }
    
    localStorage.setItem('theme', theme);
});

// Notification System
function showNotification(message, type = 'success') {
    const container = document.getElementById('notificationContainer');
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    container.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideIn 0.3s ease-out reverse';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Progress Bar
window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = (scrollTop / docHeight) * 100;
    document.getElementById('progressBar').style.width = scrollPercent + '%';
});

// Tab Navigation
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const tabName = btn.dataset.tab + '-tab';
        
        // Remove active class from all buttons and contents
        tabBtns.forEach(b => b.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));
        
        // Add active class to clicked button and corresponding content
        btn.classList.add('active');
        document.getElementById(tabName).classList.add('active');
    });
});

// ===== WORLD CLOCKS =====
const timezoneSelect = document.getElementById('timezoneSelect');
const addBtn = document.getElementById('addBtn');
const clocksGrid = document.getElementById('clocksGrid');
const resetBtn = document.getElementById('resetBtn');
const digitalTime = document.getElementById('digitalTime');
const digitalDate = document.getElementById('digitalDate');
const timezoneInfo = document.getElementById('timezoneInfo');

let clocks = [];
const maxClocks = 12;
const defaultTimezones = [
    'America/New_York',
    'Europe/London',
    'Asia/Tokyo',
    'Australia/Sydney'
];

// Load clocks from localStorage
function loadClocks() {
    const saved = localStorage.getItem('clocks');
    if (saved) {
        clocks = JSON.parse(saved);
    } else {
        clocks = [...defaultTimezones];
    }
    renderClocks();
}

// Save clocks to localStorage
function saveClocks() {
    localStorage.setItem('clocks', JSON.stringify(clocks));
}

// Add timezone
addBtn.addEventListener('click', () => {
    const tz = timezoneSelect.value;
    if (!tz) {
        showNotification('Please select a timezone', 'error');
        return;
    }
    if (clocks.length >= maxClocks) {
        showNotification(`Maximum ${maxClocks} clocks allowed`, 'error');
        return;
    }
    if (clocks.includes(tz)) {
        showNotification('Timezone already added', 'error');
        return;
    }
    
    clocks.push(tz);
    saveClocks();
    renderClocks();
    timezoneSelect.value = '';
    showNotification('Timezone added!', 'success');
});

// Remove timezone
function removeTimezone(tz) {
    clocks = clocks.filter(c => c !== tz);
    saveClocks();
    renderClocks();
    showNotification('Timezone removed', 'success');
}

// Reset to defaults
resetBtn.addEventListener('click', () => {
    clocks = [...defaultTimezones];
    saveClocks();
    renderClocks();
    showNotification('Reset to default timezones', 'success');
});

// Render clocks
function renderClocks() {
    clocksGrid.innerHTML = '';
    clocks.forEach(tz => {
        const now = new Date();
        const formatter = new Intl.DateTimeFormat('en-US', {
            timeZone: tz,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour12: false
        });
        
        const parts = formatter.formatToParts(now);
        const time = `${parts.find(p => p.type === 'hour').value}:${parts.find(p => p.type === 'minute').value}:${parts.find(p => p.type === 'second').value}`;
        const date = `${parts.find(p => p.type === 'month').value} ${parts.find(p => p.type === 'day').value}, ${parts.find(p => p.type === 'year').value}`;
        
        // Calculate UTC offset
        const offset = getUTCOffset(tz);
        
        // Extract city name
        const city = tz.split('/').pop().replace(/_/g, ' ');
        
        const card = document.createElement('div');
        card.className = 'clock-card';
        card.innerHTML = `
            <div class="clock-city">${city}</div>
            <div class="clock-time">${time}</div>
            <div class="clock-date">${date}</div>
            <div class="clock-utc">${offset}</div>
            <button class="btn-remove" onclick="removeTimezone('${tz}')">Remove</button>
        `;
        clocksGrid.appendChild(card);
    });
}

// Calculate UTC offset
function getUTCOffset(tz) {
    const now = new Date();
    const utcDate = new Date(now.toLocaleString('en-US', { timeZone: 'UTC' }));
    const tzDate = new Date(now.toLocaleString('en-US', { timeZone: tz }));
    const offset = (tzDate - utcDate) / (1000 * 60 * 60);
    const sign = offset >= 0 ? '+' : '';
    return `UTC ${sign}${offset.toFixed(1)}`;
}

// Update digital clock
function updateDigitalClock() {
    const now = new Date();
    const time = now.toLocaleTimeString('en-US', { hour12: false });
    const date = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    digitalTime.textContent = time;
    digitalDate.textContent = date;
    timezoneInfo.textContent = tz;
}

// Update all clocks
function updateAllClocks() {
    updateDigitalClock();
    renderClocks();
}

// ===== STOPWATCH =====
const startStopBtn = document.getElementById('startStopBtn');
const resetStopwatchBtn = document.getElementById('resetStopwatchBtn');
const lapBtn = document.getElementById('lapBtn');
const stopwatchTime = document.getElementById('stopwatchTime');
const stopwatchMS = document.getElementById('stopwatchMS');
const lapsList = document.getElementById('lapsList');

let stopwatchRunning = false;
let stopwatchStartTime = 0;
let stopwatchElapsed = 0;
let stopwatchInterval = null;
let laps = [];

startStopBtn.addEventListener('click', () => {
    if (!stopwatchRunning) {
        stopwatchRunning = true;
        stopwatchStartTime = Date.now() - stopwatchElapsed;
        startStopBtn.textContent = 'Stop';
        startStopBtn.classList.remove('btn-start');
        startStopBtn.classList.add('btn-pause');
        
        stopwatchInterval = setInterval(() => {
            stopwatchElapsed = Date.now() - stopwatchStartTime;
            updateStopwatchDisplay();
        }, 10);
    } else {
        stopwatchRunning = false;
        clearInterval(stopwatchInterval);
        startStopBtn.textContent = 'Start';
        startStopBtn.classList.remove('btn-pause');
        startStopBtn.classList.add('btn-start');
    }
});

resetStopwatchBtn.addEventListener('click', () => {
    stopwatchRunning = false;
    clearInterval(stopwatchInterval);
    stopwatchElapsed = 0;
    laps = [];
    updateStopwatchDisplay();
    lapsList.innerHTML = '';
    startStopBtn.textContent = 'Start';
    startStopBtn.classList.remove('btn-pause');
    startStopBtn.classList.add('btn-start');
    showNotification('Stopwatch reset', 'success');
});

lapBtn.addEventListener('click', () => {
    if (stopwatchRunning) {
        laps.push(stopwatchElapsed);
        updateLapsList();
        showNotification(`Lap ${laps.length} recorded`, 'success');
    }
});

function updateStopwatchDisplay() {
    const totalSeconds = Math.floor(stopwatchElapsed / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const milliseconds = Math.floor((stopwatchElapsed % 1000) / 10);
    
    stopwatchTime.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}:${String(milliseconds).padStart(2, '0')}`;
    stopwatchMS.textContent = String(Math.floor(stopwatchElapsed % 100)).padStart(2, '0');
}

function updateLapsList() {
    lapsList.innerHTML = '';
    laps.forEach((lap, index) => {
        const totalSeconds = Math.floor(lap / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        const ms = Math.floor((lap % 1000) / 10);
        
        const lapItem = document.createElement('div');
        lapItem.className = 'lap-item';
        lapItem.innerHTML = `
            <span class="lap-number">Lap ${index + 1}</span>
            <span class="lap-time">${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}:${String(ms).padStart(2, '0')}</span>
        `;
        lapsList.appendChild(lapItem);
    });
}

// ===== TIMER =====
const timerHours = document.getElementById('timerHours');
const timerMinutes = document.getElementById('timerMinutes');
const timerSeconds = document.getElementById('timerSeconds');
const timerStartBtn = document.getElementById('timerStartBtn');
const timerPauseBtn = document.getElementById('timerPauseBtn');
const timerResetBtn = document.getElementById('timerResetBtn');
const timerTime = document.getElementById('timerTime');

let timerRunning = false;
let timerRemaining = 0;
let timerInterval = null;

function updateTimerDisplay() {
    const hours = Math.floor(timerRemaining / 3600);
    const minutes = Math.floor((timerRemaining % 3600) / 60);
    const seconds = timerRemaining % 60;
    timerTime.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

timerStartBtn.addEventListener('click', () => {
    if (timerRunning) return;
    
    if (timerRemaining === 0) {
        const h = parseInt(timerHours.value) || 0;
        const m = parseInt(timerMinutes.value) || 0;
        const s = parseInt(timerSeconds.value) || 0;
        timerRemaining = h * 3600 + m * 60 + s;
        
        if (timerRemaining <= 0) {
            showNotification('Please enter a valid time', 'error');
            return;
        }
    }
    
    timerRunning = true;
    timerStartBtn.disabled = true;
    timerPauseBtn.disabled = false;
    timerHours.disabled = true;
    timerMinutes.disabled = true;
    timerSeconds.disabled = true;
    
    timerInterval = setInterval(() => {
        timerRemaining--;
        updateTimerDisplay();
        
        if (timerRemaining <= 0) {
            clearInterval(timerInterval);
            timerRunning = false;
            showNotification('⏲️ Timer finished!', 'success');
            playTimerSound();
            resetTimer();
        }
    }, 1000);
});

timerPauseBtn.addEventListener('click', () => {
    timerRunning = false;
    clearInterval(timerInterval);
    timerStartBtn.disabled = false;
    timerPauseBtn.disabled = true;
});

timerResetBtn.addEventListener('click', () => {
    resetTimer();
});

function resetTimer() {
    timerRunning = false;
    clearInterval(timerInterval);
    timerRemaining = 0;
    timerHours.value = 0;
    timerMinutes.value = 5;
    timerSeconds.value = 0;
    timerStartBtn.disabled = false;
    timerPauseBtn.disabled = true;
    timerHours.disabled = false;
    timerMinutes.disabled = false;
    timerSeconds.disabled = false;
    updateTimerDisplay();
}

function playTimerSound() {
    // Simple beep sound
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gain.gain.setValueAtTime(0.3, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
}

// ===== ALARM =====
const alarmHours = document.getElementById('alarmHours');
const alarmMinutes = document.getElementById('alarmMinutes');
const setAlarmBtn = document.getElementById('setAlarmBtn');
const alarmsList = document.getElementById('alarmsList');

let alarms = [];

function loadAlarms() {
    const saved = localStorage.getItem('alarms');
    if (saved) {
        alarms = JSON.parse(saved);
        renderAlarms();
    }
}

function saveAlarms() {
    localStorage.setItem('alarms', JSON.stringify(alarms));
}

setAlarmBtn.addEventListener('click', () => {
    const h = parseInt(alarmHours.value) || 0;
    const m = parseInt(alarmMinutes.value) || 0;
    
    if (h < 0 || h > 23 || m < 0 || m > 59) {
        showNotification('Invalid time format', 'error');
        return;
    }
    
    const alarmTime = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    
    if (alarms.includes(alarmTime)) {
        showNotification('Alarm already exists', 'error');
        return;
    }
    
    alarms.push(alarmTime);
    alarms.sort();
    saveAlarms();
    renderAlarms();
    alarmHours.value = '';
    alarmMinutes.value = '';
    showNotification(`Alarm set for ${alarmTime}`, 'success');
});

function removeAlarm(time) {
    alarms = alarms.filter(a => a !== time);
    saveAlarms();
    renderAlarms();
    showNotification('Alarm deleted', 'success');
}

function renderAlarms() {
    alarmsList.innerHTML = '';
    if (alarms.length === 0) {
        alarmsList.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 20px;">No alarms set</p>';
        return;
    }
    
    alarms.forEach(time => {
        const card = document.createElement('div');
        card.className = 'alarm-card';
        card.innerHTML = `
            <div class="alarm-time">${time}</div>
            <button class="alarm-delete" onclick="removeAlarm('${time}')">Delete</button>
        `;
        alarmsList.appendChild(card);
    });
}

// Check alarms every minute
function checkAlarms() {
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    if (alarms.includes(currentTime)) {
        showNotification(`🔔 Alarm: ${currentTime}`, 'success');
        playTimerSound();
    }
}

setInterval(checkAlarms, 1000);

// Initialize
loadClocks();
loadAlarms();
updateAllClocks();
setInterval(updateAllClocks, 1000);
updateTimerDisplay();

console.log('⏰ Clock app loaded successfully!');
