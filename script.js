
// =====================================
// TASKFLOW - INTERACTIVE TO-DO LIST
// =====================================

// Selecting HTML elements
const taskForm = document.querySelector("#taskForm");
const taskInput = document.querySelector("#taskInput");
const taskList = document.querySelector("#taskList");
const searchInput = document.querySelector("#searchInput");
const filterButtons = document.querySelectorAll(".filter-btn");
const emptyState = document.querySelector("#emptyState");
const totalCount = document.querySelector("#totalCount");
const completedCount = document.querySelector("#completedCount");
const progressBar = document.querySelector("#progressBar");
const progressText = document.querySelector("#progressText");
const clearCompletedBtn = document.querySelector("#clearCompleted");

// Application state
let tasks = JSON.parse(localStorage.getItem("taskflow_tasks")) || [];
let currentFilter = "all";
let searchQuery = "";

// =====================================
// SAVE TASKS TO LOCAL STORAGE
// =====================================

function saveTasks() {
    localStorage.setItem("taskflow_tasks", JSON.stringify(tasks));
}

// =====================================
// ADD NEW TASK
// =====================================

taskForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const taskText = taskInput.value.trim();

    if (taskText === "") {
        alert("Please enter a task!");
        return;
    }

    const newTask = {
        id: Date.now() + Math.random(),
        text: taskText,
        completed: false
    };

    tasks.push(newTask);

    saveTasks();
    renderTasks();

    taskInput.value = "";
    taskInput.focus();
});

// =====================================
// DISPLAY TASKS
// =====================================

function renderTasks() {

    taskList.innerHTML = "";

    const filteredTasks = tasks.filter(function(task) {

        const matchesFilter =
            currentFilter === "all" ||
            (currentFilter === "active" && !task.completed) ||
            (currentFilter === "completed" && task.completed);

        const matchesSearch = task.text
            .toLowerCase()
            .includes(searchQuery.toLowerCase());

        return matchesFilter && matchesSearch;
    });

    // Empty state
    emptyState.style.display =
        filteredTasks.length === 0 ? "block" : "none";

    if (filteredTasks.length === 0) {
        const heading = emptyState.querySelector("h3");
        const description = emptyState.querySelector("p");

        if (tasks.length === 0) {
            heading.textContent = "No tasks yet!";
            description.textContent =
                "Add a task and start being productive.";
        } else if (searchQuery) {
            heading.textContent = "No matching tasks!";
            description.textContent =
                "Try searching with another keyword.";
        } else {
            heading.textContent = "Nothing here!";
            description.textContent =
                "There are no tasks in this category.";
        }
    }

    // Create task elements
    filteredTasks.forEach(function(task) {

        const li = document.createElement("li");
        li.className = "task-item";

        if (task.completed) {
            li.classList.add("completed");
        }

        // Checkbox
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "task-checkbox";
        checkbox.checked = task.completed;
        checkbox.setAttribute("aria-label", "Complete task");

        checkbox.addEventListener("change", function() {
            toggleTask(task.id);
        });

        // Task text
        const span = document.createElement("span");
        span.className = "task-text";
        span.textContent = task.text;

        // Action buttons
        const actions = document.createElement("div");
        actions.className = "task-actions";

        const editBtn = document.createElement("button");
        editBtn.className = "action-btn edit-btn";
        editBtn.textContent = "Edit";
        editBtn.setAttribute("aria-label", "Edit task");

        editBtn.addEventListener("click", function() {
            editTask(task.id);
        });

        const deleteBtn = document.createElement("button");
        deleteBtn.className = "action-btn delete-btn";
        deleteBtn.textContent = "Delete";
        deleteBtn.setAttribute("aria-label", "Delete task");

        deleteBtn.addEventListener("click", function() {
            deleteTask(task.id);
        });

        // Add elements to DOM
        actions.appendChild(editBtn);
        actions.appendChild(deleteBtn);

        li.appendChild(checkbox);
        li.appendChild(span);
        li.appendChild(actions);

        taskList.appendChild(li);
    });

    updateStats();
}

// =====================================
// MARK TASK AS COMPLETE
// =====================================

function toggleTask(id) {

    tasks = tasks.map(function(task) {

        if (task.id === id) {
            return {
                ...task,
                completed: !task.completed
            };
        }

        return task;
    });

    saveTasks();
    renderTasks();
}

// =====================================
// DELETE TASK
// =====================================

function deleteTask(id) {

    tasks = tasks.filter(function(task) {
        return task.id !== id;
    });

    saveTasks();
    renderTasks();
}

// =====================================
// EDIT TASK
// =====================================

function editTask(id) {

    const task = tasks.find(function(task) {
        return task.id === id;
    });

    if (!task) return;

    const updatedText = prompt("Edit your task:", task.text);

    if (updatedText === null) return;

    if (updatedText.trim() === "") {
        alert("Task cannot be empty!");
        return;
    }

    task.text = updatedText.trim();

    saveTasks();
    renderTasks();
}

// =====================================
// SEARCH TASKS
// =====================================

searchInput.addEventListener("input", function() {

    searchQuery = searchInput.value.trim();

    renderTasks();
});

// =====================================
// FILTER TASKS
// =====================================

filterButtons.forEach(function(button) {

    button.addEventListener("click", function() {

        filterButtons.forEach(function(btn) {
            btn.classList.remove("active");
        });

        button.classList.add("active");

        currentFilter = button.dataset.filter;

        renderTasks();
    });
});

// =====================================
// UPDATE TASK STATISTICS
// =====================================

function updateStats() {

    const total = tasks.length;

    const completed = tasks.filter(function(task) {
        return task.completed;
    }).length;

    const percentage = total === 0
        ? 0
        : Math.round((completed / total) * 100);

    totalCount.textContent = `${total} total tasks`;

    completedCount.textContent =
        `${completed} completed`;

    progressText.textContent =
        `${percentage}% completed`;

    progressBar.style.width = `${percentage}%`;
}

// =====================================
// CLEAR COMPLETED TASKS
// =====================================

clearCompletedBtn.addEventListener("click", function() {

    const hasCompletedTasks = tasks.some(function(task) {
        return task.completed;
    });

    if (!hasCompletedTasks) {
        alert("There are no completed tasks!");
        return;
    }

    const confirmClear = confirm(
        "Are you sure you want to clear all completed tasks?"
    );

    if (confirmClear) {

        tasks = tasks.filter(function(task) {
            return !task.completed;
        });

        saveTasks();
        renderTasks();
    }
});

// =====================================
// LOAD SAVED TASKS ON PAGE LOAD
// =====================================

document.addEventListener("DOMContentLoaded", function() {
    renderTasks();
});

// Initial display
renderTasks();