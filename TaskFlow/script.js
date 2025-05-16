// DOM Elements - Main Navigation
const sidebarLinks = document.querySelectorAll('.sidebar-nav li');
const tasksView = document.getElementById('tasks-view');
const calendarView = document.getElementById('calendar-view');
const settingsView = document.getElementById('settings-view');

// DOM Elements - Tasks
const addTaskBtn = document.getElementById('add-task-btn');
const addTaskCalendarBtn = document.getElementById('add-task-btn-calendar');
const closeModalBtn = document.getElementById('close-modal');
const cancelBtn = document.getElementById('cancel-btn');
const saveTaskBtn = document.getElementById('save-task-btn');
const taskModal = document.getElementById('task-modal');
const taskTitleInput = document.getElementById('task-title');
const taskDateInput = document.getElementById('task-date');
const taskPriorityInput = document.getElementById('task-priority');

// Task containers
const todayTasksContainer = document.getElementById('today-tasks');
const tomorrowTasksContainer = document.getElementById('tomorrow-tasks');
const upcomingTasksContainer = document.getElementById('upcoming-tasks');

// Task counters
const todayCountElement = document.getElementById('today-count');
const tomorrowCountElement = document.getElementById('tomorrow-count');
const upcomingCountElement = document.getElementById('upcoming-count');

// Date bubble elements
const dayNumberElement = document.getElementById('day-number');
const monthElement = document.getElementById('month');
const yearElement = document.getElementById('year');

// Calendar elements
const prevMonthBtn = document.getElementById('prev-month');
const nextMonthBtn = document.getElementById('next-month');
const calendarMonthYear = document.getElementById('calendar-month-year');
const calendarDays = document.getElementById('calendar-days');
const selectedDateElement = document.getElementById('selected-date');
const calendarTasksList = document.getElementById('calendar-tasks-list');

// Settings elements
const themeOptions = document.querySelectorAll('.theme-option');
const notificationToggle = document.getElementById('notification-toggle');

// Current state
let currentView = 'tasks';
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let currentDate = new Date();
let selectedDate = new Date();
const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                    'July', 'August', 'September', 'October', 'November', 'December'];

// Initialize date in the bubble
function initDateBubble() {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = today.toLocaleString('en-US', { month: 'short' });
    const year = today.getFullYear();
    
    dayNumberElement.textContent = day;
    monthElement.textContent = month;
    yearElement.textContent = year;
}

// Set minimum date to today for date input
function setMinDateToday() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    
    const todayFormatted = `${yyyy}-${mm}-${dd}`;
    taskDateInput.min = todayFormatted;
    taskDateInput.value = todayFormatted;
}

// Navigation between views
function switchView(viewName) {
    currentView = viewName;
    
    // Update sidebar active state
    sidebarLinks.forEach(link => {
        if (link.getAttribute('data-view') === viewName) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
    
    // Hide all views
    tasksView.classList.add('hidden');
    calendarView.classList.add('hidden');
    settingsView.classList.add('hidden');
    
    // Show selected view
    switch(viewName) {
        case 'tasks':
            tasksView.classList.remove('hidden');
            break;
        case 'calendar':
            calendarView.classList.remove('hidden');
            renderCalendar();
            break;
        case 'settings':
            settingsView.classList.remove('hidden');
            break;
    }
}

// Open modal
function openModal() {
    taskModal.classList.add('open');
    taskTitleInput.value = '';
    setMinDateToday();
    taskTitleInput.focus();
    
    // If opened from calendar view, set the selected date
    if (currentView === 'calendar') {
        const yyyy = selectedDate.getFullYear();
        const mm = String(selectedDate.getMonth() + 1).padStart(2, '0');
        const dd = String(selectedDate.getDate()).padStart(2, '0');
        
        taskDateInput.value = `${yyyy}-${mm}-${dd}`;
    }
}

// Close modal
function closeModal() {
    taskModal.classList.remove('open');
}

// Generate unique ID for tasks
function generateId() {
    return Date.now().toString();
}

// Format date for display
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
    });
}

// Format date for calendar header
function formatCalendarDate(date) {
    return `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
}

// Format date for daily task list
function formatSelectedDate(date) {
    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
}

// Determine which column a task belongs to
function getTaskColumn(dateString) {
    const taskDate = new Date(dateString);
    taskDate.setHours(0, 0, 0, 0);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (taskDate.getTime() === today.getTime()) {
        return 'today';
    } else if (taskDate.getTime() === tomorrow.getTime()) {
        return 'tomorrow';
    } else {
        return 'upcoming';
    }
}

// Add a new task
function addTask(title, date, priority) {
    const newTask = {
        id: generateId(),
        title,
        date,
        priority,
        completed: false,
        createdAt: new Date().toISOString()
    };
    
    tasks.push(newTask);
    saveTasks();
    renderTasks();
    
    // Update calendar if in calendar view
    if (currentView === 'calendar') {
        renderCalendar();
        renderCalendarTasks();
    }
}

// Delete a task
function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);
    saveTasks();
    renderTasks();
    
    // Update calendar if in calendar view
    if (currentView === 'calendar') {
        renderCalendar();
        renderCalendarTasks();
    }
}

// Toggle task completion
function toggleTaskCompletion(id) {
    tasks = tasks.map(task => {
        if (task.id === id) {
            return { ...task, completed: !task.completed };
        }
        return task;
    });
    
    saveTasks();
    renderTasks();
    
    // Update calendar tasks if in calendar view
    if (currentView === 'calendar') {
        renderCalendarTasks();
    }
}

// Save tasks to localStorage
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Create task card element for task columns
function createTaskCard(task) {
    const taskCard = document.createElement('div');
    taskCard.className = `task-card priority-${task.priority}`;
    
    if (task.completed) {
        taskCard.classList.add('completed');
    }
    
    taskCard.setAttribute('data-id', task.id);
    
    taskCard.innerHTML = `
        <div class="task-actions">
            <button class="complete-btn" title="Mark as ${task.completed ? 'incomplete' : 'complete'}">
                <i class="fas ${task.completed ? 'fa-check-circle' : 'fa-circle'}"></i>
            </button>
            <button class="delete-btn" title="Delete task">
                <i class="fas fa-trash"></i>
            </button>
        </div>
        <div class="task-title">${task.title}</div>
        <div class="task-due-date">
            <i class="far fa-calendar-alt"></i>
            ${formatDate(task.date)}
        </div>
    `;
    
    // Event listeners for task actions
    const completeBtn = taskCard.querySelector('.complete-btn');
    const deleteBtn = taskCard.querySelector('.delete-btn');
    
    completeBtn.addEventListener('click', () => {
        toggleTaskCompletion(task.id);
    });
    
    deleteBtn.addEventListener('click', () => {
        deleteTask(task.id);
    });
    
    return taskCard;
}

// Create task item for calendar view
function createCalendarTaskItem(task) {
    const taskItem = document.createElement('div');
    taskItem.className = `calendar-task-item priority-${task.priority}`;
    
    if (task.completed) {
        taskItem.classList.add('completed');
    }
    
    taskItem.setAttribute('data-id', task.id);
    
    taskItem.innerHTML = `
        <div class="calendar-task-title">${task.title}</div>
        <div class="calendar-task-actions">
            <button class="calendar-complete-btn" title="Mark as ${task.completed ? 'incomplete' : 'complete'}">
                <i class="fas ${task.completed ? 'fa-check-circle' : 'fa-circle'}"></i>
            </button>
            <button class="calendar-delete-btn" title="Delete task">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    
    // Event listeners for task actions
    const completeBtn = taskItem.querySelector('.calendar-complete-btn');
    const deleteBtn = taskItem.querySelector('.calendar-delete-btn');
    
    completeBtn.addEventListener('click', () => {
        toggleTaskCompletion(task.id);
    });
    
    deleteBtn.addEventListener('click', () => {
        deleteTask(task.id);
    });
    
    return taskItem;
}

// Create empty state element
function createEmptyState(message) {
    const emptyState = document.createElement('div');
    emptyState.className = 'empty-state';
    emptyState.innerHTML = `
        <i class="far fa-clipboard"></i>
        <div class="empty-state-text">${message}</div>
    `;
    return emptyState;
}

// Render tasks in task columns
function renderTasks() {
    // Group tasks by column
    const todayTasks = tasks.filter(task => getTaskColumn(task.date) === 'today');
    const tomorrowTasks = tasks.filter(task => getTaskColumn(task.date) === 'tomorrow');
    const upcomingTasks = tasks.filter(task => getTaskColumn(task.date) === 'upcoming');
    
    // Update counters
    todayCountElement.textContent = todayTasks.length;
    tomorrowCountElement.textContent = tomorrowTasks.length;
    upcomingCountElement.textContent = upcomingTasks.length;
    
    // Clear containers
    todayTasksContainer.innerHTML = '';
    tomorrowTasksContainer.innerHTML = '';
    upcomingTasksContainer.innerHTML = '';
    
    // Render today tasks
    if (todayTasks.length > 0) {
        todayTasks.forEach(task => {
            todayTasksContainer.appendChild(createTaskCard(task));
        });
    } else {
        todayTasksContainer.appendChild(createEmptyState('No tasks for today'));
    }
    
    // Render tomorrow tasks
    if (tomorrowTasks.length > 0) {
        tomorrowTasks.forEach(task => {
            tomorrowTasksContainer.appendChild(createTaskCard(task));
        });
    } else {
        tomorrowTasksContainer.appendChild(createEmptyState('No tasks for tomorrow'));
    }
    
    // Render upcoming tasks
    if (upcomingTasks.length > 0) {
        upcomingTasks.forEach(task => {
            upcomingTasksContainer.appendChild(createTaskCard(task));
        });
    } else {
        upcomingTasksContainer.appendChild(createEmptyState('No upcoming tasks'));
    }
}

// Calendar functions
function renderCalendar() {
    // Update the calendar header
    calendarMonthYear.textContent = formatCalendarDate(currentDate);
    
    // Clear the calendar days
    calendarDays.innerHTML = '';
    
    // Get the first day of the month (0-6, 0 = Sunday)
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
    // Adjust to start week on Monday
    const startingDay = firstDay === 0 ? 6 : firstDay - 1;
    
    // Get the last day of the month
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    
    // Get the last day of the previous month
    const prevMonthLastDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0).getDate();
    
    // Create days for previous month
    for (let i = 0; i < startingDay; i++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'day other-month';
        const dayNum = prevMonthLastDay - startingDay + i + 1;
        dayElement.innerHTML = `<div class="day-number">${dayNum}</div>`;
        calendarDays.appendChild(dayElement);
    }
    
    // Create days for current month
    const today = new Date();
    
    for (let i = 1; i <= lastDay; i++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'day';
        
        // Check if this day is today
        if (
            today.getDate() === i && 
            today.getMonth() === currentDate.getMonth() && 
            today.getFullYear() === currentDate.getFullYear()
        ) {
            dayElement.classList.add('today');
        }
        
        // Check if this day is selected
        if (
            selectedDate.getDate() === i && 
            selectedDate.getMonth() === currentDate.getMonth() && 
            selectedDate.getFullYear() === currentDate.getFullYear()
        ) {
            dayElement.classList.add('selected');
        }
        
        // Check if this day has tasks
        const dayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
        const dayTasks = getTasksForDate(dayDate);
        
        if (dayTasks.length > 0) {
            dayElement.classList.add('has-tasks');
            
            // Add task dots by priority
            const priorityCounts = {
                low: 0,
                medium: 0,
                high: 0
            };
            
            dayTasks.forEach(task => {
                priorityCounts[task.priority]++;
            });
            
            let dotsHTML = '';
            if (priorityCounts.high > 0) {
                dotsHTML += `<div class="day-task-dot priority-high"></div>`;
            }
            if (priorityCounts.medium > 0) {
                dotsHTML += `<div class="day-task-dot priority-medium"></div>`;
            }
            if (priorityCounts.low > 0) {
                dotsHTML += `<div class="day-task-dot priority-low"></div>`;
            }
            
            dayElement.innerHTML = `
                <div class="day-number">${i}</div>
                <div class="day-task-dots">${dotsHTML}</div>
            `;
        } else {
            dayElement.innerHTML = `<div class="day-number">${i}</div>`;
        }
        
        // Add click event
        dayElement.addEventListener('click', () => {
            // Remove selected class from all days
            document.querySelectorAll('.day.selected').forEach(day => {
                day.classList.remove('selected');
            });
            
            // Add selected class to clicked day
            dayElement.classList.add('selected');
            
            // Update selected date
            selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
            
            // Render tasks for this date
            renderCalendarTasks();
        });
        
        calendarDays.appendChild(dayElement);
    }
    
    // Calculate how many days to show from the next month
    const totalCells = 42; // 6 rows x 7 days
    const nextMonthDays = totalCells - (startingDay + lastDay);
    
    // Create days for next month
    for (let i = 1; i <= nextMonthDays; i++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'day other-month';
        dayElement.innerHTML = `<div class="day-number">${i}</div>`;
        calendarDays.appendChild(dayElement);
    }
    
    // Render tasks for the selected date
    renderCalendarTasks();
}

// Get tasks for a specific date
function getTasksForDate(date) {
    return tasks.filter(task => {
        const taskDate = new Date(task.date);
        return (
            taskDate.getDate() === date.getDate() &&
            taskDate.getMonth() === date.getMonth() &&
            taskDate.getFullYear() === date.getFullYear()
        );
    });
}

// Render tasks for the selected date in calendar view
function renderCalendarTasks() {
    // Update the selected date heading
    selectedDateElement.textContent = `Tasks: ${formatSelectedDate(selectedDate)}`;
    
    // Clear the tasks list
    calendarTasksList.innerHTML = '';
    
    // Get tasks for the selected date
    const dayTasks = getTasksForDate(selectedDate);
    
    // Display tasks or empty state
    if (dayTasks.length > 0) {
        dayTasks.forEach(task => {
            calendarTasksList.appendChild(createCalendarTaskItem(task));
        });
    } else {
        const emptyMessage = document.createElement('div');
        emptyMessage.className = 'empty-state';
        emptyMessage.innerHTML = `
            <i class="far fa-calendar-check"></i>
            <div class="empty-state-text">No tasks for this day</div>
        `;
        calendarTasksList.appendChild(emptyMessage);
    }
}

// Navigate to previous month
function prevMonth() {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
}

// Navigate to next month
function nextMonth() {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
}

// Theme functions
function setTheme(themeName) {
    document.body.className = `theme-${themeName}`;
    localStorage.setItem('theme', themeName);
    
    // Update active theme option
    themeOptions.forEach(option => {
        if (option.getAttribute('data-theme') === themeName) {
            option.classList.add('active');
        } else {
            option.classList.remove('active');
        }
    });
}

// Save task from modal
function saveTask() {
    const title = taskTitleInput.value.trim();
    const date = taskDateInput.value;
    const priority = taskPriorityInput.value;
    
    if (title === '') {
        taskTitleInput.classList.add('error');
        return;
    }
    
    addTask(title, date, priority);
    closeModal();
}

// Event listeners - Navigation
sidebarLinks.forEach(link => {
    link.addEventListener('click', () => {
        const view = link.getAttribute('data-view');
        switchView(view);
    });
});

// Event listeners - Tasks
addTaskBtn.addEventListener('click', openModal);
addTaskCalendarBtn.addEventListener('click', openModal);
closeModalBtn.addEventListener('click', closeModal);
cancelBtn.addEventListener('click', closeModal);
saveTaskBtn.addEventListener('click', saveTask);

// Event listeners - Calendar
prevMonthBtn.addEventListener('click', prevMonth);
nextMonthBtn.addEventListener('click', nextMonth);

// Event listeners - Settings
themeOptions.forEach(option => {
    option.addEventListener('click', () => {
        const theme = option.getAttribute('data-theme');
        setTheme(theme);
    });
});

// Event listeners - Modal outside click
window.addEventListener('click', (event) => {
    if (event.target === taskModal) {
        closeModal();
    }
});

// Initialize
function initialize() {
    initDateBubble();
    
    // Set default theme or load from localStorage
    const savedTheme = localStorage.getItem('theme') || 'default';
    setTheme(savedTheme);
    
    // Set default view
    switchView('tasks');
}

// Start the app
initialize();

// Add some example tasks if none exist
if (tasks.length === 0) {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    const formatDateForInput = (date) => {
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    };
    
    // Add example tasks
    tasks = [
        {
            id: '1',
            title: 'Exercise',
            date: formatDateForInput(nextWeek),
            priority: 'medium',
            completed: false,
            createdAt: new Date().toISOString()
        },
        {
            id: '2',
            title: 'undefined',
            date: formatDateForInput(nextWeek),
            priority: 'low',
            completed: false,
            createdAt: new Date().toISOString()
        }
    ];
    
    saveTasks();
    renderTasks();
}