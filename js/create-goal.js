// CalPal - Create Goal Page Functions

document.addEventListener('DOMContentLoaded', function() {
  const goalForm = document.getElementById('goal-form');
  goalForm.addEventListener('submit', handleSubmit);

  const typeSelect = document.getElementById('goal-type');
  if (typeSelect) {
    typeSelect.addEventListener('change', handleTypeChange);
    // initialize visibility
    handleTypeChange({ target: typeSelect });
  }
});

function handleSubmit(event) {
  event.preventDefault();

  // Get form values
  const title = document.getElementById('goal-title').value.trim();
  const description = document.getElementById('goal-description').value.trim();
  const type = document.getElementById('goal-type').value;
  const targetVal = document.getElementById('goal-target').value;
  const target = targetVal === '' ? null : parseFloat(targetVal);
  const startDate = document.getElementById('start-date').value || '';
  const endDate = document.getElementById('end-date').value || '';
  const initialProgressInput = document.getElementById('goal-progress');
  const initialProgress = initialProgressInput ? parseFloat(initialProgressInput.value) : 0;

  // Validate inputs
  if (!title) {
    document.getElementById('title-error').style.display = 'block';
    return;
  } else {
    document.getElementById('title-error').style.display = 'none';
  }

  // Type-specific validation
  if ((type === 'Exercise' || type === 'Weight Loss') && (!target || target <= 0 || isNaN(target))) {
    document.getElementById('target-error').style.display = 'block';
    return;
  } else {
    const te = document.getElementById('target-error'); if (te) te.style.display = 'none';
  }

  if (type === 'Custom' && (isNaN(initialProgress) || initialProgress < 0 || initialProgress > 100)) {
    document.getElementById('progress-error').style.display = 'block';
    return;
  } else {
    const pe = document.getElementById('progress-error'); if (pe) pe.style.display = 'none';
  }

  // Build goal object
  const newGoal = {
    title: title,
    description: description,
    type: type,
    startDate: startDate,
    endDate: endDate,
    target: (type === 'Custom') ? null : (isNaN(target) ? null : target),
    // For Exercise/Weight Loss: store numeric progress (workouts completed or lbs lost)
    // For Custom: store percentage (0-100)
    progress: (type === 'Custom') ? (isNaN(initialProgress) ? 0 : initialProgress) : 0,
    // Reward will be calculated automatically when the goal is completed
    reward: null,
    status: 'In Progress',
    dateCreated: new Date().toLocaleDateString()
  };

  // Get existing goals from localStorage
  let userGoals = JSON.parse(localStorage.getItem('userGoals')) || [];

  // Add new goal
  userGoals.push(newGoal);

  // Save to localStorage
  localStorage.setItem('userGoals', JSON.stringify(userGoals));

  // Show success message
  const successMessage = document.getElementById('success-message');
  if (successMessage) successMessage.style.display = 'block';

  // Redirect to dashboard after 1.2 seconds
  setTimeout(() => {
    window.location.href = 'index.html';
  }, 1200);
}

function cancelGoal() {
  if (confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
    window.location.href = 'index.html';
  }
}

// Show/hide fields based on type
function handleTypeChange(e) {
  const type = e.target ? e.target.value : e;
  const customGroup = document.getElementById('custom-progress-group');
  const targetGroup = document.getElementById('target-group');
  const targetInput = document.getElementById('goal-target');
  const titleInput = document.getElementById('goal-title');

  if (type === 'Custom') {
    if (customGroup) customGroup.style.display = 'block';
    if (targetGroup) targetGroup.style.display = 'none';
    
    // Update title placeholder for Custom
    if (titleInput) {
      titleInput.placeholder = 'e.g., Try Meditation';
    }
  } else {
    if (customGroup) customGroup.style.display = 'none';
    if (targetGroup) targetGroup.style.display = 'block';
    
    // Update placeholders based on goal type
    if (type === 'Exercise') {
      if (titleInput) titleInput.placeholder = 'e.g., Complete 5 Workouts by Friday';
      if (targetInput) targetInput.placeholder = 'Enter the number of workouts you wish to complete';
    } else if (type === 'Weight Loss') {
      if (titleInput) titleInput.placeholder = 'e.g., Lose 5 Pounds by December';
      if (targetInput) targetInput.placeholder = 'Enter the number of pounds you would like to lose';
    }
  }
}
