const {
  createTask,
  toggleTask,
  removeTask,
  filterTasks,
  getStats,
} = require('../src/app');

describe('createTask', () => {
  test('creates a task with given title, defaults to not done', () => {
    const task = createTask('Belajar CI/CD');
    expect(task.title).toBe('Belajar CI/CD');
    expect(task.done).toBe(false);
    expect(typeof task.id).toBe('number');
  });

  test('trims whitespace from title', () => {
    const task = createTask('  Setup SonarCloud  ');
    expect(task.title).toBe('Setup SonarCloud');
  });

  test('throws on empty title', () => {
    expect(() => createTask('')).toThrow('Task title must be a non-empty string');
  });

  test('throws on whitespace-only title', () => {
    expect(() => createTask('   ')).toThrow();
  });

  test('throws on non-string title', () => {
    expect(() => createTask(123)).toThrow();
  });
});

describe('toggleTask', () => {
  test('flips done state of matching task', () => {
    const tasks = [createTask('A'), createTask('B')];
    const updated = toggleTask(tasks, tasks[0].id);
    expect(updated[0].done).toBe(true);
    expect(updated[1].done).toBe(false);
  });

  test('does not mutate original array', () => {
    const tasks = [createTask('A')];
    const updated = toggleTask(tasks, tasks[0].id);
    expect(tasks[0].done).toBe(false);
    expect(updated).not.toBe(tasks);
  });

  test('leaves array unchanged if id not found', () => {
    const tasks = [createTask('A')];
    const updated = toggleTask(tasks, 999999);
    expect(updated[0].done).toBe(false);
  });
});

describe('removeTask', () => {
  test('removes task with matching id', () => {
    const tasks = [createTask('A'), createTask('B')];
    const updated = removeTask(tasks, tasks[0].id);
    expect(updated).toHaveLength(1);
    expect(updated[0].title).toBe('B');
  });

  test('returns same-length array if id not found', () => {
    const tasks = [createTask('A')];
    const updated = removeTask(tasks, 12345);
    expect(updated).toHaveLength(1);
  });
});

describe('filterTasks', () => {
  test('filters done tasks', () => {
    let tasks = [createTask('A'), createTask('B')];
    tasks = toggleTask(tasks, tasks[0].id);
    const done = filterTasks(tasks, 'done');
    expect(done).toHaveLength(1);
    expect(done[0].title).toBe('A');
  });

  test('filters pending tasks', () => {
    let tasks = [createTask('A'), createTask('B')];
    tasks = toggleTask(tasks, tasks[0].id);
    const pending = filterTasks(tasks, 'pending');
    expect(pending).toHaveLength(1);
    expect(pending[0].title).toBe('B');
  });

  test('returns all tasks for unknown/all filter', () => {
    const tasks = [createTask('A'), createTask('B')];
    expect(filterTasks(tasks, 'all')).toHaveLength(2);
  });
});

describe('getStats', () => {
  test('computes correct stats for mixed tasks', () => {
    let tasks = [createTask('A'), createTask('B'), createTask('C')];
    tasks = toggleTask(tasks, tasks[0].id);
    const stats = getStats(tasks);
    expect(stats).toEqual({ total: 3, done: 1, percent: 33 });
  });

  test('handles empty task list', () => {
    expect(getStats([])).toEqual({ total: 0, done: 0, percent: 0 });
  });

  test('handles all tasks done', () => {
    let tasks = [createTask('A'), createTask('B')];
    tasks = toggleTask(tasks, tasks[0].id);
    tasks = toggleTask(tasks, tasks[1].id);
    expect(getStats(tasks).percent).toBe(100);
  });
});
