// CalPal - Exercise Tracker JavaScript

// Load workouts from localStorage or use empty array
let workouts = JSON.parse(localStorage.getItem('dailyWorkouts')) || [];

// Show message
function showMessage(text, isError = false) {
  const messageDiv = document.getElementById('message');
  const className = isError ? 'message error' : 'message';
  messageDiv.innerHTML = `<div class="${className}">${text}</div>`;
  setTimeout(() => {
    messageDiv.innerHTML = '';
  }, 3000);
}

// Render workouts table
function renderTable() {
  const tbody = document.getElementById('workouts-tbody');
  const totalsDiv = document.getElementById('totals');
  
  // Clear table
  tbody.innerHTML = '';
  
  if (workouts.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: #a0a0a0;">No workouts logged yet.</td></tr>';
    totalsDiv.textContent = 'No workouts logged yet.';
    return;
  }
  
  // Calculate totals
  let totalMinutes = 0;
  let totalCalories = 0;
  
  // Render each workout
  workouts.forEach(workout => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${workout.name}</td>
      <td>${workout.intensity}</td>
      <td>${workout.minutes}</td>
      <td>${workout.calories}</td>
    `;
    tbody.appendChild(row);
    
    // Add to totals
    totalMinutes += workout.minutes;
    totalCalories += workout.calories;
  });
  
  // Update totals display
  totalsDiv.textContent = `Total: ${totalMinutes} min | Calories burned: ${totalCalories} kcal`;
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
  const exerciseSelect = document.getElementById('exercise');
  const addBtn = document.getElementById('add-workout-btn');
  const clearAllBtn = document.getElementById('clear-all-btn');
  
  // Populate exercise dropdown
  exercisePresets.forEach((exercise, index) => {
    const option = document.createElement('option');
    option.value = index;
    option.textContent = `${exercise.name} (${exercise.intensity})`;
    exerciseSelect.appendChild(option);
  });
  
  // Add workout
  addBtn.addEventListener('click', function() {
    const exerciseIndex = exerciseSelect.value;
    const duration = parseInt(document.getElementById('duration').value);
    
    // Validate
    if (exerciseIndex === '') {
      showMessage('Please select an exercise.', true);
      return;
    }
    
    if (!duration || duration <= 0) {
      showMessage('Please enter a valid duration.', true);
      return;
    }
    
    // Get exercise preset
    const exercise = exercisePresets[exerciseIndex];
    
    // Calculate calories burned
    const caloriesBurned = Math.round((exercise.caloriesPer30Min / 30) * duration);
    
    // Add to workouts array
    workouts.push({
      name: exercise.name,
      intensity: exercise.intensity,
      minutes: duration,
      calories: caloriesBurned
    });
    
    // Save to localStorage
    localStorage.setItem('dailyWorkouts', JSON.stringify(workouts));
    
    // Clear inputs
    document.getElementById('exercise').value = '';
    document.getElementById('duration').value = '';
    
    showMessage('Workout added!');
    renderTable();
  });
  
  // Clear all
  clearAllBtn.addEventListener('click', function() {
    if (workouts.length === 0) {
      showMessage('No workouts to clear.', true);
      return;
    }
    
    if (confirm('Are you sure you want to clear all workouts?')) {
      workouts = [];
      localStorage.setItem('dailyWorkouts', JSON.stringify(workouts));
      renderTable();
      showMessage('All workouts cleared.');
    }
  });
  
  // Initial render
  renderTable();
});