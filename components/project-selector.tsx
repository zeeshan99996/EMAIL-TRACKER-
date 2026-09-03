'use client';

import React, { useState } from 'react';
import { FolderGit2, ChevronDown, Plus } from 'lucide-react';
import { DEMO_PROJECT } from '@/lib/demo-store';

export function ProjectSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(DEMO_PROJECT.name);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors"
      >
        <div className="flex items-center space-x-2 truncate">
          <FolderGit2 className="w-4 h-4 text-blue-600 shrink-0" />
          <span className="truncate">{selectedProject}</span>
        </div>
        <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-50 py-1">
          <button
            onClick={() => {
              setSelectedProject(DEMO_PROJECT.name);
              setIsOpen(false);
            }}
            className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center space-x-2"
          >
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            <span className="truncate font-medium">{DEMO_PROJECT.name}</span>
          </button>
          <button
            onClick={() => {
              setSelectedProject('ERHA Marketing');
              setIsOpen(false);
            }}
            className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center space-x-2"
          >
            <span className="w-2 h-2 rounded-full bg-slate-300"></span>
            <span className="truncate">ERHA Marketing</span>
          </button>
          <div className="border-t border-slate-100 my-1"></div>
          <a
            href="/dashboard/projects"
            className="w-full text-left px-3 py-2 text-xs font-medium text-blue-600 hover:bg-blue-50 flex items-center space-x-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Manage Projects</span>
          </a>
        </div>
      )}
    </div>
  );
}
