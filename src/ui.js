/**
 * DOM glue code for the Task Tracker UI.
 * Not unit tested directly (jsdom integration is out of scope for this demo);
 * pure logic lives in app.js and is what continuous testing exercises.
 *
 * Wrapped in an IIFE so that variable declarations do not collide with
 * the function declarations in app.js (both scripts share the global
 * scope when loaded via plain <script> tags in the browser).
 */
/* eslint-env browser */
(function () {

var createTask, toggleTask, removeTask, editTask, filterTasks, getStats;

if (typeof window === 'undefined') {
  var app = require('./app');
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

var tasks = [];
try {
  var saved = localStorage.getItem('ci_cd_tasks');
  if (saved) tasks = JSON.parse(saved);
} catch (e) {
  console.warn('Failed to load tasks from localStorage');
}

var currentFilter = 'all';

function saveTasks() {
  try {
    localStorage.setItem('ci_cd_tasks', JSON.stringify(tasks));
  } catch (e) {
    console.warn('Failed to save tasks to localStorage');
  }
}

function render() {
  var list = document.getElementById('task-list');
  var stats = document.getElementById('stats');
  if (!list || !stats) return;

  list.innerHTML = '';
  var filtered = filterTasks(tasks, currentFilter);

  if (filtered.length === 0) {
    var emptyLi = document.createElement('li');
    emptyLi.className = 'empty-state';
    emptyLi.textContent = 'Belum ada tugas. Tambahkan di atas! ☝️';
    list.appendChild(emptyLi);
  } else {
    filtered.forEach(function (task) {
      var li = document.createElement('li');

      // Round checkbox button
      var checkBtn = document.createElement('button');
      checkBtn.className = 'todo-checkbox' + (task.done ? ' checked' : '');
      checkBtn.textContent = task.done ? '✓' : '';
      checkBtn.addEventListener('click', function () {
        tasks = toggleTask(tasks, task.id);
        saveTasks();
        render();
      });
      li.appendChild(checkBtn);

      // Task title span
      var span = document.createElement('span');
      span.className = 'task-text' + (task.done ? ' done' : '');
      span.textContent = task.title;
      li.appendChild(span);

      // Action buttons container
      var actionsDiv = document.createElement('div');
      actionsDiv.className = 'task-actions';

      // Edit button
      var editBtn = document.createElement('button');
      editBtn.textContent = 'Edit';
      editBtn.className = 'btn-sm btn-edit';
      editBtn.addEventListener('click', function onEdit() {
        // Replace span with input
        var input = document.createElement('input');
        input.type = 'text';
        input.className = 'edit-input';
        input.value = task.title;
        li.replaceChild(input, span);
        input.focus();

        // Replace Edit with Save
        var saveBtn = document.createElement('button');
        saveBtn.textContent = 'Simpan';
        saveBtn.className = 'btn-sm btn-save';
        actionsDiv.replaceChild(saveBtn, editBtn);

        function doSave() {
          try {
            tasks = editTask(tasks, task.id, input.value);
            saveTasks();
            render();
          } catch (err) {
            input.style.borderColor = '#f87171';
          }
        }

        saveBtn.addEventListener('click', doSave);
        input.addEventListener('keydown', function (e) {
          if (e.key === 'Enter') doSave();
          if (e.key === 'Escape') render();
        });
      });

      // Delete button
      var delBtn = document.createElement('button');
      delBtn.textContent = 'Hapus';
      delBtn.className = 'btn-sm btn-delete';
      delBtn.addEventListener('click', function () {
        tasks = removeTask(tasks, task.id);
        saveTasks();
        render();
      });

      actionsDiv.appendChild(editBtn);
      actionsDiv.appendChild(delBtn);
      li.appendChild(actionsDiv);

      list.appendChild(li);
    });
  }

  var s = getStats(tasks);
  stats.textContent = s.done + '/' + s.total + ' done (' + s.percent + '%)';
}

function initApp() {
  var form = document.getElementById('task-form');
  var input = document.getElementById('task-input');

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    try {
      tasks = [].concat(tasks, [createTask(input.value)]);
      input.value = '';
      saveTasks();
      render();
    } catch (err) {
      console.warn(err.message);
    }
  });

  document.querySelectorAll('[data-filter]').forEach(function (btn) {
    btn.addEventListener('click', function () {
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
  module.exports = { render: render, initApp: initApp };
}

})();
