// CalPal - Dashboard Functions

// Initialize goals from localStorage or use empty array
let userGoals = JSON.parse(localStorage.getItem('userGoals')) || [];

// Daily goals list
const DAILY_GOALS = [
  'Go for a 20 minute walk',
  'Cook a new healthy meal',
  'Go to the gym',
  'Drink 7-8 glasses of water',
  'Read for 30 minutes',
  'Meditate for 5 minutes',
  'Practice self care',
  'Go to sleep by 10 PM',
  'Reduce unecessary screen time',
  'Stretch for 10 minutes'
];

const DAILY_GOAL_REWARD = 20;

// Get completed daily goals history from localStorage
function getCompletedDailyGoals() {
  const stored = localStorage.getItem('completedDailyGoals');
  return stored ? JSON.parse(stored) : [];
}

// Save completed daily goals history to localStorage
function saveCompletedDailyGoals(goals) {
  localStorage.setItem('completedDailyGoals', JSON.stringify(goals));
}

// Initialize the dashboard on page load
document.addEventListener('DOMContentLoaded', function() {
  displayDailyGoal();
  displayGoals();
  renderCompletedDailyGoals();
  updateGoalPoints();
  updateCaloriesOverview();
});

// ==================== DAILY GOAL FUNCTIONS ====================

// Get or initialize daily goal data
function getDailyGoalData() {
  const stored = localStorage.getItem('dailyGoalData');
  if (stored) {
    return JSON.parse(stored);
  }
  return null;
}

// Save daily goal data
function saveDailyGoalData(data) {
  localStorage.setItem('dailyGoalData', JSON.stringify(data));
}

// Check if we need a new daily goal (new day or no goal set)
function needsNewDailyGoal() {
  const data = getDailyGoalData();
  if (!data) return true;
  
  const today = new Date().toDateString();
  return data.date !== today;
}

// Pick a random daily goal
function pickRandomDailyGoal() {
  const randomIndex = Math.floor(Math.random() * DAILY_GOALS.length);
  return DAILY_GOALS[randomIndex];
}

// Get or create today's daily goal
function getTodaysDailyGoal() {
  if (needsNewDailyGoal()) {
    const newGoal = {
      date: new Date().toDateString(),
      goal: pickRandomDailyGoal(),
      completed: false,
      progress: 0
    };
    saveDailyGoalData(newGoal);
    return newGoal;
  }
  return getDailyGoalData();
}

// Refresh daily goal (manual refresh)
function refreshDailyGoal() {
  const newGoal = {
    date: new Date().toDateString(),
    goal: pickRandomDailyGoal(),
    completed: false,
    progress: 0
  };
  saveDailyGoalData(newGoal);
  
  displayDailyGoal();
  updateGoalPoints();
}

// Display the daily goal
function displayDailyGoal() {
  const dailyGoalContainer = document.getElementById('daily-goal-container');
  if (!dailyGoalContainer) return;
  
  const goalData = getTodaysDailyGoal();
  
  if (goalData.completed) {
    // Show placeholder message when completed
    dailyGoalContainer.innerHTML = `
      <p class="no-goals-message">The daily goal for today has been completed. Great Job!</p>
    `;
  } else {
    const progressPercent = goalData.progress;
    const SHOW_FILL_LABEL_PERCENT = 20;
    const showFillLabel = progressPercent >= SHOW_FILL_LABEL_PERCENT;
    const progressText = `${progressPercent}%`;
    
    dailyGoalContainer.innerHTML = `
      <div class="goal-item">
        <div class="goal-item-title">${escapeHtml(goalData.goal)}</div>
        <div class="goal-item-description">Today's daily goal - Complete it to earn ${DAILY_GOAL_REWARD} points!</div>
        <div class="goal-meta">
          <span class="goal-small"><strong>Type:</strong> Daily Goal</span>
          <span class="goal-small"><strong>Reward:</strong> +${DAILY_GOAL_REWARD} pts</span>
        </div>
        <div class="goal-progress-wrapper" aria-hidden="false">
          <div class="goal-progress-fill" style="width:${progressPercent}%">
            <div class="goal-progress-fill-label" style="display:${showFillLabel ? 'flex' : 'none'}">${escapeHtml(progressText)}</div>
          </div>
          <div class="goal-progress-pill" style="display:${showFillLabel ? 'none' : 'block'}"></div>
          <div class="goal-progress-overlay" style="display:${showFillLabel ? 'none' : 'flex'}">${escapeHtml(progressText)}</div>
        </div>
        <div class="goal-actions">
          <button class="btn btn-secondary" onclick="editDailyGoalProgress()">Edit Progress</button>
          <button class="btn btn-secondary" onclick="completeDailyGoal()">Mark Complete</button>
        </div>
      </div>
    `;
  }
}

// Edit daily goal progress
function editDailyGoalProgress() {
  const goalData = getDailyGoalData();
  if (!goalData || goalData.completed) return;
  
  const val = prompt('Enter progress percentage (0-100):', String(goalData.progress || 0));
  const p = parseFloat(val);
  if (isNaN(p) || p < 0 || p > 100) return alert('Invalid percentage');
  
  goalData.progress = p;
  if (p >= 100) {
    goalData.progress = 100;
    goalData.completed = true;
    saveDailyGoalData(goalData);
    showInlineDailyGoalCompletion();
  } else {
    saveDailyGoalData(goalData);
    displayDailyGoal();
  }
}

// Complete daily goal
function completeDailyGoal() {
  if (!confirm('Mark this daily goal as complete?')) return;
  
  const goalData = getDailyGoalData();
  if (!goalData || goalData.completed) return;
  
  goalData.completed = true;
  goalData.progress = 100;
  saveDailyGoalData(goalData);
  showInlineDailyGoalCompletion();
}

// Show inline completion for daily goal, then move to completed goals
function showInlineDailyGoalCompletion() {
  const goalData = getDailyGoalData();
  if (!goalData) return;
  
  // Pick random completion message
  const raw = COMPLETION_MESSAGES[Math.floor(Math.random() * COMPLETION_MESSAGES.length)];
  const matchEmoji = raw.match(/^([\p{Emoji_Presentation}\p{Extended_Pictographic}])/u);
  const emoji = matchEmoji ? matchEmoji[0] : raw.charAt(0);
  const text = matchEmoji ? raw.slice(emoji.length).trim() : raw;

  const dailyGoalContainer = document.getElementById('daily-goal-container');
  if (!dailyGoalContainer) {
    addDailyGoalToCompleted();
    displayDailyGoal();
    return;
  }

  // Show completion message
  const placeholder = document.createElement('div');
  placeholder.className = 'goal-inline-message';
  placeholder.innerHTML = `<span class="emoji">${emoji}</span><span>${escapeHtml(text)}</span>`;
  
  dailyGoalContainer.innerHTML = '';
  dailyGoalContainer.appendChild(placeholder);

  // After delay, show placeholder message and move to completed
  setTimeout(() => {
    addDailyGoalToCompleted();
    displayDailyGoal();
  }, 3000);
}

// Add completed daily goal to history and render
function addDailyGoalToCompleted() {
  const goalData = getDailyGoalData();
  if (!goalData || !goalData.completed) return;
  
  // Get completed history
  const completedGoals = getCompletedDailyGoals();
  
  // Create a unique ID for this completion
  const completionRecord = {
    id: Date.now(),
    goal: goalData.goal,
    completedDate: new Date().toLocaleDateString(),
    timestamp: Date.now()
  };
  
  // Add to history
  completedGoals.push(completionRecord);
  saveCompletedDailyGoals(completedGoals);
  
  // Re-render the completed daily goals
  renderCompletedDailyGoals();
  
  // Update points
  updateGoalPoints();
}

// Render all completed daily goals from localStorage
function renderCompletedDailyGoals() {
  const completedList = document.getElementById('completed-goals-list');
  const noCompleted = document.getElementById('no-completed-goals');
  if (!completedList) return;
  
  // Get completed daily goals from storage
  const completedGoals = getCompletedDailyGoals();
  
  // Remove existing daily goal elements
  const existingDailyGoals = completedList.querySelectorAll('.daily-goal-completed');
  existingDailyGoals.forEach(el => el.remove());
  
  // Add each completed daily goal
  completedGoals.forEach((goalRecord, index) => {
    const item = document.createElement('div');
    item.className = 'goal-item daily-goal-completed';
    item.dataset.id = goalRecord.id;
    item.innerHTML = `
      <div class="goal-item-title">${escapeHtml(goalRecord.goal)} <span style="color:#4ade80;font-weight:600;margin-left:8px;">(Completed)</span></div>
      <div class="goal-item-description">Daily goal completed!</div>
      <div class="goal-meta">
        <span class="goal-small"><strong>Type:</strong> Daily Goal</span>
        <span class="goal-small"><strong>Completed:</strong> ${goalRecord.completedDate}</span>
        <span class="goal-small"><strong>Reward:</strong> +${DAILY_GOAL_REWARD} pts</span>
      </div>
      <div class="goal-actions">
        <button class="btn btn-secondary" style="background:#ef4444;color:#fff;" onclick="deleteDailyGoal(this)">Delete</button>
      </div>
    `;
    
    // Add to top of completed list
    completedList.insertBefore(item, completedList.firstChild);
  });
  
  // Update "no completed goals" visibility
  if (noCompleted) {
    const hasAnyCompleted = completedList.querySelector('.goal-item') !== null;
    noCompleted.style.display = hasAnyCompleted ? 'none' : 'block';
  }
}

// Delete a completed daily goal
function deleteDailyGoal(button) {
  if (!confirm(`Delete this completed daily goal? The ${DAILY_GOAL_REWARD} reward points will be refunded.`)) return;
  
  const goalItem = button.closest('.goal-item');
  if (!goalItem) return;
  
  const goalId = parseInt(goalItem.dataset.id);
  
  // Remove from localStorage
  const completedGoals = getCompletedDailyGoals();
  const filteredGoals = completedGoals.filter(g => g.id !== goalId);
  saveCompletedDailyGoals(filteredGoals);
  
  // Re-render
  renderCompletedDailyGoals();
  
  // Update points after deletion
  updateGoalPoints();
}

// ==================== USER GOALS FUNCTIONS ====================

// Display current and completed goals
function displayGoals() {
  const currentList = document.getElementById('current-goals-list');
  const completedList = document.getElementById('completed-goals-list');
  const noCurrent = document.getElementById('no-current-goals');
  const noCompleted = document.getElementById('no-completed-goals');

  currentList.innerHTML = '';
  
  // Clear only user goals, not daily goals
  const userGoalElements = completedList.querySelectorAll('.goal-item:not(.daily-goal-completed)');
  userGoalElements.forEach(el => el.remove());

  if (!userGoals || userGoals.length === 0) {
    noCurrent.style.display = 'block';
    // Only show "no completed" if there's also no daily goals
    const hasCompletedDaily = getCompletedDailyGoals().length > 0;
    noCompleted.style.display = hasCompletedDaily ? 'none' : 'block';
    return;
  }

  let hasCurrent = false;
  let hasCompleted = false;

  userGoals.forEach((goal, index) => {
    if (goal.status === 'Completed') {
      const el = createCompletedElement(goal, index);
      completedList.appendChild(el);
      hasCompleted = true;
    } else {
      const el = createCurrentElement(goal, index);
      currentList.appendChild(el);
      hasCurrent = true;
    }
  });

  noCurrent.style.display = hasCurrent ? 'none' : 'block';
  // Check if we have completed goals OR completed daily goals
  const hasCompletedDaily = getCompletedDailyGoals().length > 0;
  noCompleted.style.display = (hasCompleted || hasCompletedDaily) ? 'none' : 'block';
  updateGoalPoints();
}

function createCurrentElement(goal, index) {
  const item = document.createElement('div');
  item.className = 'goal-item';
  item.setAttribute('data-goal-index', index);

  // Calculate progress display
  let progressPercent = 0;
  let progressText = '';
  if (goal.type === 'Custom') {
    progressPercent = Math.max(0, Math.min(100, Number(goal.progress || 0)));
    progressText = `${progressPercent}%`;
  } else if (goal.type === 'Exercise') {
    const done = Number(goal.progress || 0);
    const target = Number(goal.target || 0);
    progressPercent = target > 0 ? Math.min(100, Math.round((done / target) * 100)) : 0;
    progressText = `${done}/${target} workouts (${progressPercent}%)`;
  } else if (goal.type === 'Weight Loss') {
    const lost = Number(goal.progress || 0);
    const target = Number(goal.target || 0);
    progressPercent = target > 0 ? Math.min(100, Math.round((lost / target) * 100)) : 0;
    progressText = `${lost}/${target} lbs (${progressPercent}%)`;
  }

  const start = goal.startDate ? formatDate(goal.startDate) : '—';
  const end = goal.endDate ? formatDate(goal.endDate) : '—';

  // compute potential reward for display (based on target)
  const potentialReward = computePotentialReward(goal);

  // show dark label inside fill when percent >= threshold, otherwise show overlay + pill
  const SHOW_FILL_LABEL_PERCENT = 20;
  const showFillLabel = progressPercent >= SHOW_FILL_LABEL_PERCENT;

  item.innerHTML = `
    <div class="goal-item-title">${escapeHtml(goal.title)}</div>
    <div class="goal-item-description">${escapeHtml(goal.description || '')}</div>
    <div class="goal-meta">
      <span class="goal-small"><strong>Type:</strong> ${goal.type || 'Custom'}</span>
      <span class="goal-small"><strong>Start:</strong> ${start}</span>
      <span class="goal-small"><strong>Complete By:</strong> ${end}</span>
      <span class="goal-small"><strong>Reward:</strong> +${potentialReward} pts</span>
    </div>

    <div class="goal-progress-wrapper" aria-hidden="false">
      <div class="goal-progress-fill" style="width:${progressPercent}%">
        <div class="goal-progress-fill-label" style="display:${showFillLabel ? 'flex' : 'none'}">${escapeHtml(progressText)}</div>
      </div>
      <div class="goal-progress-pill" style="display:${showFillLabel ? 'none' : 'block'}"></div>
      <div class="goal-progress-overlay" style="display:${showFillLabel ? 'none' : 'flex'}">${escapeHtml(progressText)}</div>
    </div>

    <div class="goal-actions">
      ${goal.type === 'Custom' ? `<button class="btn btn-secondary" onclick="editCustomProgress(${index})">Edit Progress</button>` : `<button class="btn btn-secondary" onclick="logProgress(${index})">Log Progress</button>`}
      <button class="btn btn-secondary" onclick="completeGoal(${index})">Mark Complete</button>
      <button class="btn btn-secondary" style="background:#ef4444;color:#fff;" onclick="deleteGoal(${index})">Delete</button>
    </div>
  `;

  return item;
}

function createCompletedElement(goal, index) {
  const item = document.createElement('div');
  item.className = 'goal-item';
  const completedDate = goal.completedDate || 'Completed';
  // ensure reward is set for completed goals
  if (goal.reward == null) {
    const r = computeReward(goal);
    goal.reward = r;
    // persist
    userGoals[index] = goal;
    localStorage.setItem('userGoals', JSON.stringify(userGoals));
  }

  item.innerHTML = `
    <div class="goal-item-title">${escapeHtml(goal.title)} <span style="color:#4ade80;font-weight:600;margin-left:8px;">(Completed)</span></div>
    <div class="goal-item-description">${escapeHtml(goal.description || '')}</div>
    <div class="goal-meta">
      <span class="goal-small"><strong>Type:</strong> ${goal.type || 'Custom'}</span>
      <span class="goal-small"><strong>Completed:</strong> ${completedDate}</span>
      <span class="goal-small"><strong>Reward:</strong> +${goal.reward || 0} pts</span>
    </div>
    <div class="goal-actions">
      <button class="btn btn-secondary" style="background:#ef4444;color:#fff;" onclick="deleteGoal(${index})">Delete</button>
    </div>
  `;
  return item;
}

// Navigate to the create goal page
function createNewGoal() {
  window.location.href = 'create-goal.html';
}

// Mark a goal as complete
function completeGoal(index) {
  if (!confirm('Mark this goal as complete?')) return;
  const goal = userGoals[index];
  if (!goal) return;
  goal.status = 'Completed';
  goal.progress = goal.type === 'Custom' ? 100 : goal.target ? goal.target : goal.progress;
  goal.completedDate = new Date().toLocaleDateString();
  // compute and store reward for completed goal
  goal.reward = computeReward(goal);
  localStorage.setItem('userGoals', JSON.stringify(userGoals));
  showInlineCompletionMessage(index);
}

// Delete a goal
function deleteGoal(index) {
  const goal = userGoals[index];
  if (!goal) return;
  
  let confirmMsg = 'Delete this goal?';
  if (goal.status === 'Completed' && goal.reward) {
    confirmMsg = `Delete this goal? The ${goal.reward} reward points will be refunded.`;
  }
  
  if (!confirm(confirmMsg)) return;
  
  userGoals.splice(index, 1);
  localStorage.setItem('userGoals', JSON.stringify(userGoals));
  displayGoals();
  updateGoalPoints();
}

// Log progress for Exercise or Weight Loss goals
function logProgress(index) {
  const goal = userGoals[index];
  if (!goal) return;
  if (goal.type === 'Exercise') {
    const add = prompt('Enter number of workouts completed to add:', '1');
    const n = parseFloat(add);
    if (isNaN(n) || n <= 0) return alert('Invalid number');
    goal.progress = (Number(goal.progress || 0) + n);
  } else if (goal.type === 'Weight Loss') {
    const add = prompt('Enter pounds lost to add (e.g., 1.5):', '0.5');
    const n = parseFloat(add);
    if (isNaN(n) || n <= 0) return alert('Invalid number');
    goal.progress = (Number(goal.progress || 0) + n);
  } else {
    return alert('Logging is only available for Exercise and Weight Loss goals.');
  }

  // Auto-complete if target reached or exceeded
  if (goal.target && Number(goal.target) > 0) {
    const percent = (Number(goal.progress) / Number(goal.target)) * 100;
    if (percent >= 100) {
      goal.progress = Number(goal.target);
      goal.status = 'Completed';
      goal.completedDate = new Date().toLocaleDateString();
      // compute reward on auto-complete
      goal.reward = computeReward(goal);
      alert('Goal completed!');
      showInlineCompletionMessage(index);
    }
  }

  localStorage.setItem('userGoals', JSON.stringify(userGoals));
  displayGoals();
}

// Edit custom progress (percent)
function editCustomProgress(index) {
  const goal = userGoals[index];
  if (!goal) return;
  const val = prompt('Enter new progress percentage (0-100):', String(goal.progress || 0));
  const p = parseFloat(val);
  if (isNaN(p) || p < 0 || p > 100) return alert('Invalid percentage');
  goal.progress = p;
  if (p >= 100) {
    goal.status = 'Completed';
    goal.completedDate = new Date().toLocaleDateString();
    // set reward for custom goal
    goal.reward = computeReward(goal);
    showInlineCompletionMessage(index);
  }
  localStorage.setItem('userGoals', JSON.stringify(userGoals));
  displayGoals();
}

// Compute the reward when a goal is completed
function computeReward(goal) {
  if (!goal) return 0;
  if (goal.type === 'Exercise') {
    const target = Number(goal.target || goal.progress || 0);
    return Math.max(0, Math.round(target * 5));
  }
  if (goal.type === 'Weight Loss') {
    const target = Number(goal.target || goal.progress || 0);
    return Math.max(0, Math.round(target * 30));
  }
  // Custom
  return 15;
}

// Compute potential reward for display on current goals (based on target)
function computePotentialReward(goal) {
  if (!goal) return 0;
  if (goal.type === 'Exercise') {
    const target = Number(goal.target || 0);
    return Math.max(0, Math.round(target * 5));
  }
  if (goal.type === 'Weight Loss') {
    const target = Number(goal.target || 0);
    return Math.max(0, Math.round(target * 30));
  }
  return 15;
}

// Helper: format YYYY-MM-DD to readable
function formatDate(d) {
  try {
    if (!d) return '';
    // if already a localized date string, return
    if (d.indexOf('/') >= 0) return d;
    const parts = d.split('-');
    if (parts.length !== 3) return d;
    const dt = new Date(parts[0], parts[1] - 1, parts[2]);
    return dt.toLocaleDateString();
  } catch (e) {
    return d;
  }
}

// Clear all goals
function clearAllGoals() {
  // Calculate total points that will be lost
  const userGoalsReward = userGoals
    .filter(goal => goal.status === 'Completed')
    .reduce((sum, goal) => sum + (Number(goal.reward) || 0), 0);
  
  const dailyGoalsCount = getCompletedDailyGoals().length;
  const dailyGoalReward = dailyGoalsCount * DAILY_GOAL_REWARD;
  const totalPointsLost = userGoalsReward + dailyGoalReward;
  
  const confirmMsg = totalPointsLost > 0
    ? `Are you sure you want to delete ALL goals? This cannot be undone.\n\nYou will lose ${totalPointsLost} reward points.`
    : 'Are you sure you want to delete ALL goals? This cannot be undone.';
  
  if (!confirm(confirmMsg)) return;
  
  userGoals = [];
  localStorage.setItem('userGoals', JSON.stringify(userGoals));
  localStorage.removeItem('dailyGoalData');
  saveCompletedDailyGoals([]);
  
  displayDailyGoal();
  displayGoals();
  renderCompletedDailyGoals();
  updateGoalPoints();
  
  const message = totalPointsLost > 0
    ? `All goals have been cleared. ${totalPointsLost} points have been refunded.`
    : 'All goals have been cleared.';
  alert(message);
}

// Simple HTML escape
function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Update Goal Points display with total earned rewards
function updateGoalPoints() {
  // Calculate points from user goals
  const userGoalsReward = userGoals
    .filter(goal => goal.status === 'Completed')
    .reduce((sum, goal) => sum + (Number(goal.reward) || 0), 0);
  
  // Count all completed daily goals from localStorage
  const dailyGoalsCount = getCompletedDailyGoals().length;
  const dailyGoalReward = dailyGoalsCount * DAILY_GOAL_REWARD;
  const totalReward = userGoalsReward + dailyGoalReward;

  const rewardsElement = document.getElementById('rewards-total');
  if (rewardsElement) {
    rewardsElement.textContent = `${totalReward} Points`;
  }

  // Render badges based on totalReward
  renderBadges(totalReward);
}

// Render badges into the badges container based on thresholds
function renderBadges(totalReward) {
  const thresholds = [100, 1000, 5000, 10000, 25000, 50000, 100000, 500000, 1000000, 10000000];
  const container = document.getElementById('badges-container');
  const earnedLabel = document.getElementById('badges-earned');
  if (!container) return;

  // Get previously unlocked count from localStorage
  const previousUnlockedStr = localStorage.getItem('previousBadgeCount');
  const previousUnlocked = previousUnlockedStr ? parseInt(previousUnlockedStr) : null;

  container.innerHTML = '';
  let unlocked = 0;

  thresholds.forEach((threshold, i) => {
    const idx = i + 1;
    const unlockedThis = totalReward >= threshold;
    if (unlockedThis) unlocked++;

    const badgeWrap = document.createElement('div');
    badgeWrap.className = 'badge-item';

    const img = document.createElement('img');
    img.src = `images/badges/badge-${idx}.svg`;
    img.alt = `Badge ${idx}`;
    img.title = unlockedThis ? `Earned at ${threshold} pts` : `Locked — requires ${threshold} pts`;
    if (!unlockedThis) img.classList.add('badge-locked');

    badgeWrap.appendChild(img);
    container.appendChild(badgeWrap);
  });

  if (earnedLabel) {
    earnedLabel.textContent = `${unlocked} / ${thresholds.length} badges earned`;
  }

  // Check if new badge was earned (only if we have a previous count)
  if (previousUnlocked !== null && unlocked > previousUnlocked) {
    const badgesEarned = unlocked - previousUnlocked;
    showBadgeEarnedMessage(badgesEarned, unlocked);
  }
  
  // Always update stored count
  localStorage.setItem('previousBadgeCount', unlocked.toString());
}

// Show congratulations message for earning a badge
function showBadgeEarnedMessage(count, totalBadges) {
  const messageDiv = document.getElementById('goal-completion-message');
  if (!messageDiv) return;

  const message = count === 1 
    ? `🎉 Congratulations! You earned a new badge! (${totalBadges} total)`
    : `🎉 Congratulations! You earned ${count} new badges! (${totalBadges} total)`;

  messageDiv.textContent = message;
  messageDiv.classList.remove('fade-out');
  messageDiv.style.display = 'block';

  // Auto hide after 5 seconds
  setTimeout(() => {
    messageDiv.classList.add('fade-out');
    setTimeout(() => {
      messageDiv.style.display = 'none';
      messageDiv.classList.remove('fade-out');
    }, 500);
  }, 5000);
}

// Reset points by clearing all rewards
// Completion encouragement messages
const COMPLETION_MESSAGES = [
  '👍 Good Job!',
  '😊 Keep up the good work!',
  "👍 Great Job! That's quite the achievement!",
  '😎 Fantastic! You should be proud!',
  '😮 You made that look easy',
  '😊 Amazing work! You are accomplishing great things!'
];

// ==================== COMPLETION MESSAGE FUNCTIONS ====================

// Show inline completion message at the position of the completed goal (temporary)
function showInlineCompletionMessage(index) {
  // pick random message and split emoji from text
  const raw = COMPLETION_MESSAGES[Math.floor(Math.random() * COMPLETION_MESSAGES.length)];
  // Extract leading emoji if present (first char might be surrogate pair)
  const matchEmoji = raw.match(/^([\p{Emoji_Presentation}\p{Extended_Pictographic}])/u);
  const emoji = matchEmoji ? matchEmoji[0] : raw.charAt(0);
  const text = matchEmoji ? raw.slice(emoji.length).trim() : raw;

  const currentContainer = document.getElementById('current-goals-list');
  if (!currentContainer) {
    displayGoals();
    return;
  }
  const originalEl = currentContainer.querySelector(`.goal-item[data-goal-index="${index}"]`);
  if (!originalEl) {
    displayGoals();
    return;
  }

  // Create placeholder message element
  const placeholder = document.createElement('div');
  placeholder.className = 'goal-inline-message';
  placeholder.innerHTML = `<span class="emoji">${emoji}</span><span>${escapeHtml(text)}</span>`;

  // Replace original goal element contents with message
  originalEl.replaceWith(placeholder);

  // After delay, re-render goals so the completed goal moves to completed list
  setTimeout(() => {
    displayGoals();
  }, 3000);
}

// ==================== CALORIE OVERVIEW ====================

// Update Calories Overview on dashboard
function updateCaloriesOverview() {
  // Load meals and workouts from localStorage
  const meals = JSON.parse(localStorage.getItem('dailyMeals')) || [];
  const workouts = JSON.parse(localStorage.getItem('dailyWorkouts')) || [];
  
  // Calculate total calories in (from meals)
  const caloriesIn = meals.reduce((sum, meal) => sum + (Number(meal.calories) || 0), 0);
  
  // Calculate total calories out (from workouts)
  const caloriesOut = workouts.reduce((sum, workout) => sum + (Number(workout.calories) || 0), 0);
  
  // Get target calories from calculator
  const targetCalories = parseInt(localStorage.getItem('targetCalories')) || null;
  const hasGoal = localStorage.getItem('calorieGoalSet') === 'true';
  
  // Update the display
  const metricElement = document.getElementById('metric-calories');
  const metricSubElement = document.getElementById('metric-calories-sub');
  
  if (metricElement) {
    metricElement.textContent = `${caloriesIn} in / ${caloriesOut} out`;
  }
  
  if (metricSubElement) {
    const netCalories = caloriesIn - caloriesOut;
    
    if (hasGoal && targetCalories) {
      const difference = netCalories - targetCalories;
      
      if (Math.abs(difference) <= 50) {
        metricSubElement.textContent = `Perfect! Right on target (${targetCalories} kcal goal).`;
      } else if (difference > 0) {
        metricSubElement.textContent = `${difference} kcal over your ${targetCalories} kcal goal.`;
      } else {
        metricSubElement.textContent = `${Math.abs(difference)} kcal under your ${targetCalories} kcal goal.`;
      }
    } else {
      // No goal set, show net calories
      if (netCalories > 0) {
        metricSubElement.textContent = `Net: ${netCalories} kcal consumed today. Set a goal in the Calculator!`;
      } else if (netCalories < 0) {
        metricSubElement.textContent = `Net: ${Math.abs(netCalories)} kcal deficit today. Set a goal in the Calculator!`;
      } else {
        metricSubElement.textContent = `No calories logged yet. Set a goal in the Calculator!`;
      }
    }
  }
}
