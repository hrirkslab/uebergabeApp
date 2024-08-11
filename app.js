document.addEventListener("DOMContentLoaded", function () {
    const loginSection = document.getElementById("login-section");
    const taskSection = document.getElementById("task-section");
    const usernameInput = document.getElementById("username");
    const loginBtn = document.getElementById("login-btn");
    const logoutBtn = document.getElementById("logout-btn");
    const welcomeUser = document.getElementById("welcome-user");

    const taskForm = document.getElementById("task-form");
    const taskDesc = document.getElementById("task-desc");
    const taskType = document.getElementById("task-type");
    const taskShift = document.getElementById("task-shift");
    const taskList = document.getElementById("task-list");
    const exportBtn = document.getElementById("export-btn");

    let tasks = [];

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
            type: taskType.value,
            shift: taskShift.value,
            timestamp: new Date().toLocaleString(),
            read: false,
            done: false
        };
        tasks.push(newTask);
        saveTasks();
        displayTasks();
        taskForm.reset();
        taskDate.value = new Date().toISOString().split("T")[0]; // Reset to today's date
    });


    // Export tasks as JSON file
    exportBtn.addEventListener("click", () => {
        const blob = new Blob([JSON.stringify(tasks, null, 2)], { type: "application/json" });
        saveAs(blob, "tasks.json");
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

    // Function to display tasks
    function displayTasks() {
        taskList.innerHTML = "";
        tasks.forEach((task) => {
            const taskItem = document.createElement("div");
            taskItem.className = "bg-gray-100 p-3 rounded flex justify-between items-start space-x-3";
            taskItem.innerHTML = `
                <div>
                    <p class="text-sm">${task.timestamp}</p>
                    <p class="font-medium">${task.description}</p>
                    <p class="text-sm text-gray-600">Shift: ${task.shift}</p>
                    <p class="text-sm text-gray-600">Type: ${task.type}</p>
                </div>
                <div class="flex flex-col space-y-2">
                    ${!task.read ? `<button class="mark-read-btn text-sm text-blue-500 hover:underline">Mark as Read</button>` : ''}
                    ${task.type === "Ja/Nein" && !task.done ? `<button class="mark-done-btn text-sm text-green-500 hover:underline">Mark as Done</button>` : ''}
                    <button class="edit-btn text-sm text-yellow-500 hover:underline">Edit</button>
                </div>
            `;

            if (!task.read) {
                taskItem.querySelector(".mark-read-btn").addEventListener("click", () => {
                    task.read = true;
                    saveTasks();
                    displayTasks();
                });
            }

            if (task.type === "Ja/Nein" && !task.done) {
                taskItem.querySelector(".mark-done-btn").addEventListener("click", () => {
                    task.done = true;
                    tasks = tasks.filter(t => t.id !== task.id);
                    saveTasks();
                    displayTasks();
                });
            }

            taskItem.querySelector(".edit-btn").addEventListener("click", () => {
                taskDesc.value = task.description;
                taskType.value = task.type;
                taskShift.value = task.shift;
                tasks = tasks.filter(t => t.id !== task.id);
                saveTasks();
                displayTasks();
            });

            taskList.appendChild(taskItem);
        });
    }
});
