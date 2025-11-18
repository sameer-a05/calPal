// CalPal - Weekly Schedule JavaScript




// Days of the week
const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// Multi-week, multi-day event storage
let eventsByWeek = {};
const totalWeeks = 4; // You can increase if needed

for (let w = 1; w <= totalWeeks; w++) {
  eventsByWeek[w] = {};
days.forEach(day => {
  eventsByWeek[w][day] = [];
});
}

// Selected week and day

let selectedWeek = 1;
let selectedDay = 'Monday';


// Show message
function showMessage(text, isError = false) {
  const messageDiv = document.getElementById('message');
  const className = isError ? 'message error' : 'message';
  messageDiv.innerHTML = `<div class="${className}">${text}</div>`;
  setTimeout(() => messageDiv.innerHTML = '', 3000);
}

// Render day buttons
function renderDayButtons() {
  const container = document.getElementById('day-buttons');
  container.innerHTML = '';

  days.forEach(day => {
    const btn = document.createElement('button');
    btn.className = 'day-btn';
    btn.textContent = day.substring(0, 3);
    if (day === selectedDay) btn.classList.add('active');

    btn.addEventListener('click', function () {
      selectedDay = day;
      renderDayButtons();
      renderEvents();
    });

    container.appendChild(btn);
  });
}

// Render events
function renderEvents() {
  const eventsList = document.getElementById('events-list');
  eventsList.innerHTML = '';

  const dayEvents = eventsByWeek[selectedWeek][selectedDay];

  if (dayEvents.length === 0) {
    const li = document.createElement('li');
    li.style.textAlign = 'center';
    li.style.color = '#a0a0a0';
    li.style.border = 'none';
    li.style.background = 'transparent';
    li.textContent = `No events for ${selectedDay} yet.`;
    eventsList.appendChild(li);
    return;
  }

  dayEvents.forEach((event, index) => {
    const li = document.createElement('li');

    let tagStyle = '';
    if (event.type === 'Workout') tagStyle = 'background: #3a3a3a; color: #4ade80;';
    else if (event.type === 'Meal Plan') tagStyle = 'background: #3a3a3a; color: #60a5fa;';
    else tagStyle = 'background: #3a3a3a; color: #fbbf24;';

    li.innerHTML = `
      <span class="event-tag" style="${tagStyle}">${event.type}</span>
      ${event.title}
      <button class="btn-remove" data-index="${index}" style="float: right;">✕</button>
    `;

    eventsList.appendChild(li);
  });

  document.querySelectorAll('.btn-remove').forEach(btn => {
    btn.addEventListener('click', function () {
      const index = parseInt(this.getAttribute('data-index'));
      eventsByWeek[selectedWeek][selectedDay].splice(index, 1);
      renderEvents();
      showMessage('Event removed.');
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const addBtn = document.getElementById('add-event-btn');
  const clearAllBtn = document.getElementById('clear-all-btn');

  const prevBtn = document.getElementById('prev-week');
  const nextBtn = document.getElementById('next-week');
  const weekLabel = document.getElementById('week-label');
  // NEW: Week dropdown element
  const weekSelect = document.getElementById('week-select');

  // NEW: Handle selecting week from dropdown
  weekSelect.addEventListener('change', () => {
    selectedWeek = parseInt(weekSelect.value);

    if (!eventsByWeek[selectedWeek]) {
      eventsByWeek[selectedWeek] = [];
    }

    updateWeekLabel();
    renderDayButtons();
    renderEvents();
  });

  function updateWeekLabel() {
  const weekLabel = document.getElementById('week-label');
  weekLabel.textContent = `Week ${selectedWeek}`;

  // Also sync dropdown to match current week
  const weekSelect = document.getElementById('week-select');
  if (weekSelect) weekSelect.value = selectedWeek;
}


  prevBtn.addEventListener('click', () => {
  if (selectedWeek > 1) {
    selectedWeek--;
    updateWeekLabel();
    renderDayButtons();
    renderEvents();
  } else showMessage("You're already at Week 1.", true);
});

 nextBtn.addEventListener('click', () => {
  if (selectedWeek < 4) selectedWeek++;
  updateWeekLabel();
  renderDayButtons();
  renderEvents();
});


  renderDayButtons();
  renderEvents();
  updateWeekLabel();

  addBtn.addEventListener('click', () => {
  const day = document.getElementById('day').value;
  const type = document.getElementById('event-type').value;
  const title = document.getElementById('event-title').value.trim();
  const selectedWeekFromDropdown = parseInt(weekSelect.value);

  if (!title) return showMessage('Please enter a description.', true);

  // Add the event to the correct week and day
  eventsByWeek[selectedWeekFromDropdown][day].push({ type, title });

  // Sync selectedWeek and selectedDay
  selectedWeek = selectedWeekFromDropdown;
  selectedDay = day;

  // Clear input
  document.getElementById('event-title').value = '';

  // Re-render
  updateWeekLabel();
  renderDayButtons();
  renderEvents();

  showMessage(`Event added to ${day}, Week ${selectedWeek}!`);
});

  clearAllBtn.addEventListener('click', () => {
    if (eventsByWeek[selectedWeek].length === 0)
      return showMessage('No events to clear.', true);

    if (confirm('Are you sure you want to clear all events?')) {
      eventsByWeek[selectedWeek] = [];
      renderEvents();
      showMessage('All events cleared.');
    }
  });
});
