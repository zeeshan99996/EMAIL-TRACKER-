'use client';

import React, { useState } from 'react';
import { Header } from '@/components/header';
import { DEMO_PROJECT } from '@/lib/demo-store';
import { FolderKanban, Plus, Check, ShieldCheck, Mail, Key } from 'lucide-react';

interface ProjectItem {
  id: string;
  name: string;
  description: string;
  active: boolean;
  emailCount: number;
  keyCount: number;
  created: string;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectItem[]>([
    {
      id: DEMO_PROJECT.id,
      name: DEMO_PROJECT.name,
      description: DEMO_PROJECT.description || 'Primary outbound sales and marketing emails',
      active: true,
      emailCount: 3,
      keyCount: 1,
      created: 'Aug 04, 2026',
    },
    {
      id: 'prj_02',
      name: 'ERHA Marketing Campaigns',
      description: 'Monthly newsletter and promo announcements',
      active: false,
      emailCount: 0,
      keyCount: 1,
      created: 'Aug 15, 2026',
    },
    {
      id: 'prj_03',
      name: 'Client Onboarding Sequences',
      description: 'Transactional and welcome drip emails',
      active: false,
      emailCount: 0,
      keyCount: 0,
      created: 'Sep 01, 2026',
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    const newPrj: ProjectItem = {
      id: `prj_${Date.now()}`,
      name: newProjectName.trim(),
      description: newProjectDesc.trim() || 'Custom email tracking project',
      active: false,
      emailCount: 0,
      keyCount: 0,
      created: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
    };

    setProjects([...projects, newPrj]);
    setNewProjectName('');
    setNewProjectDesc('');
    setIsModalOpen(false);
  };

  const handleSelectActive = (id: string) => {
    setProjects(projects.map(p => ({ ...p, active: p.id === id })));
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
        {projects.map((project) => (
          <div
            key={project.id}
            className={`p-5 bg-white rounded-xl border transition-all ${
              project.active
                ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-md'
                : 'border-slate-200 hover:border-slate-300 shadow-sm'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <FolderKanban className="w-5 h-5" />
              </div>
              {project.active ? (
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
              {project.description}
            </p>

            <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center space-x-1.5 text-slate-600">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{project.emailCount} Emails</span>
              </div>
              <div className="flex items-center space-x-1.5 text-slate-600">
                <Key className="w-3.5 h-3.5 text-slate-400" />
                <span>{project.keyCount} API Keys</span>
              </div>
            </div>

            <div className="mt-3 text-[10px] text-slate-400">Created: {project.created}</div>
          </div>
        ))}
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
                  className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
