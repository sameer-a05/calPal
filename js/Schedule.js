// CalPal - Weekly Schedule JavaScript

// Store events
let events = [];

// Days of the week
const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// Currently selected day
let selectedDay = 'Monday';

// Show message
function showMessage(text, isError = false) {
  const messageDiv = document.getElementById('message');
  const className = isError ? 'message error' : 'message';
  messageDiv.innerHTML = `<div class="${className}">${text}</div>`;
  setTimeout(() => {
    messageDiv.innerHTML = '';
  }, 3000);
}

// Render day buttons
function renderDayButtons() {
  const container = document.getElementById('day-buttons');
  container.innerHTML = '';
  
  days.forEach(day => {
    const btn = document.createElement('button');
    btn.className = 'day-btn';
    btn.textContent = day.substring(0, 3); // Mon, Tue, etc.
    if (day === selectedDay) {
      btn.classList.add('active');
    }
    
    btn.addEventListener('click', function() {
      selectedDay = day;
      renderDayButtons();
      renderEvents();
    });
    
    container.appendChild(btn);
  });
}

// Render events for selected day
function renderEvents() {
  const eventsList = document.getElementById('events-list');
  eventsList.innerHTML = '';
  
  // Filter events for selected day
  const dayEvents = events.filter(e => e.day === selectedDay);
  
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
  
  // Render each event
  dayEvents.forEach((event, globalIndex) => {
    // Find the actual index in the events array
    const actualIndex = events.indexOf(event);
    
    const li = document.createElement('li');
    
    // Determine tag color based on type
    let tagStyle = '';
    if (event.type === 'Workout') {
      tagStyle = 'background: #3a3a3a; color: #4ade80;';
    } else if (event.type === 'Meal Plan') {
      tagStyle = 'background: #3a3a3a; color: #60a5fa;';
    } else {
      tagStyle = 'background: #3a3a3a; color: #fbbf24;';
    }
    
    li.innerHTML = `
      <span class="event-tag" style="${tagStyle}">${event.type}</span>
      ${event.title}
      <button class="btn-remove" data-index="${actualIndex}" style="float: right;">✕</button>
    `;
    eventsList.appendChild(li);
  });
  
  // Add click handlers for remove buttons
  document.querySelectorAll('.btn-remove').forEach(btn => {
    btn.addEventListener('click', function() {
      const index = parseInt(this.getAttribute('data-index'));
      events.splice(index, 1);
      renderEvents();
      showMessage('Event removed.');
    });
  });
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
  const addBtn = document.getElementById('add-event-btn');
  const clearAllBtn = document.getElementById('clear-all-btn');
  
  // Render day buttons
  renderDayButtons();
  renderEvents();
  
  // Add event
  addBtn.addEventListener('click', function() {
    const day = document.getElementById('day').value;
    const type = document.getElementById('event-type').value;
    const title = document.getElementById('event-title').value.trim();
    
    // Validate
    if (!title) {
      showMessage('Please enter a description.', true);
      return;
    }
    
    // Add to events array
    events.push({
      day: day,
      type: type,
      title: title
    });
    
    // Clear input
    document.getElementById('event-title').value = '';
    
    // Set selected day and re-render
    selectedDay = day;
    renderDayButtons();
    renderEvents();
    
    showMessage(`Event added to ${day}!`);
  });
  
  // Clear all
  clearAllBtn.addEventListener('click', function() {
    if (events.length === 0) {
      showMessage('No events to clear.', true);
      return;
    }
    
    if (confirm('Are you sure you want to clear all events?')) {
      events = [];
      renderEvents();
      showMessage('All events cleared.');
    }
  });
});