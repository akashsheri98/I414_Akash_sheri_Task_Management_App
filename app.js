// DOM Elements - Selecting all required elements from the HTML document
const taskForm = document.querySelector('.task-form');
const taskTitleInput = document.getElementById('taskTitle');
const taskDescInput = document.getElementById('taskDescription');
const taskDueDateInput = document.getElementById('taskDueDate');
const taskPriorityInput = document.getElementById('taskPriority');
const addTaskBtn = document.getElementById('addTask');
const updateTaskBtn = document.getElementById('updateTask');
const cancelEditBtn = document.getElementById('cancelEdit');
const taskListContainer = document.getElementById('taskList');
const searchInput = document.getElementById('searchTask');
const statusFilter = document.getElementById('statusFilter');
const notificationEl = document.getElementById('notification');

// Set default due date to tomorrow for better user experience
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
taskDueDateInput.value = tomorrow.toISOString().split('T')[0]; // Format as YYYY-MM-DD

// Task management - Main data structures and state variables
let tasks = []; // Array to store all tasks
let currentTaskId = null; // Tracks which task is being edited (null when not in edit mode)

/**
 * Loads tasks from browser's local storage when the application starts
 * This ensures task persistence between page refreshes
 */
function loadTasks() {
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
        tasks = JSON.parse(savedTasks);
        renderTasks(); // Display tasks on initial load
    }
}

/**
 * Saves the current tasks array to local storage
 * Called whenever tasks are added, updated, or deleted
 */
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

/**
 * Generates a unique ID for each task
 */
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/* Displays a temporary notification message to the user*/
function showNotification(message, type) {
    notificationEl.textContent = message;
    notificationEl.className = `notification ${type}`;
    notificationEl.style.display = 'block';
    
    // Auto-hide notification after 3 seconds
    setTimeout(() => {
        notificationEl.style.display = 'none';
    }, 3000);
}

/**
 * Adds a new task to the task list
 * Validates input, creates task object, and updates UI
 */
function addTask() {
    const title = taskTitleInput.value.trim();
    const description = taskDescInput.value.trim();
    const dueDate = taskDueDateInput.value;
    const priority = taskPriorityInput.value;
    
    // Validate required fields
    if (!title) {
        showNotification('Task title cannot be empty', 'error');
        return;
    }
    
    // Create new task object with all properties
    const newTask = {
        id: generateId(),
        title,
        description,
        dueDate,
        priority,
        completed: false,
        createdAt: new Date().toISOString()
    };
    
    // Add to tasks array, save to storage, and update UI
    tasks.push(newTask);
    saveTasks();
    resetForm();
    renderTasks();
    
    showNotification('Task added successfully', 'success');
}

/**
 * Prepares the form for editing an existing task
 * Loads task data into form fields and switches form to edit mode
 */
function startEditTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    // Populate form with task data
    taskTitleInput.value = task.title;
    taskDescInput.value = task.description;
    taskDueDateInput.value = task.dueDate;
    taskPriorityInput.value = task.priority;
    
    // Switch to edit mode UI
    addTaskBtn.style.display = 'none';
    updateTaskBtn.style.display = 'inline-block';
    cancelEditBtn.style.display = 'inline-block';
    
    // Store current task ID for update operation
    currentTaskId = taskId;

    // Scroll to the form for better UX
    taskForm.scrollIntoView({ behavior: 'smooth' });
    
    // Focus on the title input field after scrolling completes
    setTimeout(() => {
        taskTitleInput.focus();
    }, 500); // Small delay to ensure scroll completes first
}

/**
 * Updates an existing task with edited form values
 * Validates input, updates task object, and refreshes UI
 */
function updateTask() {
    const title = taskTitleInput.value.trim();
    
    // Validate required fields
    if (!title) {
        showNotification('Task title cannot be empty', 'error');
        return;
    }
    
    // Find the task index in the array
    const taskIndex = tasks.findIndex(t => t.id === currentTaskId);
    if (taskIndex === -1) return;
    
    // Update task object while preserving other properties (like completion status)
    tasks[taskIndex] = {
        ...tasks[taskIndex],
        title,
        description: taskDescInput.value.trim(),
        dueDate: taskDueDateInput.value,
        priority: taskPriorityInput.value
    };
    
    // Save changes and update UI
    saveTasks();
    resetForm();
    renderTasks();
    
    showNotification('Task updated successfully', 'success');
}

/**
 * Cancels the edit operation and resets the form
 */
function cancelEdit() {
    resetForm();
}

/* Deletes a task after confirmation*/
function deleteTask(taskId) {
    if (!confirm('Are you sure you want to delete this task?')) return;
    
    // Remove task from array
    tasks = tasks.filter(task => task.id !== taskId);
    saveTasks();
    renderTasks();
    
    // Reset form if the deleted task was being edited
    if (currentTaskId === taskId) {
        resetForm();
    }
    
    showNotification('Task deleted successfully', 'success');
}

/*Toggles the completion status of a task*/
function toggleTaskCompletion(taskId) {
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) return;
    
    // Toggle the completed status
    tasks[taskIndex].completed = !tasks[taskIndex].completed;
    saveTasks();
    renderTasks();
    
    // Show appropriate notification
    const status = tasks[taskIndex].completed ? 'completed' : 'pending';
    showNotification(`Task marked as ${status}`, 'success');
}

/* Resets the form to its initial state*/
function resetForm() {
    // Clear input fields
    taskTitleInput.value = '';
    taskDescInput.value = '';
    
    // Reset due date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    taskDueDateInput.value = tomorrow.toISOString().split('T')[0];
    
    // Reset priority to default
    taskPriorityInput.value = 'medium';
    
    // Switch to add mode UI
    addTaskBtn.style.display = 'inline-block';
    updateTaskBtn.style.display = 'none';
    cancelEditBtn.style.display = 'none';
    
    // Clear current task ID
    currentTaskId = null;
}

/* Formats a date string for display*/
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}


function filterTasks() {
    const searchTerm = searchInput.value.toLowerCase();
    const statusFilter = document.getElementById('statusFilter').value;
    
    return tasks.filter(task => {
        // Match by title or description text
        const matchesSearch = 
            task.title.toLowerCase().includes(searchTerm) || 
            task.description.toLowerCase().includes(searchTerm);
        
        // Match by completion status
        const matchesStatus = 
            statusFilter === 'all' || 
            (statusFilter === 'completed' && task.completed) || 
            (statusFilter === 'pending' && !task.completed);
        
        // Task must match both criteria
        return matchesSearch && matchesStatus;
    });
}


function renderTasks() {
    // Get filtered tasks based on search and status filter
    const filteredTasks = filterTasks();
    
    // Sort tasks by due date (closest first)
    filteredTasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    
    // Show empty state if no tasks match filters
    if (filteredTasks.length === 0) {
        taskListContainer.innerHTML = `
            <div class="empty-state">
                <p>No tasks found.</p>
            </div>
        `;
        return;
    }
    
    // Clear the task list container
    taskListContainer.innerHTML = '';
    
    // Create and append task elements
    filteredTasks.forEach(task => {
        const taskEl = document.createElement('div');
        taskEl.className = `task-item ${task.completed ? 'task-completed' : ''}`;
        
        // Check if task is overdue (past due date and not completed)
        const isOverdue = !task.completed && new Date(task.dueDate) < new Date().setHours(0, 0, 0, 0);
        
        // Color coding based on priority
        const priorityColors = {
            low: '#3498db',    // Blue
            medium: '#f39c12', // Orange
            high: '#e74c3c'    // Red
        };
        
        // Build task HTML structure
        taskEl.innerHTML = `
            <div class="task-header">
                <div class="task-title" style="border-left: 4px solid ${priorityColors[task.priority]}; padding-left: 8px;">
                    ${task.title}
                </div>
                
                <div class="task-date" style="${isOverdue ? 'color: #e74c3c; font-weight: bold;' : ''}">
                    Due: ${formatDate(task.dueDate)}
                    ${isOverdue ? ' (Overdue)' : ''}
                </div>
            </div>
            <div class="task-description">
                ${task.description || '<em>No description</em>'}
            </div>
            <div class="button-group">
                <button class="${task.completed ? '' : 'complete'}" onclick="toggleTaskCompletion('${task.id}')">
                    ${task.completed ? 'Mark as Pending' : 'Complete'}
                </button>
                <button class="edit" onclick="startEditTask('${task.id}')">Edit</button>
                <button class="delete" onclick="deleteTask('${task.id}')">Delete</button>
            </div>
        `;
        
        // Add the task element to the container
        taskListContainer.appendChild(taskEl);
    });
}

// Event Listeners - Set up user interaction handlers
addTaskBtn.addEventListener('click', addTask);
updateTaskBtn.addEventListener('click', updateTask);
cancelEditBtn.addEventListener('click', cancelEdit);
searchInput.addEventListener('input', renderTasks); // Real-time search filtering
statusFilter.addEventListener('change', renderTasks); // Status filtering

// Initialize app - Load saved tasks when page loads
loadTasks();

// Make functions available to inline event handlers in HTML
// This allows onclick attributes to call these functions
window.deleteTask = deleteTask;
window.startEditTask = startEditTask;
window.toggleTaskCompletion = toggleTaskCompletion;