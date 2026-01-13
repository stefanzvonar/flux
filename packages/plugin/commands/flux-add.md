---
description: Quickly add a task to Flux from a brief description
allowed-tools: mcp__flux__*
---

# Flux Add

Quickly create a task in Flux from a brief description.

## Instructions

1. Parse the user's input to extract:
   - Task title (required)
   - Epic or project context (if mentioned)
   - Any notes or acceptance criteria

2. If no project is specified, use `list_projects` to find the most recently updated project or ask which to use.

3. If an epic is mentioned by name, use `list_epics` to find the matching epic ID.

4. Create the task with `create_task` including:
   - A clear, actionable title
   - Any provided notes
   - Epic association if specified

5. Confirm creation with the task title and location.

## Examples

User: "add task: implement password reset flow"
→ Creates task "Implement password reset flow" in the active project

User: "flux add: fix the login bug in the auth epic"
→ Creates task "Fix login bug" in the Authentication epic

User: "add a task to review the API documentation with high priority"
→ Creates task "Review API documentation" with priority note
