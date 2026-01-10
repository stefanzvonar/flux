# AGENTS.md

This file provides guidance to AI agents when working with code in this repository.

## Project Overview

Flux is a Kanban board application with multi-project support, designed for both web UI and AI assistant integration via MCP (Model Context Protocol). It's a TypeScript monorepo with four packages sharing a common SQLite data store.

## Common Commands

### Development (requires two terminals)

```bash
# Terminal 1: Start API server (port 3000)
pnpm --filter @flux/server dev

# Terminal 2: Start web dev server (port 5173, proxies API to :3000)
pnpm --filter @flux/web dev

# Optional - MCP server for local testing
pnpm --filter @flux/mcp dev
```

### Build & Type Check

```bash
pnpm build          # Build all packages
pnpm typecheck      # Type check all packages
```

### Docker

```bash
docker build -t flux-mcp .
docker-compose up   # Web UI with persistent data

# MCP mode (stdio)
docker run -i --rm -v flux-data:/app/packages/data flux-mcp

# Web mode
docker run -d -p 3000:3000 -v flux-data:/app/packages/data flux-mcp node packages/server/dist/index.js
```

## Architecture

```
packages/
├── shared/     # Core types (Task, Epic, Project, Store) and storage abstraction
├── web/        # Preact + Vite + Tailwind/DaisyUI frontend with drag-drop (@dnd-kit)
├── server/     # Hono REST API server
├── mcp/        # MCP server for LLM integration (Claude Desktop, Claude Code)
└── data/       # Shared SQLite file storage (flux.sqlite)
```

**Key architectural decisions:**
- All interfaces (web UI, REST API, MCP) read/write to the same `packages/data/flux.sqlite` file
- Storage adapter pattern in `packages/shared/src/store.ts` allows pluggable backends
- Tasks can depend on other tasks/epics; blocked tasks show visual indicators
- Epics act as swimlanes grouping tasks on the Kanban board

## Data Model

```typescript
type Task = {
  id: string;
  title: string;
  status: 'todo' | 'in_progress' | 'done';
  depends_on: string[];  // Task/Epic IDs
  notes: string;
  epic_id?: string;
  project_id: string;
};

type Epic = {
  id: string;
  title: string;
  status: 'todo' | 'in_progress' | 'done';
  depends_on: string[];
  notes: string;
  project_id: string;
};

type Project = {
  id: string;
  name: string;
  description?: string;
};
```

## Tech Stack

- **Frontend:** Preact, Vite, Tailwind CSS, DaisyUI, @dnd-kit
- **Backend:** Hono, Node.js 22
- **Data:** SQLite (single-file persistence)
- **LLM Integration:** @modelcontextprotocol/sdk
- **Build:** TypeScript 5.6, pnpm workspaces

## Requirements

- Node.js 21+
- pnpm 10+
