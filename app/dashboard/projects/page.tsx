'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/header';
import { Project } from '@/lib/types';
import { FolderKanban, Plus, Check, Mail, Key } from 'lucide-react';

interface ProjectDisplay extends Project {
  active?: boolean;
  emailCount?: number;
  keyCount?: number;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeProjectId, setActiveProjectId] = useState<string>('prj_demo_01');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadProjects = () => {
    fetch('/api/v1/projects', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        if (data && data.projects) {
          setProjects(data.projects);
          if (data.projects.length > 0 && !data.projects.some((p: Project) => p.id === activeProjectId)) {
            setActiveProjectId(data.projects[0].id);
          }
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load projects:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim() || submitting) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/v1/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newProjectName.trim(),
          description: newProjectDesc.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to create project');
      }

      setNewProjectName('');
      setNewProjectDesc('');
      setIsModalOpen(false);
      loadProjects();
    } catch (err: any) {
      alert('Error creating project: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSelectActive = (id: string) => {
    setActiveProjectId(id);
  };

  return (
    <div className="space-y-6">
      <Header title="Projects Management" />

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900">Multi-Tenant Projects</h2>
          <p className="text-xs text-slate-500">
            Isolate API keys, email logs, and analytics per campaign or organization project.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Project</span>
        </button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-3 py-12 text-center text-slate-500">
            Loading projects...
          </div>
        ) : projects.length === 0 ? (
          <div className="col-span-3 py-12 text-center text-slate-500">
            No projects found. Create one to get started.
          </div>
        ) : (
          projects.map((project) => {
            const isActive = project.id === activeProjectId;
            return (
              <div
                key={project.id}
                className={`p-5 bg-white rounded-xl border transition-all ${
                  isActive
                    ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-md'
                    : 'border-slate-200 hover:border-slate-300 shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <FolderKanban className="w-5 h-5" />
                  </div>
                  {isActive ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                      <Check className="w-3 h-3 mr-1" /> Active Project
                    </span>
                  ) : (
                    <button
                      onClick={() => handleSelectActive(project.id)}
                      className="text-xs font-semibold text-slate-500 hover:text-blue-600 border border-slate-200 hover:border-blue-300 px-2.5 py-1 rounded-md transition-colors"
                    >
                      Switch To
                    </button>
                  )}
                </div>

                <h3 className="text-sm font-bold text-slate-900 mt-3">{project.name}</h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2 min-h-[32px]">
                  {project.description || 'No description provided.'}
                </p>

                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center space-x-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>ID: <code className="font-mono text-[10px] text-slate-700">{project.id}</code></span>
                  </div>
                </div>

                <div className="mt-3 text-[10px] text-slate-400">
                  Created: {new Date(project.created_at).toLocaleDateString()}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl border border-slate-200 max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">Create New Project</h3>
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Project Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Outreach Q4"
                  value={newProjectName}
                  onChange={e => setNewProjectName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description (Optional)</label>
                <textarea
                  placeholder="Brief summary of campaign or recipient segment..."
                  value={newProjectDesc}
                  onChange={e => setNewProjectDesc(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-20"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
