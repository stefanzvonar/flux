import { useEffect, useState } from "preact/hooks";
import { route, RoutableProps } from "preact-router";
import { getProjects, updateProject, type ProjectWithStats } from "../stores";
import { Modal, ThemeToggle } from "../components";

export function ProjectList(_props: RoutableProps) {
  const [projects, setProjects] = useState<ProjectWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProject, setEditingProject] = useState<ProjectWithStats | null>(
    null
  );
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    refreshProjects();
  }, []);

  const refreshProjects = async () => {
    setLoading(true);
    const allProjects = await getProjects();
    setProjects(allProjects);
    setLoading(false);
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
        <div class="flex-none">
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
