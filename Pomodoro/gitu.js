// Study Buddy - Main Script

document.addEventListener('DOMContentLoaded', () => {
    // Initialize both modules
    initPomodoro();
    initTodoList();
    initCharacter();
});

// ============== POMODORO TIMER ==============
function initPomodoro() {
    // DOM Elements
    const timeDisplay = document.getElementById('time-display');
    const startButton = document.getElementById('start-timer');
    const pauseButton = document.getElementById('pause-timer');
    const resetButton = document.getElementById('reset-timer');
    const focusMinutesInput = document.getElementById('focus-minutes');
    const breakMinutesInput = document.getElementById('break-minutes');
    const timerStatus = document.getElementById('timer-status');

    // Timer Variables
    let timer;
    let isRunning = false;
    let isBreak = false;
    let totalSeconds = parseInt(focusMinutesInput.value) * 60;
    let originalSeconds = totalSeconds;

    // Sounds
    const startSound = new Audio('./beep.mp3');
    const breakSound = new Audio('./beep.mp3');
    const completeSound = new Audio('./beep.mp3');

    // Update Display Function
    function updateDisplay() {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        timeDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    // Timer Function
    function startTimer() {
        if (!isRunning) {
            isRunning = true;
            startButton.disabled = true;
            pauseButton.disabled = false;

            // Add visual feedback
            document.querySelector('.timer-circle').parentNode.parentNode.classList.add(isBreak ? 'timer-break' : 'timer-running');
            document.body.classList.add('focus-mode');

            timerStatus.textContent = isBreak ? '⏸️ Break time' : '🎯 Lock in';

            timer = setInterval(() => {
                if (totalSeconds <= 0) {
                    clearInterval(timer);
                    isRunning = false;

                    // Switch between focus and break
                    isBreak = !isBreak;
                    totalSeconds = isBreak
                        ? parseInt(breakMinutesInput.value) * 60
                        : parseInt(focusMinutesInput.value) * 60;
                    originalSeconds = totalSeconds;

                    // Play sound and show notification
                    if (isBreak) {
                        breakSound.play();
                        showToast('Time for a break. Relax for a bit');
                        updateCharacterMessage('Rest up, clear your mind');
                    } else {
                        startSound.play();
                        showToast('Back at it, you can do this');
                        updateCharacterMessage('Let’s get back to it. You’ve got this');
                    }
                    

                    // Update visual
                    document.querySelector('.timer-circle').parentNode.parentNode.classList.remove('timer-running', 'timer-break');
                    document.querySelector('.timer-circle').parentNode.parentNode.classList.add(isBreak ? 'timer-break' : 'timer-running');

                    updateDisplay();
                    startTimer(); // Auto start next session
                } else {
                    totalSeconds--;
                    updateDisplay();

                    // Update character message based on progress
                    const progress = totalSeconds / originalSeconds;
                    if (progress <= 0.25 && !isBreak) {
                        updateCharacterMessage('Almost finished, keep it up ');
                    }
                }
            }, 1000);
        }
    }

    // Event Listeners
    startButton.addEventListener('click', () => {
        if (!isRunning) {
            startSound.play();
            startTimer();
        }
    });

    pauseButton.addEventListener('click', () => {
        if (isRunning) {
            clearInterval(timer);
            isRunning = false;
            startButton.disabled = false;
            pauseButton.disabled = true;
            document.body.classList.remove('focus-mode');
            timerStatus.textContent = '⏸️ Timer paused';
        }
    });

    resetButton.addEventListener('click', () => {
        clearInterval(timer);
        isRunning = false;
        isBreak = false;
        totalSeconds = parseInt(focusMinutesInput.value) * 60;
        originalSeconds = totalSeconds;
        updateDisplay();
        startButton.disabled = false;
        pauseButton.disabled = true;
        document.body.classList.remove('focus-mode');
        document.querySelector('.timer-circle').parentNode.parentNode.classList.remove('timer-running', 'timer-break');
        timerStatus.textContent = 'Let’s begin, shall we?';
        updateCharacterMessage('Semangat belajarnya!');
    });

    // Input change handlers
    focusMinutesInput.addEventListener('change', () => {
        if (!isRunning) {
            let value = parseInt(focusMinutesInput.value);
            value = Math.max(1, Math.min(120, value));
            focusMinutesInput.value = value;
            if (!isBreak) {
                totalSeconds = value * 60;
                originalSeconds = totalSeconds;
                updateDisplay();
            }
        }
    });

    breakMinutesInput.addEventListener('change', () => {
        if (!isRunning) {
            let value = parseInt(breakMinutesInput.value);
            value = Math.max(1, Math.min(30, value));
            breakMinutesInput.value = value;
            if (isBreak) {
                totalSeconds = value * 60;
                originalSeconds = totalSeconds;
                updateDisplay();
            }
        }
    });

    // Initialize display
    updateDisplay();
}

// ============== TODO LIST ==============
function initTodoList() {
    // DOM Elements
    const todoInput = document.getElementById('todo-input');
    const addTodoBtn = document.getElementById('add-todo');
    const todosContainer = document.getElementById('todos-container');
    const todoStats = document.getElementById('todo-stats');
    const filterAll = document.getElementById('filter-all');
    const filterActive = document.getElementById('filter-active');
    const filterCompleted = document.getElementById('filter-completed');
    const clearCompleted = document.getElementById('clear-completed');

    // Variables
    let todos = JSON.parse(localStorage.getItem('todos')) || [];
    let currentFilter = 'all';

    // Render todos
    function renderTodos() {
        todosContainer.innerHTML = '';
        let filteredTodos = todos;

        if (currentFilter === 'active') {
            filteredTodos = todos.filter(todo => !todo.completed);
        } else if (currentFilter === 'completed') {
            filteredTodos = todos.filter(todo => todo.completed);
        }

        filteredTodos.forEach((todo, index) => {
            const todoItem = document.createElement('li');
            todoItem.className = `todo-item flex items-center p-3 bg-white rounded-lg shadow-sm border border-gray-100 ${todo.completed ? 'completed' : ''}`;

            todoItem.innerHTML = `
                <input type="checkbox" class="todo-checkbox mr-3" ${todo.completed ? 'checked' : ''}>
                <span class="todo-text flex-grow ${todo.completed ? 'line-through text-gray-400' : 'text-gray-700'}">${todo.text}</span>
                <button class="delete-todo text-red-400 hover:text-red-600 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                    </svg>
                </button>
            `;

            // Add todo item to container
            todosContainer.appendChild(todoItem);

            // Checkbox event listener
            const checkbox = todoItem.querySelector('.todo-checkbox');
            checkbox.addEventListener('change', () => {
                toggleTodo(index);
            });

            // Delete button event listener
            const deleteBtn = todoItem.querySelector('.delete-todo');
            deleteBtn.addEventListener('click', () => {
                deleteTodo(index);
            });

            // Adding animation delay
            todoItem.style.animationDelay = `${index * 0.05}s`;
        });

        // Update stats
        const activeTodos = todos.filter(todo => !todo.completed).length;
        todoStats.textContent = `${activeTodos} tasks left`;

        // Save to localStorage
        localStorage.setItem('todos', JSON.stringify(todos));

        // Update character message
        if (todos.length === 0) {
            updateCharacterMessage('Your task list is empty. Time to add some 📝');
        } else if (activeTodos === 0 && todos.length > 0) {
            updateCharacterMessage('Everything’s finished. Good job');
        } else {
            updateCharacterMessage(`Almost done, ${activeTodos} tasks left!`);
        }
    }

    // Add new todo
    function addTodo() {
        const text = todoInput.value.trim();
        if (text) {
            todos.push({
                text,
                completed: false,
                id: Date.now()
            });
            todoInput.value = '';
            renderTodos();
            showToast('Task added! Let’s go! 📝');
        }
    }

    // Toggle todo completed status
    function toggleTodo(index) {
        todos[index].completed = !todos[index].completed;
        renderTodos();
        if (todos[index].completed) {
            completeSound.play();
            showToast('Task done. Nice work');
        }
    }

    // Delete todo
    function deleteTodo(index) {
        todos.splice(index, 1);
        renderTodos();
        showToast('Task deleted ❌');
    }

    // Event Listeners
    addTodoBtn.addEventListener('click', addTodo);

    todoInput.addEventListener('keypress', event => {
        if (event.key === 'Enter') {
            addTodo();
        }
    });

    // Filter event listeners
    filterAll.addEventListener('click', () => {
        setFilter('all');
    });

    filterActive.addEventListener('click', () => {
        setFilter('active');
    });

    filterCompleted.addEventListener('click', () => {
        setFilter('completed');
    });

    clearCompleted.addEventListener('click', () => {
        todos = todos.filter(todo => !todo.completed);
        renderTodos();
        showToast('Everything’s cleared out 🧹');
    });

    // Set active filter
    function setFilter(filter) {
        currentFilter = filter;

        // Update filter UI
        [filterAll, filterActive, filterCompleted].forEach(btn => {
            btn.classList.remove('filter-active', 'bg-purple-100', 'text-purple-700');
            btn.classList.add('text-gray-600', 'hover:bg-purple-50');
        });

        let activeBtn;
        if (filter === 'all') activeBtn = filterAll;
        else if (filter === 'active') activeBtn = filterActive;
        else activeBtn = filterCompleted;

        activeBtn.classList.remove('text-gray-600', 'hover:bg-purple-50');
        activeBtn.classList.add('filter-active', 'bg-purple-100', 'text-purple-700');

        renderTodos();
    }

    // Initial render
    renderTodos();
}


function initCharacter() {
}

function updateCharacterMessage(message) {
    const characterMessage = document.getElementById('character-message');
    characterMessage.textContent = message;
}

// Show toast notification
function showToast(message) {
    // Create toast element if it doesn't exist
    let toast = document.querySelector('.toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.className = 'toast';
        document.body.appendChild(toast);
    }

    // Set message and show
    toast.textContent = message;
    toast.classList.add('show');

    // Auto hide after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

//Photobooth

