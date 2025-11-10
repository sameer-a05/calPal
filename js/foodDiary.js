// CalPal - Food Diary JavaScript

// Store meals for current session
let meals = [];

// Show message
function showMessage(text, isError = false) {
  const messageDiv = document.getElementById('message');
  const className = isError ? 'message error' : 'message';
  messageDiv.innerHTML = `<div class="${className}">${text}</div>`;
  setTimeout(() => {
    messageDiv.innerHTML = '';
  }, 3000);
}

// Render meals table
function renderTable() {
  const tbody = document.getElementById('meals-tbody');
  const totalsDiv = document.getElementById('totals');
  
  // Clear table
  tbody.innerHTML = '';
  
  if (meals.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: #a0a0a0;">No meals logged yet.</td></tr>';
    totalsDiv.textContent = 'No meals logged yet.';
    return;
  }
  
  // Calculate totals
  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;
  
  // Render each meal
  meals.forEach((meal, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${meal.meal}</td>
      <td>${meal.name}</td>
      <td>${meal.calories}</td>
      <td>${meal.protein}</td>
      <td>${meal.carbs}</td>
      <td>${meal.fat}</td>
      <td><button class="btn-remove" data-index="${index}">✕</button></td>
    `;
    tbody.appendChild(row);
    
    // Add to totals
    totalCalories += meal.calories;
    totalProtein += meal.protein;
    totalCarbs += meal.carbs;
    totalFat += meal.fat;
  });
  
  // Add click handlers for remove buttons
  document.querySelectorAll('.btn-remove').forEach(btn => {
    btn.addEventListener('click', function() {
      const index = parseInt(this.getAttribute('data-index'));
      meals.splice(index, 1);
      renderTable();
      showMessage('Meal removed.');
    });
  });
  
  // Update totals display
  totalsDiv.textContent = `Total: ${totalCalories} kcal | Protein: ${totalProtein} g | Carbs: ${totalCarbs} g | Fat: ${totalFat} g`;
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
  const presetSelect = document.getElementById('preset');
  const addBtn = document.getElementById('add-btn');
  const clearAllBtn = document.getElementById('clear-all-btn');
  
  // Populate preset dropdown
  foodPresets.forEach((food, index) => {
    const option = document.createElement('option');
    option.value = index;
    option.textContent = food.name;
    presetSelect.appendChild(option);
  });
  
  // Handle preset selection
  presetSelect.addEventListener('change', function() {
    const index = this.value;
    if (index === '') {
      return;
    }
    
    const food = foodPresets[index];
    document.getElementById('food-name').value = food.name;
    document.getElementById('calories').value = food.calories;
    document.getElementById('protein').value = food.protein;
    document.getElementById('carbs').value = food.carbs;
    document.getElementById('fat').value = food.fat;
    
    showMessage('Preset loaded. You can adjust the values.');
  });
  
  // Add to diary
  addBtn.addEventListener('click', function() {
    const mealType = document.getElementById('meal-type').value;
    const name = document.getElementById('food-name').value.trim();
    const calories = parseInt(document.getElementById('calories').value) || 0;
    const protein = parseInt(document.getElementById('protein').value) || 0;
    const carbs = parseInt(document.getElementById('carbs').value) || 0;
    const fat = parseInt(document.getElementById('fat').value) || 0;
    
    // Validate
    if (!name) {
      showMessage('Please enter a food name.', true);
      return;
    }
    
    if (!calories) {
      showMessage('Please enter calories.', true);
      return;
    }
    
    // Add to meals array
    meals.push({
      meal: mealType,
      name: name,
      calories: calories,
      protein: protein,
      carbs: carbs,
      fat: fat
    });
    
    // Clear inputs
    document.getElementById('preset').value = '';
    document.getElementById('food-name').value = '';
    document.getElementById('calories').value = '';
    document.getElementById('protein').value = '';
    document.getElementById('carbs').value = '';
    document.getElementById('fat').value = '';
    
    showMessage('Meal added to diary!');
    renderTable();
  });
  
  // Clear all
  clearAllBtn.addEventListener('click', function() {
    if (meals.length === 0) {
      showMessage('No meals to clear.', true);
      return;
    }
    
    if (confirm('Are you sure you want to clear all meals?')) {
      meals = [];
      renderTable();
      showMessage('All meals cleared.');
    }
  });
  
  // Initial render
  renderTable();
});