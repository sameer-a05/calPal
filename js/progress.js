// CalPal - Progress JavaScript
// Used on both Dashboard (index.html) and Progress page (progress.html)

document.addEventListener('DOMContentLoaded', function() {
  
    // ==================== DASHBOARD ELEMENTS ====================
    
    // Update calories metric on dashboard
    const metricCalories = document.getElementById('metric-calories');
    if (metricCalories) {
      metricCalories.textContent = `${sampleToday.caloriesIn} in / ${sampleToday.caloriesOut} out`;
    }
    
    // Update calories subtext on dashboard
    const metricCaloriesSub = document.getElementById('metric-calories-sub');
    if (metricCaloriesSub) {
      const diff = sampleToday.targetCalories - sampleToday.caloriesIn;
      if (diff > 0) {
        metricCaloriesSub.textContent = `About ${diff} kcal under your target.`;
      } else if (diff < 0) {
        metricCaloriesSub.textContent = `About ${Math.abs(diff)} kcal above your target.`;
      } else {
        metricCaloriesSub.textContent = 'Right on your estimated target.';
      }
    }
    
    // Update fit points on dashboard
    const fitpointsValue = document.getElementById('fitpoints-value');
    if (fitpointsValue) {
      fitpointsValue.textContent = `${sampleToday.fitPoints} pts`;
    }
    
    // Update fit points message on dashboard
    const fitpointsSub = document.getElementById('fitpoints-sub');
    if (fitpointsSub) {
      if (sampleToday.fitPoints < 30) {
        fitpointsSub.textContent = 'Get started! Reach 30 points to unlock your first badge.';
      } else if (sampleToday.fitPoints < 100) {
        fitpointsSub.textContent = 'Keep going! Reach 100 points to unlock your next badge.';
      } else {
        fitpointsSub.textContent = 'Amazing! You\'ve unlocked the 100+ points badge!';
      }
    }
    
    // Update goal progress text on dashboard
    const goalProgressText = document.getElementById('goal-progress-text');
    if (goalProgressText) {
      const startWeight = weightHistory[0].weight;
      const currentWeight = weightHistory[weightHistory.length - 1].weight;
      const change = startWeight - currentWeight;
      
      if (change > 0) {
        goalProgressText.textContent = `You're down ${change.toFixed(1)} lbs from the start of this sample week.`;
      } else if (change < 0) {
        goalProgressText.textContent = `You've gained ${Math.abs(change).toFixed(1)} lbs this sample week.`;
      } else {
        goalProgressText.textContent = `You've maintained your weight this sample week.`;
      }
    }
    
    // ==================== PROGRESS PAGE ELEMENTS ====================
    
    // Update weight current value
    const weightCurrent = document.getElementById('weight-current');
    if (weightCurrent) {
      const currentWeight = weightHistory[weightHistory.length - 1].weight;
      weightCurrent.textContent = `${currentWeight} lbs`;
    }
    
    // Update weight change text
    const weightChange = document.getElementById('weight-change');
    if (weightChange) {
      const startWeight = weightHistory[0].weight;
      const currentWeight = weightHistory[weightHistory.length - 1].weight;
      const change = startWeight - currentWeight;
      
      if (change > 0) {
        weightChange.textContent = `Down ${change.toFixed(1)} lbs this week`;
      } else if (change < 0) {
        weightChange.textContent = `Up ${Math.abs(change).toFixed(1)} lbs this week`;
      } else {
        weightChange.textContent = 'No change this week';
      }
    }
    
    // Create weight graph
    const weightGraph = document.getElementById('weight-graph');
    if (weightGraph) {
      weightGraph.innerHTML = '';
      
      // Find min and max weights for scaling
      const weights = weightHistory.map(d => d.weight);
      const minWeight = Math.min(...weights);
      const maxWeight = Math.max(...weights);
      const range = maxWeight - minWeight || 1; // Avoid division by zero
      
      // Create bars
      weightHistory.forEach(entry => {
        const bar = document.createElement('div');
        bar.className = 'bar';
        
        // Scale: lower weight = taller bar (inverse relationship for visual effect)
        const normalized = (maxWeight - entry.weight) / range;
        const height = 30 + (normalized * 70); // 30% to 100%
        bar.style.height = `${height}%`;
        bar.title = `${entry.day}: ${entry.weight} lbs`;
        
        weightGraph.appendChild(bar);
      });
    }
    
    // Update calorie balance
    const caloriesBalance = document.getElementById('calories-balance');
    if (caloriesBalance) {
      const net = sampleToday.caloriesIn - sampleToday.caloriesOut;
      caloriesBalance.textContent = `+${net}`;
    }
    
    // Update calorie balance detail
    const caloriesBalanceDetail = document.getElementById('calories-balance-detail');
    if (caloriesBalanceDetail) {
      caloriesBalanceDetail.textContent = `${sampleToday.caloriesIn} in | ${sampleToday.caloriesOut} out | ${sampleToday.targetCalories} target`;
    }
    
    // Create calories graph
    const caloriesGraph = document.getElementById('calories-graph');
    if (caloriesGraph) {
      caloriesGraph.innerHTML = '';
      
      // Create "in" bar
      const inBar = document.createElement('div');
      inBar.className = 'bar';
      inBar.style.height = '85%';
      inBar.style.background = 'linear-gradient(to top, #4ade80, #22c55e)';
      inBar.title = `Calories In: ${sampleToday.caloriesIn}`;
      caloriesGraph.appendChild(inBar);
      
      // Create "out" bar
      const outBar = document.createElement('div');
      outBar.className = 'bar';
      outBar.style.height = '40%';
      outBar.style.background = 'linear-gradient(to top, #ef4444, #dc2626)';
      outBar.title = `Calories Out: ${sampleToday.caloriesOut}`;
      caloriesGraph.appendChild(outBar);
    }
  });