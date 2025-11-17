// CalPal - Dashboard Functions

// Initialize goals from localStorage or use empty array
let userGoals = JSON.parse(localStorage.getItem('userGoals')) || [];

// Initialize the dashboard on page load
document.addEventListener('DOMContentLoaded', function() {
  displayGoals();
  updateGoalPoints();
  updateCaloriesOverview();
});

// Display current and completed goals
function displayGoals() {
  const currentList = document.getElementById('current-goals-list');
  const completedList = document.getElementById('completed-goals-list');
  const noCurrent = document.getElementById('no-current-goals');
  const noCompleted = document.getElementById('no-completed-goals');

  currentList.innerHTML = '';
  completedList.innerHTML = '';

  if (!userGoals || userGoals.length === 0) {
    noCurrent.style.display = 'block';
    noCompleted.style.display = 'block';
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
  noCompleted.style.display = hasCompleted ? 'none' : 'block';
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
  if (!confirm('Delete this goal?')) return;
  userGoals.splice(index, 1);
  localStorage.setItem('userGoals', JSON.stringify(userGoals));
  displayGoals();
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
  if (!confirm('Are you sure you want to delete ALL goals? This cannot be undone.')) return;
  userGoals = [];
  localStorage.setItem('userGoals', JSON.stringify(userGoals));
  displayGoals();
  alert('All goals have been cleared.');
}

// Simple HTML escape
function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Update Goal Points display with total earned rewards
function updateGoalPoints() {
  const totalReward = userGoals
    .filter(goal => goal.status === 'Completed')
    .reduce((sum, goal) => sum + (Number(goal.reward) || 0), 0);

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
}

// Reset points by clearing all rewards
function resetPoints() {
  if (!confirm('Are you sure you want to reset all points? This will clear all goal rewards.')) return;
  userGoals.forEach(goal => {
    if (goal.status === 'Completed') {
      goal.reward = 0;
    }
  });
  localStorage.setItem('userGoals', JSON.stringify(userGoals));
  updateGoalPoints();
  alert('Points have been reset to 0.');
}

// Completion encouragement messages
const COMPLETION_MESSAGES = [
  '👍 Good Job!',
  '😊 Keep up the good work!',
  "👍 Great Job! That's quite the achievement!",
  '😎 Fantastic! You should be proud!',
  '😮 You made that look easy',
  '😊 Amazing work! You are accomplishing great things!'
];

let completionMessageTimeout = null;

function showCompletionMessage() {
  const el = document.getElementById('goal-completion-message');
  if (!el) return;
  // pick random message
  const msg = COMPLETION_MESSAGES[Math.floor(Math.random() * COMPLETION_MESSAGES.length)];
  // clear previous timeout
  if (completionMessageTimeout) {
    clearTimeout(completionMessageTimeout);
    completionMessageTimeout = null;
  }
  el.textContent = msg;
  el.classList.remove('fade-out');
  el.style.display = 'block';
  // auto hide after 5 seconds
  completionMessageTimeout = setTimeout(() => {
    el.classList.add('fade-out');
    setTimeout(() => {
      el.style.display = 'none';
      el.classList.remove('fade-out');
    }, 500);
  }, 5000);
}

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
    // fallback: just re-render and show top message
    showCompletionMessage();
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
