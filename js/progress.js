// CalPal - Progress JavaScript
// Used on both Dashboard (index.html) and Progress page (progress.html)

document.addEventListener('DOMContentLoaded', function() {

  // ==================== DASHBOARD ELEMENTS ====================

  const metricCalories = document.getElementById('metric-calories');
  if (metricCalories && typeof sampleToday !== 'undefined') {
    metricCalories.textContent = `${sampleToday.caloriesIn} in / ${sampleToday.caloriesOut} out`;
  }

  const metricCaloriesSub = document.getElementById('metric-calories-sub');
  if (metricCaloriesSub && typeof sampleToday !== 'undefined') {
    const diff = sampleToday.targetCalories - sampleToday.caloriesIn;
    if (diff > 0) {
      metricCaloriesSub.textContent = `About ${diff} kcal under your target.`;
    } else if (diff < 0) {
      metricCaloriesSub.textContent = `About ${Math.abs(diff)} kcal above your target.`;
    } else {
      metricCaloriesSub.textContent = 'Right on your estimated target.';
    }
  }

  const fitpointsValue = document.getElementById('fitpoints-value');
  if (fitpointsValue && typeof sampleToday !== 'undefined') {
    fitpointsValue.textContent = `${sampleToday.fitPoints} pts`;
  }

  const fitpointsSub = document.getElementById('fitpoints-sub');
  if (fitpointsSub && typeof sampleToday !== 'undefined') {
    if (sampleToday.fitPoints < 30) {
      fitpointsSub.textContent = 'Get started! Reach 30 points to unlock your first badge.';
    } else if (sampleToday.fitPoints < 100) {
      fitpointsSub.textContent = 'Keep going! Reach 100 points to unlock your next badge.';
    } else {
      fitpointsSub.textContent = 'Amazing! You\'ve unlocked the 100+ points badge!';
    }
  }

  const goalProgressText = document.getElementById('goal-progress-text');
  if (goalProgressText && typeof weightHistory !== 'undefined' && weightHistory.length > 0) {
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

  const weightCurrent = document.getElementById('weight-current');
  if (weightCurrent && typeof weightHistory !== 'undefined' && weightHistory.length > 0) {
    const currentWeight = weightHistory[weightHistory.length - 1].weight;
    weightCurrent.textContent = `${currentWeight} lbs`;
  }

  const weightChange = document.getElementById('weight-change');
  if (weightChange && typeof weightHistory !== 'undefined' && weightHistory.length > 0) {
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

  const weightGraph = document.getElementById('weight-graph');
  if (weightGraph && typeof weightHistory !== 'undefined' && weightHistory.length > 0) {
    weightGraph.innerHTML = '';

    const weights = weightHistory.map(d => d.weight);
    const minWeight = Math.min(...weights);
    const maxWeight = Math.max(...weights);
    const range = maxWeight - minWeight || 1;

    weightHistory.forEach(entry => {
      const bar = document.createElement('div');
      bar.className = 'bar';

      const normalized = (maxWeight - entry.weight) / range;
      const height = 30 + (normalized * 70);
      bar.style.height = `${height}%`;
      bar.title = `${entry.day}: ${entry.weight} lbs`;

      weightGraph.appendChild(bar);
    });
  }

  const caloriesBalance = document.getElementById('calories-balance');
  if (caloriesBalance && typeof sampleToday !== 'undefined') {
    const net = sampleToday.caloriesIn - sampleToday.caloriesOut;
    caloriesBalance.textContent = `${net >= 0 ? '+' : ''}${net}`;
  }

  const caloriesBalanceDetail = document.getElementById('calories-balance-detail');
  if (caloriesBalanceDetail && typeof sampleToday !== 'undefined') {
    caloriesBalanceDetail.textContent =
      `${sampleToday.caloriesIn} in | ${sampleToday.caloriesOut} out | ${sampleToday.targetCalories} target`;
  }

  const caloriesGraph = document.getElementById('calories-graph');
  if (caloriesGraph && typeof sampleToday !== 'undefined') {
    caloriesGraph.innerHTML = '';

    const inBar = document.createElement('div');
    inBar.className = 'bar';
    inBar.style.height = '85%';
    inBar.style.background = 'linear-gradient(to top, #4ade80, #22c55e)';
    inBar.title = `Calories In: ${sampleToday.caloriesIn}`;
    caloriesGraph.appendChild(inBar);

    const outBar = document.createElement('div');
    outBar.className = 'bar';
    outBar.style.height = '40%';
    outBar.style.background = 'linear-gradient(to top, #ef4444, #dc2626)';
    outBar.title = `Calories Out: ${sampleToday.caloriesOut}`;
    caloriesGraph.appendChild(outBar);
  }

  // ==========================================
  //   Detailed Progress Chart + Log
  // ==========================================

  const metricSelect     = document.getElementById('progress-metric');
  const rangeSelect      = document.getElementById('progress-range');
  const groupingSelect   = document.getElementById('progress-grouping');
  const logDate          = document.getElementById('log-date');
  const logWeight        = document.getElementById('log-weight');
  const logCalories      = document.getElementById('log-calories');
  const logBtn           = document.getElementById('save-progress-log');
  const logMessage       = document.getElementById('log-message');
  const chartCanvas      = document.getElementById('progressChart');
  const entriesBody      = document.getElementById('progress-entries-body');
  const clearBtn         = document.getElementById('clear-progress-log');

  let progressChart = null;

  // --- helpers for localStorage ---

  function getStoredArray(key) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function saveStoredArray(key, arr) {
    localStorage.setItem(key, JSON.stringify(arr));
  }

  function upsertEntry(arr, date, updater) {
    let entry = arr.find(e => e.date === date);
    if (!entry) {
      entry = { date };
      arr.push(entry);
    }
    updater(entry);
  }

  // --- quick log save / delete ---

  function handleSaveLog() {
    if (!logDate) return;

    if (!logDate.value || (!logWeight.value && !logCalories.value)) {
      if (logMessage) {
        logMessage.textContent = 'Please enter a date and at least one value.';
      }
      return;
    }

    const date = logDate.value;

    if (logWeight.value) {
      const weightEntries = getStoredArray('weightEntries');
      upsertEntry(weightEntries, date, e => {
        e.weight = Number(logWeight.value);
      });
      saveStoredArray('weightEntries', weightEntries);
    }

    if (logCalories.value) {
      const calorieLog = getStoredArray('manualCalorieLog');
      upsertEntry(calorieLog, date, e => {
        e.caloriesIn = Number(logCalories.value);
      });
      saveStoredArray('manualCalorieLog', calorieLog);
    }

    if (logMessage) {
      logMessage.textContent = 'Entry saved.';
    }
    logWeight.value = '';
    logCalories.value = '';

    renderEntriesTable();
    renderProgressChart();
  }

  function deleteEntriesForDate(date) {
    const weightEntries = getStoredArray('weightEntries').filter(e => e.date !== date);
    const calorieLog    = getStoredArray('manualCalorieLog').filter(e => e.date !== date);
    saveStoredArray('weightEntries', weightEntries);
    saveStoredArray('manualCalorieLog', calorieLog);

    if (logMessage) {
      logMessage.textContent = `Deleted entries for ${date}.`;
    }
    renderEntriesTable();
    renderProgressChart();
  }

  function clearAllEntries() {
    saveStoredArray('weightEntries', []);
    saveStoredArray('manualCalorieLog', []);
    if (logMessage) {
      logMessage.textContent = 'All progress entries cleared.';
    }
    renderEntriesTable();
    renderProgressChart();
  }

  // --- build series for chart ---

  function buildSeries() {
    const metric   = metricSelect  ? metricSelect.value  : 'weight';
    const range    = rangeSelect   ? rangeSelect.value   : '7';
    const grouping = groupingSelect? groupingSelect.value: 'day';

    const weightEntries = getStoredArray('weightEntries');
    const calorieLog    = getStoredArray('manualCalorieLog');

    const map = new Map();
    const now = new Date();

    function inRange(dateObj) {
      if (range === 'all') return true;
      const days = Number(range);
      const cutoff = new Date();
      cutoff.setDate(now.getDate() - (days - 1));
      return dateObj >= cutoff;
    }

    function getKey(dateObj) {
      const y = dateObj.getFullYear();
      const m = String(dateObj.getMonth() + 1).padStart(2, '0');
      const d = String(dateObj.getDate()).padStart(2, '0');
      if (grouping === 'year')  return `${y}`;
      if (grouping === 'month') return `${y}-${m}`;
      return `${y}-${m}-${d}`;
    }

    if (metric === 'weight') {
      weightEntries.forEach(e => {
        if (!e.date || typeof e.weight !== 'number') return;
        const dateObj = new Date(e.date);
        if (isNaN(dateObj) || !inRange(dateObj)) return;
        const key = getKey(dateObj);
        map.set(key, Number(e.weight));
      });
    } else {
      calorieLog.forEach(e => {
        if (!e.date) return;
        const dateObj = new Date(e.date);
        if (isNaN(dateObj) || !inRange(dateObj)) return;
        const key = getKey(dateObj);

        const inVal  = Number(e.caloriesIn  || 0);
        const outVal = Number(e.caloriesOut || 0);

        let val = 0;
        if (metric === 'caloriesIn')  val = inVal;
        if (metric === 'caloriesOut') val = outVal;
        if (metric === 'netCalories') val = inVal - outVal;

        if (isNaN(val)) return;
        map.set(key, (map.get(key) || 0) + val);
      });
    }

    const labels = Array.from(map.keys()).sort();
    const values = labels.map(key => map.get(key));

    return { labels, values, metric };
  }

  // --- chart rendering ---

  function renderProgressChart() {
    if (!chartCanvas || typeof Chart === 'undefined') return;

    const { labels, values, metric } = buildSeries();

    if (!labels.length) {
      if (progressChart) {
        progressChart.destroy();
        progressChart = null;
      }
      if (logMessage) {
        logMessage.textContent = 'No data yet. Log some weight or calories to see your chart.';
      }
      return;
    }

    // clear any old "no data" message
    if (logMessage && logMessage.textContent.startsWith('No data yet')) {
      logMessage.textContent = '';
    }

    const minVal  = Math.min(...values);
    const maxVal  = Math.max(...values);
    const range   = maxVal - minVal || 1;
    const padding = range * 0.1;

    const ctx = chartCanvas.getContext('2d');
    if (progressChart) {
      progressChart.destroy();
    }

    const labelText =
      metric === 'weight'
        ? 'Weight (lbs)'
        : metric === 'caloriesIn'
        ? 'Calories In'
        : metric === 'caloriesOut'
        ? 'Calories Out'
        : 'Net Calories';

    progressChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: labelText,
          data: values,
          borderWidth: 2,
          fill: false,
          pointRadius: 4,
          pointHoverRadius: 6,
          tension: 0.3
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: true }
        },
        scales: {
          x: {
            ticks: { color: '#e0e0e0' },
            grid: { color: '#333333' }
          },
          y: {
            min: minVal - padding,
            max: maxVal + padding,
            ticks: { color: '#e0e0e0' },
            grid: { color: '#333333' }
          }
        },
        elements: {
          line: { tension: 0.3 },
          point: { radius: 4 }
        }
      }
    });
  }

  // --- entries table rendering ---

  function renderEntriesTable() {
    if (!entriesBody) return;

    const weightEntries = getStoredArray('weightEntries');
    const calorieLog    = getStoredArray('manualCalorieLog');

    const map = new Map();

    weightEntries.forEach(e => {
      if (!map.has(e.date)) map.set(e.date, { date: e.date });
      map.get(e.date).weight = e.weight;
    });

    calorieLog.forEach(e => {
      if (!map.has(e.date)) map.set(e.date, { date: e.date });
      map.get(e.date).caloriesIn = e.caloriesIn;
    });

    const rows = Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
    entriesBody.innerHTML = '';

    if (!rows.length) {
      const tr = document.createElement('tr');
      const td = document.createElement('td');
      td.colSpan = 4;
      td.textContent = 'No entries logged yet.';
      td.style.textAlign = 'center';
      td.style.color = '#a0a0a0';
      tr.appendChild(td);
      entriesBody.appendChild(tr);
      return;
    }

    rows.forEach(entry => {
      const tr = document.createElement('tr');

      const tdDate = document.createElement('td');
      tdDate.textContent = entry.date;

      const tdWeight = document.createElement('td');
      tdWeight.textContent =
        typeof entry.weight === 'number' ? entry.weight : '—';

      const tdCalories = document.createElement('td');
      tdCalories.textContent =
        typeof entry.caloriesIn === 'number' ? entry.caloriesIn : '—';

      const tdActions = document.createElement('td');
      const delBtn = document.createElement('button');
      delBtn.textContent = 'Delete';
      delBtn.className = 'btn btn-secondary';
      delBtn.addEventListener('click', () => deleteEntriesForDate(entry.date));
      tdActions.appendChild(delBtn);

      tr.appendChild(tdDate);
      tr.appendChild(tdWeight);
      tr.appendChild(tdCalories);
      tr.appendChild(tdActions);

      entriesBody.appendChild(tr);
    });
  }

  // --- wire up events on Progress page ---

  if (chartCanvas && typeof Chart !== 'undefined') {
    if (logDate) {
      logDate.value = new Date().toISOString().slice(0, 10);
    }

    if (logBtn)   logBtn.addEventListener('click', handleSaveLog);
    if (clearBtn) clearBtn.addEventListener('click', clearAllEntries);

    [metricSelect, rangeSelect, groupingSelect].forEach(sel => {
      if (sel) sel.addEventListener('change', renderProgressChart);
    });

    renderEntriesTable();
    renderProgressChart();
  }
});
