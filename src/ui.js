/**
 * DOM glue code for the Task Tracker UI.
 * Wrapped in an IIFE to avoid global scope collision with app.js.
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
  var tbody = document.getElementById('task-body');
  var stats = document.getElementById('stats');
  if (!tbody || !stats) return;

  tbody.innerHTML = '';
  var filtered = filterTasks(tasks, currentFilter);

  if (filtered.length === 0) {
    var emptyRow = document.createElement('tr');
    emptyRow.className = 'empty-row';
    var emptyTd = document.createElement('td');
    emptyTd.colSpan = 4;
    emptyTd.textContent = 'Belum ada tugas. Tambahkan tugas baru di atas!';
    emptyRow.appendChild(emptyTd);
    tbody.appendChild(emptyRow);
  } else {
    filtered.forEach(function (task, idx) {
      var tr = document.createElement('tr');
      tr.className = task.done ? 'done' : '';

      // Column 1: Row number
      var tdNum = document.createElement('td');
      tdNum.textContent = idx + 1;
      tr.appendChild(tdNum);

      // Column 2: Status checkbox
      var tdStatus = document.createElement('td');
      var checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'status-cb';
      checkbox.checked = task.done;
      checkbox.addEventListener('change', function () {
        tasks = toggleTask(tasks, task.id);
        saveTasks();
        render();
      });
      tdStatus.appendChild(checkbox);
      tr.appendChild(tdStatus);

      // Column 3: Task title
      var tdTitle = document.createElement('td');
      tdTitle.className = 'task-title';
      tdTitle.textContent = task.title;
      tr.appendChild(tdTitle);

      // Column 4: Action buttons
      var tdActions = document.createElement('td');
      var actionsDiv = document.createElement('div');
      actionsDiv.className = 'actions';

      // Edit button
      var editBtn = document.createElement('button');
      editBtn.textContent = 'Edit';
      editBtn.className = 'btn-sm btn-edit';
      editBtn.addEventListener('click', function onEdit() {
        var input = document.createElement('input');
        input.type = 'text';
        input.className = 'edit-input';
        input.value = task.title;
        tdTitle.textContent = '';
        tdTitle.appendChild(input);
        input.focus();

        // Swap Edit → Save
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
      tdActions.appendChild(actionsDiv);
      tr.appendChild(tdActions);

      tbody.appendChild(tr);
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
