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
        className="w-full flex items-center justify-between px-3.5 py-2.5 text-sm font-bold text-white bg-slate-900/90 hover:bg-slate-800 border border-slate-800 rounded-xl transition-colors shadow-xs"
      >
        <div className="flex items-center space-x-2.5 truncate">
          <FolderGit2 className="w-4 h-4 text-[#53E2FE] shrink-0" />
          <span className="truncate text-white font-bold">{selectedProject}</span>
        </div>
        <ChevronDown className="w-4 h-4 text-white shrink-0 ml-1" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-[#161922] border border-slate-800 rounded-xl shadow-2xl z-50 py-1.5 backdrop-blur-md">
          <button
            onClick={() => {
              setSelectedProject(DEMO_PROJECT.name);
              setIsOpen(false);
            }}
            className="w-full text-left px-3.5 py-2 text-sm text-white hover:bg-slate-800/80 flex items-center space-x-2 font-bold"
          >
            <span className="w-2 h-2 rounded-full bg-[#53E2FE]"></span>
            <span className="truncate text-white font-bold">{DEMO_PROJECT.name}</span>
          </button>
          <button
            onClick={() => {
              setSelectedProject('ERHA Marketing');
              setIsOpen(false);
            }}
            className="w-full text-left px-3.5 py-2 text-sm text-white hover:bg-slate-800/80 flex items-center space-x-2 font-bold"
          >
            <span className="w-2 h-2 rounded-full bg-slate-500"></span>
            <span className="truncate text-white font-bold">ERHA Marketing</span>
          </button>
          <div className="border-t border-slate-800 my-1"></div>
          <a
            href="/dashboard/projects"
            className="w-full text-left px-3.5 py-2 text-xs font-bold text-[#53E2FE] hover:bg-slate-800/80 flex items-center space-x-1.5"
          >
            <Plus className="w-3.5 h-3.5 text-[#53E2FE]" />
            <span className="font-bold text-[#53E2FE]">Manage Projects</span>
          </a>
        </div>
      )}
    </div>
  );
}
