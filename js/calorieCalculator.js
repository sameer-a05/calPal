// CalPal - Calorie Calculator JavaScript

// Calculate BMR using Mifflin-St Jeor formula
function calculateBMR(sex, weightLbs, heightInches, age) {
    // Convert to metric
    const weightKg = weightLbs * 0.453592;
    const heightCm = heightInches * 2.54;
    
    let bmr;
    if (sex === 'male') {
      bmr = 88.362 + (13.397 * weightKg) + (4.799 * heightCm) - (5.677 * age);
    } else {
      bmr = 447.593 + (9.247 * weightKg) + (3.098 * heightCm) - (4.330 * age);
    }
    
    return Math.round(bmr);
  }
  
  // Get activity multiplier
  function getActivityMultiplier(level) {
    const multipliers = {
      '1': 1.2,
      '2': 1.375,
      '3': 1.55,
      '4': 1.725,
      '5': 1.9
    };
    return multipliers[level] || 1.2;
  }
  
  // Get goal adjustment
  function getGoalAdjustment(goal) {
    const adjustments = {
      '1': 0,      // Maintain
      '2': -250,   // Mild loss
      '3': -500,   // Moderate loss
      '4': -750,   // Aggressive loss
      '5': 250,    // Mild gain
      '6': 500     // Moderate gain
    };
    return adjustments[goal] || 0;
  }
  
  // Clear results
  function clearResults() {
    document.getElementById('results-section').style.display = 'none';
    document.getElementById('bmr-value').textContent = '0';
    document.getElementById('target-value').textContent = '0';
    document.getElementById('protein-value').textContent = '0';
    document.getElementById('carbs-value').textContent = '0';
    document.getElementById('fat-value').textContent = '0';
    document.getElementById('results-message').textContent = '';
    document.getElementById('error-message').innerHTML = '';
  }
  
  // Show error message
  function showError(message) {
    const errorDiv = document.getElementById('error-message');
    errorDiv.innerHTML = `<div class="message error">${message}</div>`;
    setTimeout(() => {
      errorDiv.innerHTML = '';
    }, 5000);
  }
  
  // Initialize
  document.addEventListener('DOMContentLoaded', function() {
    const calculateBtn = document.getElementById('calculate-btn');
    const clearBtn = document.getElementById('clear-btn');
    
    // Calculate button
    calculateBtn.addEventListener('click', function() {
      // Get inputs
      const sex = document.getElementById('sex').value;
      const age = parseInt(document.getElementById('age').value);
      const heightFt = parseInt(document.getElementById('height-ft').value);
      const heightIn = parseInt(document.getElementById('height-in').value) || 0;
      const weight = parseInt(document.getElementById('weight').value);
      const activity = document.getElementById('activity').value;
      const goal = document.getElementById('goal').value;
      
      // Validate
      if (!age || !heightFt || !weight) {
        showError('Please fill in all required fields: age, height, and weight.');
        return;
      }
      
      if (age < 15 || age > 100) {
        showError('Please enter a valid age between 15 and 100.');
        return;
      }
      
      if (weight < 50 || weight > 500) {
        showError('Please enter a valid weight between 50 and 500 lbs.');
        return;
      }
      
      // Calculate total height in inches
      const totalHeightInches = (heightFt * 12) + heightIn;
      
      // Calculate BMR
      const bmr = calculateBMR(sex, weight, totalHeightInches, age);
      
      // Calculate maintenance calories
      const activityMultiplier = getActivityMultiplier(activity);
      const maintenance = Math.round(bmr * activityMultiplier);
      
      // Calculate target calories
      const goalAdjustment = getGoalAdjustment(goal);
      const targetCalories = maintenance + goalAdjustment;
      
      // Calculate macros
      const proteinGrams = Math.round((targetCalories * 0.30) / 4);
      const fatGrams = Math.round((targetCalories * 0.25) / 9);
      const carbsGrams = Math.round((targetCalories * 0.45) / 4);
      
      // Update UI
      document.getElementById('bmr-value').textContent = bmr;
      document.getElementById('target-value').textContent = targetCalories;
      document.getElementById('protein-value').textContent = proteinGrams;
      document.getElementById('carbs-value').textContent = carbsGrams;
      document.getElementById('fat-value').textContent = fatGrams;
      
      // Generate message
      let message = '';
      if (goalAdjustment < 0) {
        message = `Your target is set for weight loss. You'll create a calorie deficit of ${Math.abs(goalAdjustment)} kcal per day.`;
      } else if (goalAdjustment > 0) {
        message = `Your target is set for weight gain. You'll create a calorie surplus of ${goalAdjustment} kcal per day.`;
      } else {
        message = 'Your target is set to maintain your current weight.';
      }
      
      document.getElementById('results-message').textContent = message;
      document.getElementById('results-section').style.display = 'block';
      
      // Scroll to results
      document.getElementById('results-section').scrollIntoView({ behavior: 'smooth' });
    });
    
    // Clear button
    clearBtn.addEventListener('click', function() {
      document.getElementById('sex').value = 'male';
      document.getElementById('age').value = '';
      document.getElementById('height-ft').value = '';
      document.getElementById('height-in').value = '';
      document.getElementById('weight').value = '';
      document.getElementById('activity').value = '3';
      document.getElementById('goal').value = '2';
      clearResults();
    });
  });