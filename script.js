const MODES = {
    focus: { seconds: 25 * 60, label: "Ready to Focus", running: "Focusing..." },
    short: { seconds: 5 * 60, label: "Have a short break", running: "Resting..." },
    long: { seconds: 15 * 60, label: "Have a long break", running: "Resting..." },
};

let currentMode = "focus";
let totalSeconds = MODES.focus.seconds;
let remainingSeconds = totalSeconds;
let timerId = null;
let isRunning = false;
let completedPomodoros = 0;

const timeDisplay   = document.getElementById("timeDisplay");
const stateLabel    = document.getElementById("stateLabel");
const startPauseBtn = document.getElementById("startPauseBtn");
const resetBtn  = document.getElementById("resetBtn");
const dialProgress  = document.getElementById("dialProgress");
const sessionCount  = document.getElementById("sessionCount");
const modeButtons   = document.querySelectorAll(".mode-btn");

const CIRCUMFERENCE = 2 * Math.PI * 100;

function formatTime(sec) {
    const m = Math.floor(sec / 60).toString().padStart(2, "0");
    const s = Math.floor(sec % 60).toString().padStart(2, "0");
    return m + ":" + s;
}

function updateDisplay() {
    timeDisplay.textContent = formatTime(remainingSeconds);
    const progressRatio =remainingSeconds / totalSeconds;
    dialProgress.setAttribute(
        "stroke-dashoffset", (CIRCUMFERENCE * (1 - progressRatio)).toFixed(1)
    );
}

function switchMode(mode) {
    currentMode = mode;
    totalSeconds = MODES[mode].seconds;
    remainingSeconds = totalSeconds;
    isRunning = false;
    clearInterval(timerId);
    startPauseBtn.textContent = "Start";
    stateLabel.textContent = MODES[mode].label;
    document.body.classList.toggle("resting", mode !== "focus");

    modeButtons.forEach(btn => {
        btn.classList.toggle("active", btn.dataset.mode === mode);
    });

    updateDisplay();
}

function tick() {
    remainingSeconds -= 1;
    updateDisplay();

    if (remainingSeconds <= 0) {
        clearInterval(timerId);
        isRunning = false;
        startPauseBtn.textContent = "Start";

        if (currentMode === "focus") {
            completedPomodoros += 1;
            sessionCount.textContent = 'Complete Promodoro: ${completedPomodoros}';
            switchMode("short");
        } else {
            switchMode("focus");
        }
    }
}

function startTimer() {
    isRunning = true;
    startPauseBtn.textContent = "Paused";
    stateLabel.textContent = MODES[currentMode].running;
    timerId = setInterval(tick, 1000);
}

function pauseTimer() {
    isRunning = false;
    startPauseBtn.textContent = "Start";
    clearInterval(timerId);
}

startPauseBtn.addEventListener("click", () => {
    if (isRunning) {
        pauseTimer();
    } else {
        startTimer();
    }
});

resetBtn.addEventListener("click", () => {
    pauseTimer();
    remainingSeconds = totalSeconds;
    stateLabel.textcontent = MODES[currentMode].label;
    updateDisplay();
});

modeButtons.forEach(btn => {
    btn.addEventListener("click", () => switchMode(btn.dataset.mode));
});

updateDisplay();

const todoInput = document.getElementById("todoInput");
const addTodoBtn = document.getElementById("addTodoBtn");
const todoList = document.getElementById("todoList");
const todoFooter = document.getElementById("todoFooter");

let todos = [];

try {
    const saved = localStorage.getItem("focusDeskTodos");
    todos = saved ? JSON.parse(saved) : [];
} catch (e) {
    todos = [];
}

function saveTodos() {
    try {
        localStorage.setItem("focusDestTodos", JSON.stringify(todos));
    } catch (e) {
    }
}

function renderTodos() {
    todoList.innerHTML = "";

    if (todos.length === 0) {
        const empty = document.createElement("li");
        empty.className = "empty-note";
        empty.style.border = "none";
        empty.textContent = "Nothing to do";
        todoList.appendChild(empty);
    }

    todos.forEach((todo, index) => {
        const li = document.createElement("li");
        li.className = todo.done ? "done" : "";

        const check = document.createElement("span");
        check.className = "check";
        check.addEventListener("click", () => {
            todos[index].done = !todos[index].done;
            saveTodos();
            renderTodos();
        });

        const text = document.createElement("span");
        text.className = "text";
        text.textContent = todo.text;

        const remove = document.createElement("button");
        remove.className = "remove";
        remove.textContent = "Delete";
        remove.addEventListener("click", () => {
            todos.splice(index, 1);
            saveTodos();
            renderTodos();
        });

        li.appendChild(check);
        li.appendChild(text);
        li.appendChild(remove);
        todoList.appendChild(li);
    });

    const doneCount = todos.filter(t => t.done).length;
    todoFooter.textContent = todos.length
        ? `${doneCount} / ${todos.length} Completed`
        : "";
}

function addTodo() {
    const value = todoInput.value.trim();
    if (!value) return;

    todos.push({ text: value, done: false});
    todoInput.value = "";
    saveTodos();
    renderTodos();
}

addTodoBtn.addEventListener("click", addTodo);
todoInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") addTodo();
});

renderTodos();
