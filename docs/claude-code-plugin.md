## Claude Code Plugin

Flux includes a plugin for [Claude Code](https://claude.ai/code) that lets you generate epics and tasks directly from your project requirements.

### Installation
```bash
# Add the Flux marketplace
/plugin marketplace add sirsjg/flux

# Install the plugin
/plugin install flux@flux
```

Restart Claude Code after installation.

### Commands

| Command | Description |
|---------|-------------|
| `/flux-generate` | Analyze project docs and generate epics/tasks with dependencies |
| `/flux-add` | Quickly add a task (e.g., `/flux-add implement password reset`) |
| `/flux-status` | Show board status and suggest what to work on next |

### Usage

In any project with a README or requirements doc:
```
/flux-generate
```

Claude will read your project documentation, create a Flux project, break it down into epics and tasks, and set up dependencies automatically.