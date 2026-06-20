/**
 * DOM glue code for the Task Tracker UI.
 * Not unit tested directly (jsdom integration is out of scope for this demo);
 * pure logic lives in app.js and is what continuous testing exercises.
 */
/* eslint-env browser */
let createTask, toggleTask, removeTask, filterTasks, getStats;

if (typeof require !== 'undefined') {
  const app = require('./app');
  createTask = app.createTask;
  toggleTask = app.toggleTask;
  removeTask = app.removeTask;
  filterTasks = app.filterTasks;
  getStats = app.getStats;
} else {
  createTask = window.createTask;
  toggleTask = window.toggleTask;
  removeTask = window.removeTask;
  filterTasks = window.filterTasks;
  getStats = window.getStats;
}

let tasks = [];
let currentFilter = 'all';

function render() {
  const list = document.getElementById('task-list');
  const stats = document.getElementById('stats');
  if (!list || !stats) return;

  list.innerHTML = '';
  filterTasks(tasks, currentFilter).forEach((task) => {
    const li = document.createElement('li');
    li.textContent = task.title;
    li.className = task.done ? 'done' : '';
    li.addEventListener('click', () => {
      tasks = toggleTask(tasks, task.id);
      render();
    });

    const del = document.createElement('button');
    del.textContent = 'x';
    del.addEventListener('click', (e) => {
      e.stopPropagation();
      tasks = removeTask(tasks, task.id);
      render();
    });

    li.appendChild(del);
    list.appendChild(li);
  });

  const s = getStats(tasks);
  stats.textContent = `${s.done}/${s.total} done (${s.percent}%)`;
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
  document.addEventListener('DOMContentLoaded', initApp);
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { render, initApp };
}
