# ⚡ Koundinya Task Dashboard

A lightweight, modern, fully client-side **Eisenhower Matrix** task manager — no frameworks, no build tools, no backend.

Live demo: `https://<your-github-username>.github.io/Koundinya-Task-Dashboard/`

---

## 📐 The Eisenhower Matrix

| | **URGENT** | **NOT URGENT** |
|---|---|---|
| **IMPORTANT** | 🔴 **Do Now** | 🔵 **Schedule** |
| **NOT IMPORTANT** | 🟡 **Delegate** | ⚫ **Delete** |

---

## ✨ Features

- **4-quadrant grid** matching the Eisenhower productivity framework
- **Add tasks** with title, optional notes, and auto-timestamp
- **Drag & drop** tasks between quadrants
- **Delete** tasks with a single click
- **Task counters** per quadrant
- **Daily rotating productivity quote**
- **Dark / Light mode** toggle (persisted)
- **LocalStorage** persistence — tasks survive page refreshes
- **Glassmorphism** design — smooth, Apple-like UI
- **Fully responsive** — works on mobile & desktop

---

## 🚀 How to Run

### Option 1 — Open locally
Just double-click `index.html`. No server needed.

### Option 2 — GitHub Pages
1. Push this repo to GitHub
2. Go to **Settings → Pages**
3. Set source to **main branch / root**
4. Visit `https://<username>.github.io/<repo-name>/`

---

## 📁 File Structure

```
Koundinya-Task-Dashboard/
├── index.html   ← markup & structure
├── style.css    ← all styling (dark mode, glassmorphism, responsive)
└── script.js    ← all logic (CRUD, drag-drop, localStorage, quotes)
```

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Markup | HTML5 |
| Styling | CSS3 (custom properties, glassmorphism, grid) |
| Logic | Vanilla JavaScript (ES6+) |
| Storage | Browser LocalStorage |
| Dependencies | **None** |

---

*Built with ❤️ by Koundinya*
