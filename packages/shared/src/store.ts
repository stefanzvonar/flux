import type { Task, Epic, Project, Store } from './types.js';

// Storage adapter interface - can be localStorage or file-based
export interface StorageAdapter {
  read(): void;
  write(): void;
  data: Store;
}

let db: StorageAdapter;

// Generate a short unique ID
function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

// Set the storage adapter (called once at app startup)
export function setStorageAdapter(adapter: StorageAdapter): void {
  db = adapter;
}

// Get current storage adapter
export function getStorageAdapter(): StorageAdapter {
  return db;
}

// Initialize the store
export function initStore(): Store {
  if (!db) throw new Error('Storage adapter not set. Call setStorageAdapter first.');
  db.read();

  // Migrate from old single-project structure if needed
  const data = db.data as any;
  if (!Array.isArray(data.projects)) {
    data.projects = [];
    // Migrate old project if it exists
    if (data.project) {
      const oldProject = data.project;
      data.projects.push(oldProject);
      // Update tasks and epics with project_id
      if (Array.isArray(data.tasks)) {
        data.tasks.forEach((t: any) => { t.project_id = oldProject.id; });
      }
      if (Array.isArray(data.epics)) {
        data.epics.forEach((e: any) => { e.project_id = oldProject.id; });
      }
      delete data.project;
      db.write();
    }
  }

  // Ensure arrays exist
  if (!Array.isArray(data.tasks)) data.tasks = [];
  if (!Array.isArray(data.epics)) data.epics = [];

  return db.data;
}

// ============ Project Operations ============

export function getProjects(): Project[] {
  return [...(db.data.projects || [])];
}

export function getProject(id: string): Project | undefined {
  return (db.data.projects || []).find(p => p.id === id);
}

export function createProject(name: string, description?: string): Project {
  const project: Project = {
    id: generateId(),
    name,
    description,
  };
  if (!db.data.projects) db.data.projects = [];
  db.data.projects.push(project);
  db.write();
  return project;
}

export function updateProject(id: string, updates: Partial<Omit<Project, 'id'>>): Project | undefined {
  const index = db.data.projects.findIndex(p => p.id === id);
  if (index === -1) return undefined;
  db.data.projects[index] = { ...db.data.projects[index], ...updates };
  db.write();
  return db.data.projects[index];
}

export function deleteProject(id: string): void {
  const index = db.data.projects.findIndex(p => p.id === id);
  if (index === -1) return;
  db.data.projects.splice(index, 1);
  // Remove all epics and tasks for this project
  db.data.epics = db.data.epics.filter(e => e.project_id !== id);
  db.data.tasks = db.data.tasks.filter(t => t.project_id !== id);
  db.write();
}

export function getProjectStats(projectId: string): { total: number; done: number } {
  const tasks = db.data.tasks.filter(t => t.project_id === projectId && !t.archived);
  return {
    total: tasks.length,
    done: tasks.filter(t => t.status === 'done').length,
  };
}

// ============ Epic Operations ============

export function getEpics(projectId: string): Epic[] {
  return [...db.data.epics.filter(e => e.project_id === projectId)];
}

export function getAllEpics(): Epic[] {
  return [...db.data.epics];
}

export function getEpic(id: string): Epic | undefined {
  return db.data.epics.find(e => e.id === id);
}

export function createEpic(projectId: string, title: string, notes: string = ''): Epic {
  const epic: Epic = {
    id: generateId(),
    title,
    status: 'todo',
    depends_on: [],
    notes,
    project_id: projectId,
  };
  db.data.epics.push(epic);
  db.write();
  return epic;
}

export function updateEpic(id: string, updates: Partial<Omit<Epic, 'id'>>): Epic | undefined {
  const index = db.data.epics.findIndex(e => e.id === id);
  if (index === -1) return undefined;
  db.data.epics[index] = { ...db.data.epics[index], ...updates };
  db.write();
  return db.data.epics[index];
}

export function deleteEpic(id: string): boolean {
  const index = db.data.epics.findIndex(e => e.id === id);
  if (index === -1) return false;
  db.data.epics.splice(index, 1);
  // Remove epic_id from tasks that belonged to this epic
  db.data.tasks.forEach(task => {
    if (task.epic_id === id) {
      task.epic_id = undefined;
    }
  });
  db.write();
  return true;
}

// ============ Task Operations ============

export function getTasks(projectId: string): Task[] {
  return [...db.data.tasks.filter(t => t.project_id === projectId && !t.archived)];
}

export function getAllTasks(): Task[] {
  return [...db.data.tasks];
}

export function getTask(id: string): Task | undefined {
  return db.data.tasks.find(t => t.id === id);
}

export function getTasksByEpic(projectId: string, epicId: string | undefined): Task[] {
  return db.data.tasks.filter(t => t.project_id === projectId && t.epic_id === epicId);
}

export function getTasksByStatus(projectId: string, status: string): Task[] {
  return db.data.tasks.filter(t => t.project_id === projectId && t.status === status);
}

export function createTask(
  projectId: string,
  title: string,
  epicId?: string,
  notes: string = ''
): Task {
  const task: Task = {
    id: generateId(),
    title,
    status: 'todo',
    depends_on: [],
    notes,
    epic_id: epicId,
    project_id: projectId,
  };
  db.data.tasks.push(task);
  db.write();
  return task;
}

export function updateTask(id: string, updates: Partial<Omit<Task, 'id'>>): Task | undefined {
  const index = db.data.tasks.findIndex(t => t.id === id);
  if (index === -1) return undefined;
  db.data.tasks[index] = { ...db.data.tasks[index], ...updates };
  db.write();
  return db.data.tasks[index];
}

export function deleteTask(id: string): boolean {
  const index = db.data.tasks.findIndex(t => t.id === id);
  if (index === -1) return false;
  db.data.tasks.splice(index, 1);
  // Remove this task from any depends_on arrays
  db.data.tasks.forEach(task => {
    const depIndex = task.depends_on.indexOf(id);
    if (depIndex !== -1) {
      task.depends_on.splice(depIndex, 1);
    }
  });
  db.write();
  return true;
}

// ============ Dependency Operations ============

export function addDependency(taskId: string, dependsOnId: string): boolean {
  const task = db.data.tasks.find(t => t.id === taskId);
  if (!task) return false;
  if (task.depends_on.includes(dependsOnId)) return true;
  task.depends_on.push(dependsOnId);
  db.write();
  return true;
}

export function removeDependency(taskId: string, dependsOnId: string): boolean {
  const task = db.data.tasks.find(t => t.id === taskId);
  if (!task) return false;
  const index = task.depends_on.indexOf(dependsOnId);
  if (index === -1) return false;
  task.depends_on.splice(index, 1);
  db.write();
  return true;
}

export function isTaskBlocked(taskId: string): boolean {
  const task = db.data.tasks.find(t => t.id === taskId);
  if (!task || task.depends_on.length === 0) return false;
  return task.depends_on.some(depId => {
    const dep = db.data.tasks.find(t => t.id === depId);
    return dep && dep.status !== 'done';
  });
}

// ============ Archive Operations ============

export function archiveDoneTasks(projectId: string): number {
  let count = 0;
  db.data.tasks.forEach(task => {
    if (task.project_id === projectId && task.status === 'done' && !task.archived) {
      task.archived = true;
      count++;
    }
  });
  if (count > 0) {
    db.write();
  }
  return count;
}

export function archiveEmptyEpics(projectId: string): number {
  let count = 0;
  const epicIdsToDelete: string[] = [];

  db.data.epics.forEach(epic => {
    if (epic.project_id === projectId) {
      // Check if epic has any non-archived tasks
      const hasActiveTasks = db.data.tasks.some(
        task => task.epic_id === epic.id && !task.archived
      );
      if (!hasActiveTasks) {
        epicIdsToDelete.push(epic.id);
        count++;
      }
    }
  });

  if (epicIdsToDelete.length > 0) {
    db.data.epics = db.data.epics.filter(e => !epicIdsToDelete.includes(e.id));
    db.write();
  }

  return count;
}

export function cleanupProject(projectId: string, archiveTasks: boolean, archiveEpics: boolean): { archivedTasks: number; deletedEpics: number } {
  let archivedTasks = 0;
  let deletedEpics = 0;

  if (archiveTasks) {
    archivedTasks = archiveDoneTasks(projectId);
  }

  if (archiveEpics) {
    deletedEpics = archiveEmptyEpics(projectId);
  }

  return { archivedTasks, deletedEpics };
}
