document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const taskInput = document.getElementById('task-input');
    const addTaskBtn = document.getElementById('add-task-btn');
    const taskList = document.getElementById('task-list');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    
    let currentFilter = 'all';
    let isDarkMode = false;
    
    // Initialize the app
    init();
    
    // Event Listeners
    addTaskBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') addTask();
    });
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            renderTasks();
        });
    });
    
    themeToggle.addEventListener('click', toggleTheme);
    
    // Functions
    function init() {
        // Check for saved theme preference
        const savedTheme = localStorage.getItem('todo-theme');
        if (savedTheme === 'dark') {
            toggleTheme();
        }
        
        renderTasks();
    }
    
    function addTask() {
        const taskText = taskInput.value.trim();
        if (taskText === '') return;
        
        const tasks = getTasks();
        tasks.push({
            id: Date.now(),
            text: taskText,
            completed: false
        });
        
        saveTasks(tasks);
        taskInput.value = '';
        renderTasks();
    }
    
    function renderTasks() {
        const tasks = getTasks();
        
        // Filter tasks based on current filter
        let filteredTasks = tasks;
        if (currentFilter === 'active') {
            filteredTasks = tasks.filter(task => !task.completed);
        } else if (currentFilter === 'completed') {
            filteredTasks = tasks.filter(task => task.completed);
        }
        
        // Render tasks
        taskList.innerHTML = '';
        
        if (filteredTasks.length === 0) {
            const emptyMsg = document.createElement('li');
            emptyMsg.textContent = currentFilter === 'all' ? 'No tasks yet!' : 
                                 currentFilter === 'active' ? 'No active tasks!' : 'No completed tasks!';
            emptyMsg.classList.add('empty-msg');
            taskList.appendChild(emptyMsg);
            return;
        }
        
        filteredTasks.forEach(task => {
            const taskItem = document.createElement('li');
            taskItem.classList.add('task-item');
            if (task.completed) taskItem.classList.add('completed');
            taskItem.dataset.id = task.id;
            
            taskItem.innerHTML = `
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                <span class="task-text">${task.text}</span>
                <div class="task-actions">
                    <button class="task-btn edit-btn"><i class="fas fa-edit"></i></button>
                    <button class="task-btn delete-btn"><i class="fas fa-trash"></i></button>
                </div>
            `;
            
            taskList.appendChild(taskItem);
            
            // Add event listeners to the new task
            const checkbox = taskItem.querySelector('.task-checkbox');
            const editBtn = taskItem.querySelector('.edit-btn');
            const deleteBtn = taskItem.querySelector('.delete-btn');
            
            checkbox.addEventListener('change', () => toggleTaskComplete(task.id));
            editBtn.addEventListener('click', () => editTask(task.id));
            deleteBtn.addEventListener('click', () => deleteTask(task.id));
        });
    }
    
    function toggleTaskComplete(id) {
        const tasks = getTasks();
        const taskIndex = tasks.findIndex(task => task.id === id);
        
        if (taskIndex !== -1) {
            tasks[taskIndex].completed = !tasks[taskIndex].completed;
            saveTasks(tasks);
            renderTasks();
        }
    }
    
    function editTask(id) {
        const tasks = getTasks();
        const taskIndex = tasks.findIndex(task => task.id === id);
        
        if (taskIndex !== -1) {
            const newText = prompt('Edit your task:', tasks[taskIndex].text);
            if (newText !== null && newText.trim() !== '') {
                tasks[taskIndex].text = newText.trim();
                saveTasks(tasks);
                renderTasks();
            }
        }
    }
    
    function deleteTask(id) {
        if (confirm('Are you sure you want to delete this task?')) {
            const tasks = getTasks();
            const updatedTasks = tasks.filter(task => task.id !== id);
            saveTasks(updatedTasks);
            renderTasks();
        }
    }
    
    function toggleTheme() {
        isDarkMode = !isDarkMode;
        body.classList.toggle('dark-mode', isDarkMode);
        
        // Update theme icon
        const icon = themeToggle.querySelector('i');
        icon.classList.toggle('fa-moon', !isDarkMode);
        icon.classList.toggle('fa-sun', isDarkMode);
        
        // Save theme preference
        localStorage.setItem('todo-theme', isDarkMode ? 'dark' : 'light');
    }
    
    // LocalStorage functions
    function getTasks() {
        const tasksJSON = localStorage.getItem('todo-tasks');
        return tasksJSON ? JSON.parse(tasksJSON) : [];
    }
    
    function saveTasks(tasks) {
        localStorage.setItem('todo-tasks', JSON.stringify(tasks));
    }
});