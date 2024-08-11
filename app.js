// Designed and Developed by Ujwal Subedi [hrirkslab@gmail.com] 

document.addEventListener("DOMContentLoaded", function () {
    const loginSection = document.getElementById("login-section");
    const taskSection = document.getElementById("task-section");
    const usernameInput = document.getElementById("username");
    const loginBtn = document.getElementById("login-btn");
    const logoutBtn = document.getElementById("logout-btn");
    const welcomeUser = document.getElementById("welcome-user");

    const taskForm = document.getElementById("task-form");
    const taskDesc = document.getElementById("task-desc");
    const taskShift = document.getElementById("task-shift");
    const taskList = document.getElementById("task-list");
    const exportBtn = document.getElementById("export-btn");

    const filterAllBtn = document.getElementById("filter-all-btn");
    const filterTodoBtn = document.getElementById("filter-todo-btn");
    const filterInfoBtn = document.getElementById("filter-info-btn");
    const filterDoneBtn = document.getElementById("filter-done-btn");
    const removeDoneBtn = document.getElementById("remove-done-btn");

    let tasks = [];
    let currentFilter = 'all';  // default filter

    // Check for saved username in localStorage
    if (localStorage.getItem("username")) {
        displayTaskSection();
    }

    // Login button click handler
    loginBtn.addEventListener("click", () => {
        const username = usernameInput.value.trim();
        if (username) {
            localStorage.setItem("username", username);
            displayTaskSection();
        }
    });

    // Logout button click handler
    logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("username");
        hideTaskSection();
    });

    const taskDate = document.getElementById("task-date");
    const taskStatus = document.getElementById("task-status");
    const taskRelevancy = document.getElementById("task-relevancy");

    // Set default date to today
    taskDate.value = new Date().toISOString().split("T")[0];

    taskForm.addEventListener("submit", (e) => {
        e.preventDefault();

        // Calculate end date based on relevancy days
        const relevancyDays = parseInt(taskRelevancy.value);
        const endDate = new Date(taskDate.value);
        endDate.setDate(endDate.getDate() + relevancyDays);

        const newTask = {
            id: Date.now(),
            description: taskDesc.value.trim(),
            date: taskDate.value,
            endDate: endDate.toISOString().split("T")[0],
            status: taskStatus.value,
            shift: taskShift.value,
            timestamp: new Date().toLocaleString(),
            readBy: [],
            createdBy: localStorage.getItem("username"),
            done: false
        };
        tasks.push(newTask);
        saveTasks();
        displayTasks();
        taskForm.reset();
        taskDate.value = new Date().toISOString().split("T")[0]; // Reset to today's date
    });

    // Filter buttons event listeners
    filterAllBtn.addEventListener("click", () => {
        currentFilter = 'all';
        displayTasks();
    });

    filterTodoBtn.addEventListener("click", () => {
        currentFilter = 'todo';
        displayTasks();
    });

    filterInfoBtn.addEventListener("click", () => {
        currentFilter = 'info';
        displayTasks();
    });

    filterDoneBtn.addEventListener("click", () => {
        currentFilter = 'done';
        displayTasks();
    });

    // Remove done tasks with confirmation
    removeDoneBtn.addEventListener("click", () => {
        const confirmation = confirm("Are you sure you want to remove all completed tasks?");
        if (confirmation) {
            tasks = tasks.filter(task => !task.done);
            saveTasks();
            displayTasks();
        }
    });

    // Function to display task section after login
    function displayTaskSection() {
        const username = localStorage.getItem("username");
        if (username) {
            welcomeUser.textContent = `Welcome, ${username}`;
            loginSection.classList.add("hidden");
            taskSection.classList.remove("hidden");
            loadTasks();
        }
    }

    // Function to hide task section on logout
    function hideTaskSection() {
        taskSection.classList.add("hidden");
        loginSection.classList.remove("hidden");
        taskList.innerHTML = "";
    }

    // Load tasks from localStorage
    function loadTasks() {
        tasks = JSON.parse(localStorage.getItem("tasks")) || [];
        displayTasks();
    }

    // Save tasks to localStorage
    function saveTasks() {
        localStorage.setItem("tasks", JSON.stringify(tasks));
    }

    // Function to display tasks based on the current filter
    function displayTasks() {
        const currentUser = localStorage.getItem("username");
        taskList.innerHTML = "";

        let filteredTasks = tasks;

        if (currentFilter === 'todo') {
            filteredTasks = tasks.filter(task => task.status === 'Task' && !task.done);
        } else if (currentFilter === 'info') {
            filteredTasks = tasks.filter(task => task.status === 'Info');
        } else if (currentFilter === 'done') {
            filteredTasks = tasks.filter(task => task.done);
        }

        filteredTasks.forEach((task) => {
            if (!Array.isArray(task.readBy)) {
                task.readBy = [];
            }

            let borderColor;
            if (task.status === "Info") {
                borderColor = 'border-yellow-500';
            } else if (task.status === "Task") {
                borderColor = task.done ? 'border-green-500' : 'border-blue-500';
            }

            const taskItem = document.createElement("div");
            taskItem.className = `bg-white shadow-md rounded-lg p-4 flex justify-between items-start space-x-4 border-l-4 ${borderColor} ${task.done ? 'opacity-50' : ''}`;

            taskItem.innerHTML = `
            <div class="flex-1">
                <h3 class="text-lg font-semibold mb-2 ${task.done ? 'line-through' : ''}">${task.description}</h3>
                <div class="text-sm text-gray-500 space-y-1">
                    <div class="flex items-center space-x-4">
                        <div class="flex items-center space-x-2">
                            <i class="fas fa-calendar-alt text-gray-400"></i>
                            <span>${task.date}</span>
                        </div>
                        <div class="flex items-center space-x-2">
                            <i class="fas fa-calendar-check text-gray-400"></i>
                            <span>${task.endDate}</span>
                        </div>
                    </div>
                    <div class="flex items-center space-x-4">
                        <div class="flex items-center space-x-2">
                            <i class="fas fa-clock text-gray-400"></i>
                            <span>${task.shift}</span>
                        </div>
                        <div class="flex items-center space-x-2">
                            <i class="fas fa-info-circle text-gray-400"></i>
                            <span>${task.status}</span>
                        </div>
                    </div>
                    <div class="flex items-center space-x-4">
                        <div class="flex items-center space-x-2">
                            <i class="fas fa-user text-gray-400"></i>
                            <span>${task.createdBy}</span>
                        </div>
                        <div class="flex items-center space-x-2 text-blue-600">
                            <i class="fas fa-eye text-blue-400"></i>
                            <span>${task.readBy.length > 0 ? task.readBy.join(", ") : "No one yet"}</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="flex items-center space-x-2">
                ${!task.readBy.includes(currentUser) ? `<button class="mark-read-btn text-blue-500 hover:text-blue-700" title="Mark as Read"><i class="fas fa-eye"></i></button>` : ''}
                ${task.status === "Task" && !task.done ? `<button class="mark-done-btn text-green-500 hover:text-green-700" title="Mark as Done"><i class="fas fa-check"></i></button>` : ''}
                <button class="edit-btn text-yellow-500 hover:text-yellow-700" title="Edit"><i class="fas fa-edit"></i></button>
                <button class="delete-btn text-red-500 hover:text-red-700" title="Delete"><i class="fas fa-trash-alt"></i></button>
            </div>
            `;

            // Mark as read handler
            if (!task.readBy.includes(currentUser)) {
                taskItem.querySelector(".mark-read-btn").addEventListener("click", () => {
                    task.readBy.push(currentUser); // Add the current user to the readBy array
                    saveTasks();
                    displayTasks(); // Refresh the task display
                });
            }

            // Mark as done handler
            if (task.status === "Task" && !task.done) {
                taskItem.querySelector(".mark-done-btn").addEventListener("click", () => {
                    task.done = true;
                    saveTasks();
                    displayTasks(); // Refresh the task display
                });
            }

            // Edit task handler
            taskItem.querySelector(".edit-btn").addEventListener("click", () => {
                taskDesc.value = task.description;
                taskDate.value = task.date;
                taskStatus.value = task.status;
                taskShift.value = task.shift;
                taskRelevancy.value = (new Date(task.endDate) - new Date(task.date)) / (1000 * 60 * 60 * 24);
                tasks = tasks.filter(t => t.id !== task.id);
                saveTasks();
                displayTasks();
            });

            // Delete task handler
            taskItem.querySelector(".delete-btn").addEventListener("click", () => {
                tasks = tasks.filter(t => t.id !== task.id);
                saveTasks();
                displayTasks();
            });

            taskList.appendChild(taskItem);
        });
    }

});
