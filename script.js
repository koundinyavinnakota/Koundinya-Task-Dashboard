/* ============================================================
   Koundinya Task Dashboard – script.js
   Pure Vanilla JS · LocalStorage persistence · Drag-and-Drop
   ============================================================ */

// ─────────────────────────────────────────────────────────────
// 1. PRODUCTIVITY QUOTES  (rotates daily based on day-of-year)
// ─────────────────────────────────────────────────────────────
const QUOTES = [
  "What is important is seldom urgent, and what is urgent is seldom important. — Eisenhower",
  "Focus on being productive instead of busy. — Tim Ferriss",
  "The key is not to prioritize what's on your schedule, but to schedule your priorities. — Covey",
  "You don't have to be great to start, but you have to start to be great. — Zig Ziglar",
  "Done is better than perfect. — Sheryl Sandberg",
  "One day or day one. You decide. — Paulo Coelho",
  "Action is the foundational key to all success. — Pablo Picasso",
  "Your future is created by what you do today, not tomorrow. — Robert Kiyosaki",
  "Small steps every day add up to giant leaps. — Anonymous",
  "Productivity is never an accident. It is always the result of a commitment to excellence. — Paul Meyer",
  "The secret of getting ahead is getting started. — Mark Twain",
  "Stop wishing. Start doing. — Anonymous",
  "Clarity is power. The more clear you are about what you want, the more likely you are to get it. — Anonymous",
  "Hard choices, easy life. Easy choices, hard life. — Jerzy Gregorek",
  "Either run the day, or the day runs you. — Jim Rohn",
];

/**
 * Shows a quote that changes once per day
 * (uses day-of-year mod quotes length as index).
 */
function loadQuote() {
  const now   = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((now - start) / 86_400_000);
  const idx   = dayOfYear % QUOTES.length;
  document.getElementById("quoteText").textContent = `"${QUOTES[idx]}"`;
}


// ─────────────────────────────────────────────────────────────
// 2. THEME TOGGLE  (dark ↔ light, persisted in localStorage)
// ─────────────────────────────────────────────────────────────
const themeToggleBtn = document.getElementById("themeToggle");

/** Apply the saved theme on page load */
function loadTheme() {
  const saved = localStorage.getItem("kd-theme") || "dark";
  if (saved === "light") {
    document.documentElement.setAttribute("data-theme", "light");
    themeToggleBtn.textContent = "☀️";
  } else {
    document.documentElement.removeAttribute("data-theme");
    themeToggleBtn.textContent = "🌙";
  }
}

/** Switch between dark and light */
themeToggleBtn.addEventListener("click", () => {
  const isLight = document.documentElement.getAttribute("data-theme") === "light";
  if (isLight) {
    document.documentElement.removeAttribute("data-theme");
    localStorage.setItem("kd-theme", "dark");
    themeToggleBtn.textContent = "🌙";
  } else {
    document.documentElement.setAttribute("data-theme", "light");
    localStorage.setItem("kd-theme", "light");
    themeToggleBtn.textContent = "☀️";
  }
});


// ─────────────────────────────────────────────────────────────
// 3. DATA LAYER  (LocalStorage helpers)
// ─────────────────────────────────────────────────────────────
const STORAGE_KEY = "kd-tasks"; // key used in localStorage

/**
 * Returns the full tasks object from localStorage.
 * Shape: { delegate: [...], donow: [...], delete: [...], schedule: [...] }
 * Each task: { id, title, notes, timestamp }
 */
function loadTasks() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {
      delegate: [], donow: [], delete: [], schedule: []
    };
  } catch {
    return { delegate: [], donow: [], delete: [], schedule: [] };
  }
}

/** Persists the current tasks object to localStorage */
function saveTasks(tasks) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

/** Generates a simple unique ID (timestamp + random suffix) */
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}


// ─────────────────────────────────────────────────────────────
// 4. RENDER FUNCTIONS
// ─────────────────────────────────────────────────────────────

/**
 * Renders all quadrants from the tasks object.
 * Call this after any data change.
 */
function renderAll() {
  const tasks = loadTasks();
  ["delegate", "donow", "delete", "schedule"].forEach(q => renderQuadrant(q, tasks[q]));
}

/**
 * Renders a single quadrant's task list.
 * @param {string} quadrant  - one of the four quadrant keys
 * @param {Array}  taskArray - array of task objects for that quadrant
 */
function renderQuadrant(quadrant, taskArray) {
  const list  = document.getElementById(`list-${quadrant}`);
  const count = document.getElementById(`count-${quadrant}`);

  // Update the count badge
  count.textContent = taskArray.length;

  // Clear the list
  list.innerHTML = "";

  // Show empty-state hint if no tasks
  if (taskArray.length === 0) {
    list.innerHTML = `<li class="empty-msg">No tasks yet — add one below ↓</li>`;
    return;
  }

  // Build each task card
  taskArray.forEach(task => {
    const li = document.createElement("li");
    li.className    = "task-card";
    li.draggable    = true;
    li.dataset.id   = task.id;
    li.dataset.from = quadrant;

    // Format the stored ISO timestamp into a readable string
    const timeStr = new Date(task.timestamp).toLocaleString(undefined, {
      month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit"
    });

    li.innerHTML = `
      <button class="delete-btn" title="Delete task"
              onclick="deleteTask('${quadrant}', '${task.id}')">✕</button>
      <p class="task-title">${escapeHtml(task.title)}</p>
      ${task.notes ? `<p class="task-notes">${escapeHtml(task.notes)}</p>` : ""}
      <p class="task-time">🕒 ${timeStr}</p>
    `;

    // ── Drag events on each card ──
    li.addEventListener("dragstart", handleDragStart);
    li.addEventListener("dragend",   handleDragEnd);

    list.appendChild(li);
  });
}

/**
 * Simple HTML escape to prevent XSS from user input.
 */
function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


// ─────────────────────────────────────────────────────────────
// 5. MODAL  (Add Task popup)
// ─────────────────────────────────────────────────────────────
let activeQuadrant = null; // tracks which quadrant the modal was opened for

/** Opens the modal and sets context to the given quadrant */
function openModal(quadrant) {
  activeQuadrant = quadrant;

  // Human-friendly label map
  const labels = {
    delegate: "Delegate — Not Important + Urgent",
    donow:    "Do Now — Important + Urgent",
    delete:   "Delete — Not Important + Not Urgent",
    schedule: "Schedule — Important + Not Urgent",
  };

  document.getElementById("modalTitle").textContent = `New Task · ${labels[quadrant]}`;
  document.getElementById("taskTitle").value  = "";
  document.getElementById("taskNotes").value  = "";

  document.getElementById("modalBackdrop").classList.add("open");
  // Autofocus the title field after the animation starts
  setTimeout(() => document.getElementById("taskTitle").focus(), 80);
}

/** Closes the modal */
function closeModal() {
  document.getElementById("modalBackdrop").classList.remove("open");
  activeQuadrant = null;
}

// Close modal on Escape key
document.addEventListener("keydown", e => {
  if (e.key === "Escape") closeModal();
});


// ─────────────────────────────────────────────────────────────
// 6. CRUD OPERATIONS
// ─────────────────────────────────────────────────────────────

/** Creates a new task and saves it in the active quadrant */
function saveTask() {
  const titleInput = document.getElementById("taskTitle");
  const notesInput = document.getElementById("taskNotes");

  const title = titleInput.value.trim();
  if (!title) {
    // Shake effect for empty input
    titleInput.style.borderColor = "#ef4444";
    titleInput.style.boxShadow   = "0 0 0 3px rgba(239,68,68,0.20)";
    titleInput.focus();
    setTimeout(() => {
      titleInput.style.borderColor = "";
      titleInput.style.boxShadow   = "";
    }, 1200);
    return;
  }

  const tasks = loadTasks();

  // Build the new task object
  const newTask = {
    id:        uid(),
    title:     title,
    notes:     notesInput.value.trim(),
    timestamp: new Date().toISOString(),
  };

  // Push to the correct quadrant array
  tasks[activeQuadrant].push(newTask);
  saveTasks(tasks);

  // Re-render only the affected quadrant for performance
  renderQuadrant(activeQuadrant, tasks[activeQuadrant]);

  closeModal();
}

/**
 * Deletes a task by id from a quadrant.
 * @param {string} quadrant
 * @param {string} taskId
 */
function deleteTask(quadrant, taskId) {
  const tasks = loadTasks();
  tasks[quadrant] = tasks[quadrant].filter(t => t.id !== taskId);
  saveTasks(tasks);
  renderQuadrant(quadrant, tasks[quadrant]);
}


// ─────────────────────────────────────────────────────────────
// 7. DRAG-AND-DROP
// ─────────────────────────────────────────────────────────────

/** ID of the task being dragged (set on dragstart) */
let draggedId       = null;
/** Quadrant the drag originated from */
let draggedFromQuad = null;

/** Called when user starts dragging a task card */
function handleDragStart(e) {
  draggedId       = this.dataset.id;
  draggedFromQuad = this.dataset.from;

  // Add visual class after a tiny delay so the card itself looks faded
  setTimeout(() => this.classList.add("dragging"), 10);

  // Store data in the drag transfer (needed for Firefox)
  e.dataTransfer.setData("text/plain", draggedId);
  e.dataTransfer.effectAllowed = "move";
}

/** Called when dragging ends (regardless of where dropped) */
function handleDragEnd() {
  this.classList.remove("dragging");
  // Clean up any lingering drag-over highlights
  document.querySelectorAll(".quadrant").forEach(q => q.classList.remove("drag-over"));
}

/** Called when a dragged item hovers over a quadrant */
function handleDragOver(e) {
  e.preventDefault(); // required to allow dropping
  e.dataTransfer.dropEffect = "move";
  this.classList.add("drag-over");
}

/** Called when the dragged item leaves a quadrant */
function handleDragLeave(e) {
  // Only remove highlight if the pointer actually left the quadrant element
  if (!this.contains(e.relatedTarget)) {
    this.classList.remove("drag-over");
  }
}

/**
 * Called when the user drops a task onto a quadrant.
 * Moves the task from the source quadrant to the target.
 */
function handleDrop(e) {
  e.preventDefault();
  this.classList.remove("drag-over");

  const targetQuad = this.dataset.quadrant;

  // Do nothing if dropped on the same quadrant
  if (targetQuad === draggedFromQuad) return;

  const tasks = loadTasks();
  const sourceArray = tasks[draggedFromQuad];
  const taskIndex   = sourceArray.findIndex(t => t.id === draggedId);

  if (taskIndex === -1) return; // task not found (shouldn't happen)

  // Remove from source, add to target
  const [movedTask] = sourceArray.splice(taskIndex, 1);
  tasks[targetQuad].push(movedTask);

  saveTasks(tasks);

  // Re-render both affected quadrants
  renderQuadrant(draggedFromQuad, tasks[draggedFromQuad]);
  renderQuadrant(targetQuad,      tasks[targetQuad]);

  // Reset drag state
  draggedId       = null;
  draggedFromQuad = null;
}


// ─────────────────────────────────────────────────────────────
// 8. INITIALISE  (run on page load)
// ─────────────────────────────────────────────────────────────
loadTheme();   // apply saved dark/light preference
loadQuote();   // show today's quote
renderAll();   // paint all tasks from localStorage
