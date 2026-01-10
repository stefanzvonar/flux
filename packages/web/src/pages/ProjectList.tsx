import { useEffect, useState } from "preact/hooks";
import { route, RoutableProps } from "preact-router";
import {
  getProjects,
  resetDatabase,
  updateProject,
  type ProjectWithStats,
} from "../stores";
import { Modal, ThemeToggle } from "../components";
import { WebhooksPanel } from "../components/WebhooksPanel";

export function ProjectList(_props: RoutableProps) {
  const [projects, setProjects] = useState<ProjectWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProject, setEditingProject] = useState<ProjectWithStats | null>(
    null
  );
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsSection, setSettingsSection] = useState<
    "configuration" | "webhooks" | "reset"
  >("configuration");
  const [apiStatus, setApiStatus] = useState<"online" | "offline" | "unknown">(
    "unknown"
  );
  const [sseStatus, setSseStatus] = useState<"online" | "offline" | "unknown">(
    "unknown"
  );
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    refreshProjects();
  }, []);

  useEffect(() => {
    if (!settingsOpen) {
      setSseStatus("unknown");
      return;
    }
    setSseStatus("unknown");
    const eventsBase = import.meta.env.DEV ? "http://localhost:3000" : "";
    const source = new EventSource(`${eventsBase}/api/events`);
    let connected = false;
    const timeoutId = window.setTimeout(() => {
      if (!connected) setSseStatus("offline");
    }, 3000);

    const handleConnected = () => {
      connected = true;
      setSseStatus("online");
    };

    source.addEventListener("connected", handleConnected);
    source.onerror = () => {
      if (!connected) setSseStatus("offline");
    };

    return () => {
      source.removeEventListener("connected", handleConnected);
      source.close();
      window.clearTimeout(timeoutId);
    };
  }, [settingsOpen]);

  const refreshProjects = async () => {
    setLoading(true);
    setApiStatus("unknown");
    try {
      const allProjects = await getProjects();
      setProjects(allProjects);
      setApiStatus("online");
    } catch {
      setProjects([]);
      setApiStatus("offline");
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (project: ProjectWithStats) => {
    setEditingProject(project);
    setEditName(project.name);
    setEditDescription(project.description || "");
  };

  const closeEditModal = (force = false) => {
    if (saving && !force) return;
    setEditingProject(null);
    setEditName("");
    setEditDescription("");
  };

  const openSettings = () => {
    setSettingsSection("configuration");
    setSettingsOpen(true);
  };

  const handleReset = async () => {
    if (resetting) return;
    const confirmed = confirm(
      "This will wipe all projects, tasks, epics, and webhooks. Continue?"
    );
    if (!confirmed) return;
    setResetting(true);
    try {
      await resetDatabase();
      await refreshProjects();
    } finally {
      setResetting(false);
    }
  };

  const handleEditSubmit = async (e: Event) => {
    e.preventDefault();
    if (!editingProject || !editName.trim() || saving) return;

    setSaving(true);
    let didSave = false;
    try {
      await updateProject(editingProject.id, {
        name: editName.trim(),
        description: editDescription.trim() || undefined,
      });
      await refreshProjects();
      didSave = true;
    } finally {
      setSaving(false);
      if (didSave) {
        closeEditModal(true);
      }
    }
  };

  const apiOrigin =
    typeof window === "undefined" ? "" : window.location.origin;
  const apiLocation = import.meta.env.DEV
    ? "http://localhost:3000/api"
    : `${apiOrigin}/api`;
  const sseLocation = import.meta.env.DEV
    ? "http://localhost:3000/api/events"
    : `${apiOrigin}/api/events`;

  const statusLabel = (status: "online" | "offline" | "unknown") => {
    if (status === "online") return "Online";
    if (status === "offline") return "Offline";
    return "Checking";
  };

  const statusDotClass = (status: "online" | "offline" | "unknown") => {
    if (status === "online") return "bg-success";
    if (status === "offline") return "bg-error";
    return "bg-base-content/30";
  };

  const settingsSections = [
    {
      id: "configuration",
      title: "Configuration",
      subtitle: "API endpoints and realtime status",
    },
    {
      id: "webhooks",
      title: "Webhooks",
      subtitle: "Outbound events and delivery history",
    },
    {
      id: "reset",
      title: "Reset",
      subtitle: "Wipe data and start fresh",
    },
  ] as const;

  if (loading) {
    return (
      <div class="min-h-screen bg-base-200 flex items-center justify-center">
        <span class="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div class="min-h-screen bg-base-200">
      <div class="navbar bg-base-100 shadow-lg">
        <div class="flex-1">
          <span class="text-xl font-bold px-4">Flux</span>
        </div>
        <div class="flex-none flex items-center gap-2">
          <button
            class="btn btn-ghost btn-sm btn-circle"
            onClick={openSettings}
            title="Settings"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-1.14 1.603-1.14 1.902 0a1.724 1.724 0 002.591 1.008c.994-.574 2.158.59 1.584 1.584a1.724 1.724 0 001.008 2.59c1.14.3 1.14 1.604 0 1.903a1.724 1.724 0 00-1.008 2.59c.574.994-.59 2.158-1.584 1.584a1.724 1.724 0 00-2.59 1.008c-.3 1.14-1.604 1.14-1.903 0a1.724 1.724 0 00-2.59-1.008c-.994.574-2.158-.59-1.584-1.584a1.724 1.724 0 00-1.008-2.59c-1.14-.3-1.14-1.604 0-1.903a1.724 1.724 0 001.008-2.59c-.574-.994.59-2.158 1.584-1.584.89.515 2.042.032 2.59-1.008z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
          <ThemeToggle />
        </div>
      </div>

      <div class="p-6">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <button
            type="button"
            class="card bg-base-100 shadow-md hover:shadow-lg transition-shadow border-2 border-dashed border-base-300 text-left"
            onClick={() => route("/new")}
          >
            <div class="card-body items-center justify-center text-center">
              <div class="text-4xl font-semibold">+</div>
              <div class="text-lg font-semibold">New Project</div>
            </div>
          </button>

          {projects.map((project) => (
            <div
              key={project.id}
              class="card bg-base-100 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => route(`/board/${project.id}`)}
            >
              <div class="card-body">
                <div class="flex items-start justify-between gap-3">
                  <h3 class="card-title">{project.name}</h3>
                  <button
                    type="button"
                    class="btn btn-ghost btn-sm btn-circle"
                    aria-label="Edit project"
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditModal(project);
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.8"
                      class="w-4 h-4"
                      aria-hidden="true"
                    >
                      <path d="M9.4 1.6h5.2l.7 2.6a7.8 7.8 0 0 1 2.1.9l2.5-1.2 2.6 4.5-2.1 1.8a8 8 0 0 1 0 2.3l2.1 1.8-2.6 4.5-2.5-1.2a7.8 7.8 0 0 1-2.1.9l-.7 2.6H9.4l-.7-2.6a7.8 7.8 0 0 1-2.1-.9l-2.5 1.2-2.6-4.5 2.1-1.8a8 8 0 0 1 0-2.3L1.5 8.4l2.6-4.5 2.5 1.2c.7-.4 1.4-.7 2.1-.9l.7-2.6z" />
                      <circle cx="12" cy="12" r="3.2" />
                    </svg>
                  </button>
                </div>
                {project.description && (
                  <p class="text-base-content/60 text-sm line-clamp-2">
                    {project.description}
                  </p>
                )}
                <div class="mt-2">
                  {project.stats.total === 0 ? (
                    <span class="badge badge-soft badge-sm">No tasks</span>
                  ) : (
                    <span
                      class={`badge badge-soft badge-sm ${
                        project.stats.done === project.stats.total
                          ? "badge-success"
                          : ""
                      }`}
                    >
                      {project.stats.done} of {project.stats.total} complete
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Modal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        title="Settings"
        boxClassName="!w-[80vw] !h-[80vh] !max-w-none !max-h-none overflow-y-auto"
      >
        <div class="grid gap-4 lg:grid-cols-[240px_1fr]">
          <div class="bg-base-200 rounded-box p-0">
            <ul class="menu">
              {settingsSections.map((section) => {
                const isActive = settingsSection === section.id;
                return (
                  <li key={section.id}>
                    <button
                      type="button"
                      class={`rounded-none flex flex-col items-start gap-0.5 ${
                        isActive
                          ? "bg-base-300 border-l-4 border-primary"
                          : ""
                      }`}
                      onClick={() => setSettingsSection(section.id)}
                    >
                      <span class="font-medium">{section.title}</span>
                      <span class="text-xs text-base-content/60">
                        {section.subtitle}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <div class="bg-base-100 rounded-box border border-base-200 p-4 min-h-[360px]">
            {settingsSection === "configuration" && (
              <div class="space-y-4">
                <div>
                  <h4 class="text-lg font-semibold">Configuration</h4>
                  <p class="text-sm text-base-content/60">
                    Read-only diagnostics for your Flux instance.
                  </p>
                </div>
                <div class="space-y-3">
                  <div class="rounded-lg border border-base-200 p-3">
                    <div class="text-xs uppercase tracking-wide text-base-content/60">
                      API Location
                    </div>
                    <div class="mt-1 font-mono text-xs">{apiLocation}</div>
                  </div>
                  <div class="rounded-lg border border-base-200 p-3">
                    <div class="text-xs uppercase tracking-wide text-base-content/60">
                      Events Stream
                    </div>
                    <div class="mt-1 font-mono text-xs">{sseLocation}</div>
                  </div>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div class="flex items-center gap-3 rounded-lg border border-base-200 p-3">
                    <span
                      class={`h-2.5 w-2.5 rounded-full ${statusDotClass(
                        apiStatus
                      )}`}
                    ></span>
                    <div>
                      <div class="text-sm font-medium">API Status</div>
                      <div class="text-xs text-base-content/60">
                        {statusLabel(apiStatus)}
                      </div>
                    </div>
                  </div>
                  <div class="flex items-center gap-3 rounded-lg border border-base-200 p-3">
                    <span
                      class={`h-2.5 w-2.5 rounded-full ${statusDotClass(
                        sseStatus
                      )}`}
                    ></span>
                    <div>
                      <div class="text-sm font-medium">SSE Updates</div>
                      <div class="text-xs text-base-content/60">
                        {statusLabel(sseStatus)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {settingsSection === "webhooks" && (
              <div class="space-y-4">
                <WebhooksPanel />
              </div>
            )}

            {settingsSection === "reset" && (
              <div class="space-y-4">
                <div>
                  <h4 class="text-lg font-semibold">Reset Database</h4>
                  <p class="text-sm text-base-content/60">
                    This will wipe all projects, tasks, epics, and webhooks.
                  </p>
                </div>
                <div class="alert alert-warning">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.72-1.36 3.485 0l6.518 11.591c.75 1.334-.213 2.99-1.742 2.99H3.48c-1.53 0-2.493-1.656-1.743-2.99L8.257 3.1z"
                      clip-rule="evenodd"
                    />
                  </svg>
                  <span>
                    This action is permanent. You cannot undo a reset.
                  </span>
                </div>
                <button
                  type="button"
                  class="btn btn-error"
                  onClick={handleReset}
                  disabled={resetting}
                >
                  {resetting ? (
                    <span class="loading loading-spinner loading-sm"></span>
                  ) : (
                    "Reset Database"
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={!!editingProject}
        onClose={closeEditModal}
        title="Edit Project"
      >
        <form onSubmit={handleEditSubmit}>
          <div class="form-control mb-4">
            <label class="label">
              <span class="label-text">Project Name *</span>
            </label>
            <input
              type="text"
              class="input input-bordered w-full"
              value={editName}
              onInput={(e) => setEditName((e.target as HTMLInputElement).value)}
              required
            />
          </div>

          <div class="form-control mb-6">
            <label class="label">
              <span class="label-text">Description</span>
            </label>
            <textarea
              class="textarea textarea-bordered w-full"
              rows={3}
              value={editDescription}
              onInput={(e) =>
                setEditDescription((e.target as HTMLTextAreaElement).value)
              }
            />
          </div>

          <div class="modal-action">
            <button
              type="button"
              class="btn btn-ghost"
              onClick={() => closeEditModal()}
            >
              Cancel
            </button>
            <button
              type="submit"
              class="btn btn-primary"
              disabled={!editName.trim() || saving}
            >
              {saving ? (
                <span class="loading loading-spinner loading-sm"></span>
              ) : (
                "Save"
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
