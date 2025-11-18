// CalPal - Exercise Tracker JavaScript

// Load workouts from localStorage or use empty array
let workouts = JSON.parse(localStorage.getItem('dailyWorkouts')) || [];

// Show a message in the UI
function showMessage(text, isError = false) {
  const messageDiv = document.getElementById('message');
  if (!messageDiv) return;

  if (!text) {
    messageDiv.innerHTML = '';
    return;
  }

  const className = isError ? 'message error' : 'message';
  messageDiv.innerHTML = `<div class="${className}">${text}</div>`;

  setTimeout(() => {
    messageDiv.innerHTML = '';
  }, 3000);
}

// Save current workouts to localStorage
function saveWorkouts() {
  localStorage.setItem('dailyWorkouts', JSON.stringify(workouts));
}

// Render the workouts table, totals text, and stats bar
function renderTable() {
  const tbody = document.getElementById('workouts-tbody');
  const totalsDiv = document.getElementById('totals');

  const statTotalWorkouts = document.getElementById('stat-total-workouts');
  const statTotalMinutes = document.getElementById('stat-total-minutes');
  const statTotalCalories = document.getElementById('stat-total-calories');

  if (!tbody || !totalsDiv) return;

  tbody.innerHTML = '';

  if (workouts.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; color: #a0a0a0;">
          No workouts logged yet.
        </td>
      </tr>
    `;
    totalsDiv.textContent = 'No workouts logged yet.';

    if (statTotalWorkouts) statTotalWorkouts.textContent = '0';
    if (statTotalMinutes) statTotalMinutes.textContent = '0';
    if (statTotalCalories) statTotalCalories.textContent = '0';

    return;
  }

  let totalMinutes = 0;
  let totalCalories = 0;

  workouts.forEach((workout, index) => {
    const type = workout.type || 'preset';

    const minutes =
      workout.minutes !== null &&
      workout.minutes !== undefined &&
      !isNaN(workout.minutes)
        ? Number(workout.minutes)
        : null;

    const calories =
      workout.calories !== null &&
      workout.calories !== undefined &&
      !isNaN(workout.calories)
        ? Number(workout.calories)
        : null;

    let details = '-';
    if (type === 'preset') {
      details = workout.intensity ? `Intensity: ${workout.intensity}` : '-';
    } else if (type === 'custom') {
      const sets = workout.sets ?? '-';
      const reps = workout.reps ?? '-';
      details = `${sets} x ${reps}`;
    }

    if (minutes) totalMinutes += minutes;
    if (calories) totalCalories += calories;

    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${workout.name}</td>
      <td>${type === 'preset' ? 'Preset' : 'Custom'}</td>
      <td>${details}</td>
      <td>${minutes !== null ? minutes : '-'}</td>
      <td>${calories !== null ? calories : '-'}</td>
      <td>
        <button type="button" class="btn-link delete-workout-btn" data-index="${index}">
          Remove
        </button>
      </td>
    `;
    tbody.appendChild(row);
  });

  totalsDiv.textContent =
    `Workouts: ${workouts.length} | Total minutes: ${totalMinutes} | Total calories: ${totalCalories} kcal`;

  if (statTotalWorkouts) statTotalWorkouts.textContent = String(workouts.length);
  if (statTotalMinutes) statTotalMinutes.textContent = String(totalMinutes);
  if (statTotalCalories) statTotalCalories.textContent = String(totalCalories);
}

// Initialize after DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
  const exerciseSelect = document.getElementById('exercise');
  const addBtn = document.getElementById('add-workout-btn');
  const clearAllBtn = document.getElementById('clear-all-btn');

  const workoutTypeRadios = document.querySelectorAll('input[name="workout-type"]');
  const presetSection = document.getElementById('preset-section');
  const customSection = document.getElementById('custom-section');

  const customNameInput = document.getElementById('custom-name');
  const customSetsInput = document.getElementById('custom-sets');
  const customRepsInput = document.getElementById('custom-reps');
  const customMinutesInput = document.getElementById('custom-minutes');
  const customCaloriesInput = document.getElementById('custom-calories');

  const tbody = document.getElementById('workouts-tbody');

  // 1) Populate preset dropdown from exercisePresets (data.js)
  if (typeof exercisePresets !== 'undefined' && exerciseSelect) {
    exercisePresets.forEach((exercise, index) => {
      const option = document.createElement('option');
      option.value = index;
      option.textContent = `${exercise.name} (${exercise.intensity})`;
      exerciseSelect.appendChild(option);
    });
  }

  // 2) Toggle between preset and custom sections
  workoutTypeRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      const value = document.querySelector('input[name="workout-type"]:checked').value;

      if (value === 'preset') {
        presetSection.style.display = 'block';
        customSection.style.display = 'none';
      } else {
        presetSection.style.display = 'none';
        customSection.style.display = 'block';
      }

      showMessage('');
    });
  });

  // 3) Add workout (preset or custom)
  if (addBtn) {
    addBtn.addEventListener('click', () => {
      const selectedType = document.querySelector('input[name="workout-type"]:checked').value;

      if (selectedType === 'preset') {
        const exerciseIndex = exerciseSelect.value;
        const durationInput = document.getElementById('duration');
        const duration = parseInt(durationInput.value);

        if (exerciseIndex === '') {
          showMessage('Please select an exercise.', true);
          return;
        }
        if (!duration || duration <= 0) {
          showMessage('Please enter a valid duration.', true);
          return;
        }

        const exercise = exercisePresets[exerciseIndex];
        const caloriesBurned = Math.round(
          (exercise.caloriesPer30Min / 30) * duration
        );

        workouts.push({
          type: 'preset',
          name: exercise.name,
          intensity: exercise.intensity,
          minutes: duration,
          calories: caloriesBurned
        });

        exerciseSelect.value = '';
        durationInput.value = '';

        showMessage('Preset workout added!');
      } else {
        const name = customNameInput.value.trim();
        const sets = parseInt(customSetsInput.value);
        const reps = parseInt(customRepsInput.value);
        const minutes = customMinutesInput.value
          ? parseInt(customMinutesInput.value)
          : null;
        const calories = customCaloriesInput.value
          ? parseInt(customCaloriesInput.value)
          : null;

        if (!name) {
          showMessage('Please enter a workout name.', true);
          return;
        }
        if (!sets || sets <= 0) {
          showMessage('Please enter valid sets.', true);
          return;
        }
        if (!reps || reps <= 0) {
          showMessage('Please enter valid reps.', true);
          return;
        }

        workouts.push({
          type: 'custom',
          name: name,
          sets: sets,
          reps: reps,
          minutes: minutes,
          calories: calories
        });

        customNameInput.value = '';
        customSetsInput.value = '';
        customRepsInput.value = '';
        customMinutesInput.value = '';
        customCaloriesInput.value = '';

        showMessage('Custom workout added!');
      }

      saveWorkouts();
      renderTable();
    });
  }

  // 4) Clear all workouts
  if (clearAllBtn) {
    clearAllBtn.addEventListener('click', () => {
      if (workouts.length === 0) {
        showMessage('No workouts to clear.', true);
        return;
      }

      if (confirm('Are you sure you want to clear all workouts?')) {
        workouts = [];
        saveWorkouts();
        renderTable();
        showMessage('All workouts cleared.');
      }
    });
  }

  // 5) Delete a single workout
  if (tbody) {
    tbody.addEventListener('click', event => {
      const target = event.target;
      if (target.classList.contains('delete-workout-btn')) {
        const index = parseInt(target.getAttribute('data-index'));
        if (!isNaN(index) && index >= 0 && index < workouts.length) {
          workouts.splice(index, 1);
          saveWorkouts();
          renderTable();
          showMessage('Workout removed.');
        }
      }
    });
  }

  // Initial render
  renderTable();
});
