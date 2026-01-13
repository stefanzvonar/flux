---
description: Show current Flux board status and what to work on next
allowed-tools: mcp__flux__*
---

# Flux Status

Show the current state of your Flux board and suggest what to work on next.

## Instructions

1. Use `list_projects` to get all projects with their stats.

2. For the active project (or most recently updated), use `list_epics` and `list_tasks` to get the full picture.

3. Present a summary:
   - Tasks in progress (doing)
   - Blocked tasks and what's blocking them
   - Tasks ready to start (todo with no blockers)
   - Recently completed tasks

4. Suggest the next task to pick up based on:
   - Unblocking other tasks (high impact)
   - No dependencies (ready to start)
   - Epic progress (finishing an epic)

## Output Format

```
📊 Project: my-app

🔄 In Progress (2)
  • Implement JWT service
  • Design dashboard layout

🚫 Blocked (1)
  • Create login endpoint (waiting on: JWT service)

✅ Ready to Start (3)
  • Set up CI pipeline
  • Write API documentation
  • Add unit tests for auth

💡 Suggested Next: "Set up CI pipeline" - unblocks deployment tasks
```
