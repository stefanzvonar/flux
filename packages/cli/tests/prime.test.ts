import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import { setupTestEnv, teardownTestEnv, getLogs } from './helpers.js';

vi.mock('../src/client.js', () => ({
  getReadyTasks: vi.fn(),
  getProjects: vi.fn(),
}));

import { getReadyTasks, getProjects } from '../src/client.js';
import { primeCommand } from '../src/commands/prime.js';

const mockGetReadyTasks = getReadyTasks as Mock;
const mockGetProjects = getProjects as Mock;

describe('prime command', () => {
  beforeEach(() => {
    setupTestEnv();
    vi.clearAllMocks();
    delete process.env.MCP_SERVER;
  });

  afterEach(() => {
    teardownTestEnv();
  });

  it('outputs full instructions by default', async () => {
    mockGetReadyTasks.mockResolvedValue([]);

    await primeCommand([], {}, false);

    expect(getLogs().some(l => l.includes('Flux Task Management'))).toBe(true);
    expect(getLogs().some(l => l.includes('flux ready'))).toBe(true);
  });

  it('outputs minimal instructions with --mcp flag', async () => {
    mockGetReadyTasks.mockResolvedValue([]);

    await primeCommand([], { mcp: true }, false);

    const output = getLogs().join('\n');
    expect(output).toContain('## Flux');
    expect(output).not.toContain('Flux Task Management');
  });

  it('outputs full instructions with --full flag even when MCP_SERVER set', async () => {
    process.env.MCP_SERVER = 'true';
    mockGetReadyTasks.mockResolvedValue([]);

    await primeCommand([], { full: true }, false);

    expect(getLogs().some(l => l.includes('Flux Task Management'))).toBe(true);
  });

  it('auto-detects MCP mode from MCP_SERVER env', async () => {
    process.env.MCP_SERVER = 'true';
    mockGetReadyTasks.mockResolvedValue([]);

    await primeCommand([], {}, false);

    const output = getLogs().join('\n');
    expect(output).toContain('## Flux');
    expect(output).not.toContain('Flux Task Management');
  });

  it('shows project context when defaultProject provided', async () => {
    mockGetReadyTasks.mockResolvedValue([]);

    await primeCommand([], {}, false, 'proj-1');

    expect(getLogs().some(l => l.includes('Project: proj-1'))).toBe(true);
  });

  it('passes defaultProject to getReadyTasks', async () => {
    mockGetReadyTasks.mockResolvedValue([]);

    await primeCommand([], {}, false, 'proj-1');

    expect(mockGetReadyTasks).toHaveBeenCalledWith('proj-1');
  });

  it('shows ready task counts by priority', async () => {
    mockGetReadyTasks.mockResolvedValue([
      { id: 't1', priority: 0 },
      { id: 't2', priority: 0 },
      { id: 't3', priority: 1 },
      { id: 't4', priority: 2 },
    ]);

    await primeCommand([], {}, false);

    expect(getLogs().some(l => l.includes('2 P0') && l.includes('1 P1') && l.includes('1 P2'))).toBe(true);
  });

  it('handles tasks with undefined priority as P2', async () => {
    mockGetReadyTasks.mockResolvedValue([
      { id: 't1' }, // no priority = P2
    ]);

    await primeCommand([], {}, false);

    expect(getLogs().some(l => l.includes('1 P2'))).toBe(true);
  });

  it('outputs JSON when --json flag', async () => {
    mockGetProjects.mockResolvedValue([{ id: 'proj-1', name: 'Test' }]);
    mockGetReadyTasks.mockResolvedValue([{ id: 't1' }]);

    await primeCommand([], {}, true, 'proj-1');

    const output = JSON.parse(getLogs()[0]);
    expect(output.mode).toBe('cli');
    expect(output.project).toBe('proj-1');
    expect(output.readyCount).toBe(1);
    expect(output.projects).toEqual([{ id: 'proj-1', name: 'Test' }]);
  });

  it('outputs mcp mode in JSON when --mcp flag', async () => {
    mockGetProjects.mockResolvedValue([]);
    mockGetReadyTasks.mockResolvedValue([]);

    await primeCommand([], { mcp: true }, true);

    const output = JSON.parse(getLogs()[0]);
    expect(output.mode).toBe('mcp');
  });

  it('silently handles errors from getReadyTasks', async () => {
    mockGetReadyTasks.mockRejectedValue(new Error('Network error'));

    // Should not throw
    await primeCommand([], {}, false);

    // Should still output instructions
    expect(getLogs().some(l => l.includes('Flux Task Management'))).toBe(true);
  });
});
