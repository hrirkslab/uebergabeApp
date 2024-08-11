document.addEventListener("DOMContentLoaded", () => {
    const app = new TaskManager();
    app.init();
});

class TaskManager {
    constructor() {
        this.loginSection = document.getElementById("login-section");
        this.taskSection = document.getElementById("task-section");
        this.usernameInput = document.getElementById("username");
        this.loginBtn = document.getElementById("login-btn");
        this.logoutBtn = document.getElementById("logout-btn");
        this.welcomeUser = document.getElementById("welcome-user");

        this.taskForm = document.getElementById("task-form");
        this.taskDesc = document.getElementById("task-desc");
        this.taskShift = document.getElementById("task-shift");
        this.taskDate = document.getElementById("task-date");
        this.taskStatus = document.getElementById("task-status");
        this.taskRelevancy = document.getElementById("task-relevancy");
        this.taskList = document.getElementById("task-list");
        this.exportBtn = document.getElementById("export-btn");

        this.filterAllBtn = document.getElementById("filter-all-btn");
        this.filterTodoBtn = document.getElementById("filter-todo-btn");
        this.filterInfoBtn = document.getElementById("filter-info-btn");
        this.filterDoneBtn = document.getElementById("filter-done-btn");
        this.removeDoneBtn = document.getElementById("remove-done-btn");

        this.modal = document.getElementById("confirmation-modal");
        this.modalTitle = document.getElementById("modal-title");
        this.modalMessage = document.getElementById("modal-message");
        this.cancelBtn = document.getElementById("modal-cancel-btn");
        this.confirmBtn = document.getElementById("modal-confirm-btn");

        this.tasks = [];
        this.currentFilter = 'all'; // default filter
        this.confirmAction = null;
    }

    init() {
        this.checkLocalStorage();
        this.addEventListeners();
    }

    checkLocalStorage() {
        if (localStorage.getItem("username")) {
            this.displayTaskSection();
        }
    }

    addEventListeners() {
        this.loginBtn.addEventListener("click", () => this.handleLogin());
        this.logoutBtn.addEventListener("click", () => this.handleLogout());
        this.taskForm.addEventListener("submit", (e) => this.addTask(e));

        this.filterAllBtn.addEventListener("click", () => this.filterTasks('all'));
        this.filterTodoBtn.addEventListener("click", () => this.filterTasks('todo'));
        this.filterInfoBtn.addEventListener("click", () => this.filterTasks('info'));
        this.filterDoneBtn.addEventListener("click", () => this.filterTasks('done'));
        this.removeDoneBtn.addEventListener("click", () => this.handleDeleteAllDoneTasks());

        this.cancelBtn.addEventListener("click", () => this.closeModal());
        this.confirmBtn.addEventListener("click", () => this.confirmAction && this.confirmAction());

        document.getElementById("delete-all-btn").addEventListener("click", () => this.handleDeleteAll());

        // Set default date to today
        this.taskDate.value = new Date().toISOString().split("T")[0];
    }

    handleLogin() {
        const username = this.usernameInput.value.trim();
        if (username) {
            localStorage.setItem("username", username);
            this.displayTaskSection();
        }
    }

    handleLogout() {
        localStorage.removeItem("username");
        this.hideTaskSection();
    }

    displayTaskSection() {
        const username = localStorage.getItem("username");
        if (username) {
            this.welcomeUser.textContent = `Welcome, ${username}`;
            this.loginSection.classList.add("hidden");
            this.taskSection.classList.remove("hidden");
            this.loadTasks();
        }
    }

    hideTaskSection() {
        this.taskSection.classList.add("hidden");
        this.loginSection.classList.remove("hidden");
        this.taskList.innerHTML = "";
    }

    loadTasks() {
        this.tasks = JSON.parse(localStorage.getItem("tasks")) || [];
        this.displayTasks();
    }

    saveTasks() {
        localStorage.setItem("tasks", JSON.stringify(this.tasks));
    }

    addTask(e) {
        e.preventDefault();
        const relevancyDays = parseInt(this.taskRelevancy.value);
        const endDate = new Date(this.taskDate.value);
        endDate.setDate(endDate.getDate() + relevancyDays);

        const newTask = {
            id: Date.now(),
            description: this.taskDesc.value.trim(),
            date: this.taskDate.value,
            endDate: endDate.toISOString().split("T")[0],
            status: this.taskStatus.value,
            shift: this.taskShift.value,
            timestamp: new Date().toLocaleString(),
            readBy: [],
            createdBy: localStorage.getItem("username"),
            done: false
        };

        this.tasks.push(newTask);
        this.saveTasks();
        this.displayTasks();
        this.taskForm.reset();
        this.taskDate.value = new Date().toISOString().split("T")[0]; // Reset to today's date
    }

    filterTasks(filter) {
        this.currentFilter = filter;
        this.displayTasks();
    }

    displayTasks() {
        const currentUser = localStorage.getItem("username");
        this.taskList.innerHTML = "";

        let filteredTasks = this.tasks;

        if (this.currentFilter === 'todo') {
            filteredTasks = this.tasks.filter(task => task.status === 'Task' && !task.done);
        } else if (this.currentFilter === 'info') {
            filteredTasks = this.tasks.filter(task => task.status === 'Info');
        } else if (this.currentFilter === 'done') {
            filteredTasks = this.tasks.filter(task => task.done);
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
                    this.saveTasks();
                    this.displayTasks(); // Refresh the task display
                });
            }

            // Mark as done handler
            if (task.status === "Task" && !task.done) {
                taskItem.querySelector(".mark-done-btn").addEventListener("click", () => {
                    task.done = true;
                    this.saveTasks();
                    this.displayTasks(); // Refresh the task display
                });
            }

            // Edit task handler
            taskItem.querySelector(".edit-btn").addEventListener("click", () => {
                this.taskDesc.value = task.description;
                this.taskDate.value = task.date;
                this.taskStatus.value = task.status;
                this.taskShift.value = task.shift;
                this.taskRelevancy.value = (new Date(task.endDate) - new Date(task.date)) / (1000 * 60 * 60 * 24);
                this.tasks = this.tasks.filter(t => t.id !== task.id);
                this.saveTasks();
                this.displayTasks();
            });

            // Delete task handler with confirmation
            taskItem.querySelector(".delete-btn").addEventListener("click", () => {
                this.handleDelete(task.id);
            });

            this.taskList.appendChild(taskItem);
        });
    }

    openModal(title, message, action) {
        this.modalTitle.textContent = title;
        this.modalMessage.textContent = message;
        this.confirmAction = action;
        this.modal.classList.remove("hidden");
    }

    closeModal() {
        this.modal.classList.add("hidden");
        this.confirmAction = null;
    }

    handleDelete(taskId) {
        this.openModal(
            "Confirm Deletion",
            "Are you sure you want to delete this task? This action cannot be undone.",
            () => {
                this.tasks = this.tasks.filter(t => t.id !== taskId);
                this.saveTasks();
                this.displayTasks();
            }
        );
    }

    handleDeleteAll() {
        this.openModal(
            "Confirm Deletion",
            "Are you sure you want to delete all tasks? This action cannot be undone.",
            () => {
                this.tasks = [];
                this.saveTasks();
                this.displayTasks();
            }
        );
    }

    handleDeleteAllDoneTasks() {
        this.openModal(
            "Confirm Deletion",
            "Are you sure you want to remove all completed tasks? This action cannot be undone.",
            () => {
                this.tasks = this.tasks.filter(task => !task.done);
                this.saveTasks();
                this.displayTasks();
            }
        );
    }
}
