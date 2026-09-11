// Piggybank Reminder App

const MAX_DAYS = 21;
const START_AMOUNT = 10;
const MAX_AMOUNT = 30;
const TOTAL_GOAL = 315; // Sum of 10+11+12+...+30

// Initialize app
function initApp() {
    loadProgress();
    updateUI();
    setupEventListeners();
    requestNotificationPermission();
    checkDailyReminder();
}

// Setup event listeners
function setupEventListeners() {
    const markDoneBtn = document.getElementById('markDoneBtn');
    const resetBtn = document.getElementById('resetBtn');
    
    if (markDoneBtn) {
        markDoneBtn.addEventListener('click', markDayAsSaved);
    }
    if (resetBtn) {
        resetBtn.addEventListener('click', resetProgress);
    }
}

// Load progress from localStorage
function loadProgress() {
    const saved = localStorage.getItem('piggybank_progress');
    if (!saved) {
        // Initialize on first visit
        localStorage.setItem('piggybank_progress', JSON.stringify({
            currentDay: 1,
            completedDays: [],
            startDate: new Date().toISOString()
        }));
    }
}

// Get current progress
function getProgress() {
    const data = JSON.parse(localStorage.getItem('piggybank_progress'));
    return data;
}

// Save progress
function saveProgress(data) {
    localStorage.setItem('piggybank_progress', JSON.stringify(data));
}

// Get amount for a specific day
function getAmountForDay(day) {
    if (day > MAX_DAYS) return MAX_AMOUNT;
    return START_AMOUNT + (day - 1);
}

// Calculate total saved
function calculateTotalSaved(completedDays) {
    let total = 0;
    completedDays.forEach(day => {
        total += getAmountForDay(day);
    });
    return total;
}

// Update UI
function updateUI() {
    const progress = getProgress();
    const currentDay = progress.currentDay;
    const completedDays = progress.completedDays;
    const todayAmount = getAmountForDay(currentDay);
    const totalSaved = calculateTotalSaved(completedDays);
    const progressPercent = (completedDays.length / MAX_DAYS) * 100;

    // Update day display
    document.getElementById('dayNumber').textContent = currentDay;
    document.getElementById('todayAmount').textContent = todayAmount;
    document.getElementById('progressFill').style.width = progressPercent + '%';
    document.getElementById('progressText').textContent = `${completedDays.length}/${MAX_DAYS} days completed`;
    document.getElementById('totalAmount').textContent = totalSaved;

    // Update button state
    const markDoneBtn = document.getElementById('markDoneBtn');
    if (completedDays.includes(currentDay)) {
        markDoneBtn.textContent = '✓ Already Saved Today';
        markDoneBtn.disabled = true;
        markDoneBtn.style.opacity = '0.6';
        markDoneBtn.style.cursor = 'not-allowed';
    } else {
        markDoneBtn.textContent = '✓ Saved Today';
        markDoneBtn.disabled = false;
        markDoneBtn.style.opacity = '1';
        markDoneBtn.style.cursor = 'pointer';
    }

    // Check if completed
    if (currentDay > MAX_DAYS) {
        showNotification('🎉 Congratulations! You reached your goal!', 5000);
        markDoneBtn.disabled = true;
        markDoneBtn.textContent = '🎉 Goal Reached!';
    }
}

// Mark today as saved
function markDayAsSaved() {
    const progress = getProgress();
    const currentDay = progress.currentDay;

    if (!progress.completedDays.includes(currentDay) && currentDay <= MAX_DAYS) {
        progress.completedDays.push(currentDay);
        progress.completedDays.sort((a, b) => a - b);

        // Move to next day
        if (currentDay < MAX_DAYS) {
            progress.currentDay = currentDay + 1;
        }

        saveProgress(progress);
        updateUI();
        showNotification(`✓ Day ${currentDay} saved! Next: $${getAmountForDay(currentDay + 1)}`);
    }
}

// Reset progress
function resetProgress() {
    if (confirm('Are you sure you want to reset your progress?')) {
        localStorage.removeItem('piggybank_progress');
        loadProgress();
        updateUI();
        showNotification('Progress reset! Starting fresh from Day 1...');
    }
}

// Show notification
function showNotification(message, duration = 3000) {
    const notifBox = document.getElementById('notificationBox');
    const notifText = document.getElementById('notificationText');
    
    notifText.textContent = message;
    notifBox.style.display = 'block';
    
    setTimeout(() => {
        notifBox.style.display = 'none';
    }, duration);
}

// Request notification permission
function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
}

// Check for daily reminder
function checkDailyReminder() {
    const progress = getProgress();
    const lastReminderDate = localStorage.getItem('piggybank_last_reminder');
    const today = new Date().toDateString();

    if (lastReminderDate !== today && progress.currentDay <= MAX_DAYS) {
        const amount = getAmountForDay(progress.currentDay);
        sendBrowserNotification(
            '💰 Piggybank Reminder',
            `Don't forget to save $${amount} today! (Day ${progress.currentDay}/${MAX_DAYS})`
        );
        localStorage.setItem('piggybank_last_reminder', today);
    }
}

// Send browser notification
function sendBrowserNotification(title, message) {
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, {
            body: message,
            icon: '🐷',
            badge: '🐷'
        });
    }
}

// Initialize app on load
document.addEventListener('DOMContentLoaded', initApp);

// Check for daily reminder when page becomes visible
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        checkDailyReminder();
    }
});
