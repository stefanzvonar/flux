import type { Task, Epic, Project } from '@flux/shared';

const API_BASE = import.meta.env.DEV ? 'http://localhost:3000/api' : '/api';

// Project with stats from API
export interface ProjectWithStats extends Project {
  stats: { total: number; done: number };
}

// Task with blocked status from API
export interface TaskWithBlocked extends Task {
  blocked: boolean;
}

// ============ Project Operations ============

export async function getProjects(): Promise<ProjectWithStats[]> {
  const res = await fetch(`${API_BASE}/projects`);
  return res.json();
}

export async function getProject(id: string): Promise<ProjectWithStats | null> {
  const res = await fetch(`${API_BASE}/projects/${id}`);
  if (!res.ok) return null;
  return res.json();
}

export async function createProject(name: string, description?: string): Promise<Project> {
  const res = await fetch(`${API_BASE}/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, description }),
  });
  return res.json();
}

export async function updateProject(id: string, updates: Partial<Omit<Project, 'id'>>): Promise<Project | null> {
  const res = await fetch(`${API_BASE}/projects/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!res.ok) return null;
  return res.json();
}

export async function deleteProject(id: string): Promise<void> {
  await fetch(`${API_BASE}/projects/${id}`, { method: 'DELETE' });
}

// ============ Epic Operations ============

export async function getEpics(projectId: string): Promise<Epic[]> {
  const res = await fetch(`${API_BASE}/projects/${projectId}/epics`);
  return res.json();
}

export async function getEpic(id: string): Promise<Epic | null> {
  const res = await fetch(`${API_BASE}/epics/${id}`);
  if (!res.ok) return null;
  return res.json();
}

export async function createEpic(projectId: string, title: string, notes?: string): Promise<Epic> {
  const res = await fetch(`${API_BASE}/projects/${projectId}/epics`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, notes }),
  });
  return res.json();
}

export async function updateEpic(id: string, updates: Partial<Omit<Epic, 'id'>>): Promise<Epic | null> {
  const res = await fetch(`${API_BASE}/epics/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!res.ok) return null;
  return res.json();
}

export async function deleteEpic(id: string): Promise<boolean> {
  const res = await fetch(`${API_BASE}/epics/${id}`, { method: 'DELETE' });
  return res.ok;
}

// ============ Task Operations ============

export async function getTasks(projectId: string): Promise<TaskWithBlocked[]> {
  const res = await fetch(`${API_BASE}/projects/${projectId}/tasks`);
  return res.json();
}

export async function getTask(id: string): Promise<TaskWithBlocked | null> {
  const res = await fetch(`${API_BASE}/tasks/${id}`);
  if (!res.ok) return null;
  return res.json();
}

export async function createTask(
  projectId: string,
  title: string,
  epicId?: string,
  notes?: string
): Promise<Task> {
  const res = await fetch(`${API_BASE}/projects/${projectId}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, epic_id: epicId, notes }),
  });
  return res.json();
}

export async function updateTask(id: string, updates: Partial<Omit<Task, 'id'>>): Promise<TaskWithBlocked | null> {
  const res = await fetch(`${API_BASE}/tasks/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!res.ok) return null;
  return res.json();
}

export async function deleteTask(id: string): Promise<boolean> {
  const res = await fetch(`${API_BASE}/tasks/${id}`, { method: 'DELETE' });
  return res.ok;
}

export async function cleanupProject(
  projectId: string,
  archiveTasks: boolean,
  archiveEpics: boolean
): Promise<{ success: boolean; archivedTasks: number; deletedEpics: number }> {
  const res = await fetch(`${API_BASE}/projects/${projectId}/cleanup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ archiveTasks, archiveEpics }),
  });
  return res.json();
}
