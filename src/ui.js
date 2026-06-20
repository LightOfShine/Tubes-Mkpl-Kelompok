/**
 * DOM glue code for the Task Tracker UI.
 * Not unit tested directly (jsdom integration is out of scope for this demo);
 * pure logic lives in app.js and is what continuous testing exercises.
 */
/* eslint-env browser */
let createTask, toggleTask, removeTask, editTask, filterTasks, getStats;

if (typeof window === 'undefined') {
  const app = require('./app');
  createTask = app.createTask;
  toggleTask = app.toggleTask;
  removeTask = app.removeTask;
  editTask = app.editTask;
  filterTasks = app.filterTasks;
  getStats = app.getStats;
} else {
  createTask = window.createTask;
  toggleTask = window.toggleTask;
  removeTask = window.removeTask;
  editTask = window.editTask;
  filterTasks = window.filterTasks;
  getStats = window.getStats;
}

let tasks = [];
try {
  const saved = localStorage.getItem('ci_cd_tasks');
  if (saved) tasks = JSON.parse(saved);
} catch (e) {
  console.warn('Failed to load tasks from localStorage');
}

let currentFilter = 'all';

function render() {
  const tbody = document.getElementById('task-body');
  const stats = document.getElementById('stats');
  if (!tbody || !stats) return;

  tbody.innerHTML = '';
  const filtered = filterTasks(tasks, currentFilter);

  if (filtered.length === 0) {
    const emptyRow = document.createElement('tr');
    emptyRow.className = 'empty-row';
    const emptyTd = document.createElement('td');
    emptyTd.colSpan = 4;
    emptyTd.textContent = 'Belum ada tugas. Tambahkan tugas baru di atas!';
    emptyRow.appendChild(emptyTd);
    tbody.appendChild(emptyRow);
  } else {
    filtered.forEach((task, idx) => {
      const tr = document.createElement('tr');
      tr.className = task.done ? 'done' : '';

      // Column 1: Row number
      const tdNum = document.createElement('td');
      tdNum.textContent = idx + 1;
      tr.appendChild(tdNum);

      // Column 2: Status checkbox
      const tdStatus = document.createElement('td');
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'status-checkbox';
      checkbox.checked = task.done;
      checkbox.addEventListener('change', () => {
        tasks = toggleTask(tasks, task.id);
        render();
      });
      tdStatus.appendChild(checkbox);
      tr.appendChild(tdStatus);

      // Column 3: Task title (or edit input)
      const tdTitle = document.createElement('td');
      tdTitle.textContent = task.title;
      tr.appendChild(tdTitle);

      // Column 4: Action buttons
      const tdActions = document.createElement('td');
      const actionsDiv = document.createElement('div');
      actionsDiv.className = 'actions';

      // Edit button
      const editBtn = document.createElement('button');
      editBtn.textContent = 'Edit';
      editBtn.className = 'btn-edit';
      editBtn.addEventListener('click', () => {
        // Replace title cell with an input
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'edit-input';
        input.value = task.title;
        tdTitle.textContent = '';
        tdTitle.appendChild(input);
        input.focus();

        // Change Edit button to Save
        editBtn.textContent = 'Simpan';
        editBtn.removeEventListener('click', arguments.callee);
        editBtn.addEventListener('click', function saveHandler() {
          try {
            tasks = editTask(tasks, task.id, input.value);
            render();
          } catch (err) {
            input.style.borderColor = '#f87171';
            console.warn(err.message);
          }
        });

        // Also save on Enter key
        input.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            try {
              tasks = editTask(tasks, task.id, input.value);
              render();
            } catch (err) {
              input.style.borderColor = '#f87171';
              console.warn(err.message);
            }
          }
          if (e.key === 'Escape') {
            render();
          }
        });
      });

      // Delete button
      const delBtn = document.createElement('button');
      delBtn.textContent = 'Hapus';
      delBtn.className = 'btn-delete';
      delBtn.addEventListener('click', () => {
        tasks = removeTask(tasks, task.id);
        render();
      });

      actionsDiv.appendChild(editBtn);
      actionsDiv.appendChild(delBtn);
      tdActions.appendChild(actionsDiv);
      tr.appendChild(tdActions);

      tbody.appendChild(tr);
    });
  }

  const s = getStats(tasks);
  stats.textContent = `${s.done}/${s.total} done (${s.percent}%)`;

  try {
    localStorage.setItem('ci_cd_tasks', JSON.stringify(tasks));
  } catch (e) {
    console.warn('Failed to save tasks to localStorage');
  }
}

function initApp() {
  const form = document.getElementById('task-form');
  const input = document.getElementById('task-input');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    try {
      tasks = [...tasks, createTask(input.value)];
      input.value = '';
      render();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn(err.message);
    }
  });

  document.querySelectorAll('[data-filter]').forEach((btn) => {
    btn.addEventListener('click', () => {
      currentFilter = btn.getAttribute('data-filter');
      render();
    });
  });

  render();
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { render, initApp };
}
