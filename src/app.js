/**
 * Task Tracker - core logic
 * Pure functions kept separate from DOM code so they are easy to unit test.
 */

/**
 * Create a new task object.
 * @param {string} title
 * @returns {{id: number, title: string, done: boolean, createdAt: number}}
 */
function createTask(title) {
  if (typeof title !== 'string' || title.trim().length === 0) {
    throw new Error('Task title must be a non-empty string');
  }
  return {
    id: Date.now() + Math.floor(Math.random() * 1000),
    title: title.trim(),
    done: false,
    createdAt: Date.now(),
  };
}

/**
 * Toggle a task's done state by id.
 * @param {Array} tasks
 * @param {number} id
 * @returns {Array} new tasks array
 */
function toggleTask(tasks, id) {
  return tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t));
}

/**
 * Remove a task by id.
 * @param {Array} tasks
 * @param {number} id
 * @returns {Array} new tasks array
 */
function removeTask(tasks, id) {
  return tasks.filter((t) => t.id !== id);
}

/**
 * Filter tasks by status.
 * @param {Array} tasks
 * @param {'all'|'done'|'pending'} status
 * @returns {Array}
 */
function filterTasks(tasks, status) {
  if (status === 'done') return tasks.filter((t) => t.done);
  if (status === 'pending') return tasks.filter((t) => !t.done);
  return tasks;
}

/**
 * Compute simple progress stats.
 * @param {Array} tasks
 * @returns {{total: number, done: number, percent: number}}
 */
function getStats(tasks) {
  const total = tasks.length;
  const done = tasks.filter((t) => t.done).length;
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);
  return { total, done, percent };
}

module.exports = {
  createTask,
  toggleTask,
  removeTask,
  filterTasks,
  getStats,
};
