'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  LayoutTemplate,
  Plus,
  Search,
  Edit3,
  Trash2,
  Copy,
  ExternalLink,
  Send,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  X,
  Eye,
  Code2,
  Sparkles,
  Info,
  Link2,
  MousePointerClick,
  Loader2,
  ArrowRight,
  Sliders,
} from 'lucide-react';
import { Header } from '@/components/header';
import {
  CustomTemplate,
  PRESET_TEMPLATES,
  getAllTemplates,
  saveCustomTemplate,
  deleteCustomTemplate,
} from '@/lib/templates/templates';

export default function TemplatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<CustomTemplate[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<'all' | 'custom' | 'preset' | 'with-images'>('all');

  // Editor Modal State
  const [showEditorModal, setShowEditorModal] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [modalTitle, setModalTitle] = useState('');
  const [modalSubject, setModalSubject] = useState('');
  const [modalBody, setModalBody] = useState('');
  const [modalImageUrl, setModalImageUrl] = useState<string>('');
  const [modalImageLinkUrl, setModalImageLinkUrl] = useState<string>('');
  const [modalImagePosition, setModalImagePosition] = useState<'top' | 'middle' | 'bottom'>('top');
  const [modalImageAlignment, setModalImageAlignment] = useState<'center' | 'left' | 'right'>('center');
  const [modalImageWidth, setModalImageWidth] = useState<'100%' | '75%' | '50%' | '300px'>('100%');
  const [editorTab, setEditorTab] = useState<'visual' | 'code'>('visual');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState('');

  // AI Prompt-to-Template Modal State
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiTone, setAiTone] = useState<'professional' | 'direct' | 'friendly' | 'value-first'>('professional');
  const [aiCtaText, setAiCtaText] = useState('Schedule a 10-Minute Call');
  const [aiCtaUrl, setAiCtaUrl] = useState('https://calendly.com/your-team');
  const [aiImageUrl, setAiImageUrl] = useState('');
  const [aiImageLinkUrl, setAiImageLinkUrl] = useState('');
  const [showAdvancedAi, setShowAdvancedAi] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [generatedResult, setGeneratedResult] = useState<{
    name: string;
    subject: string;
    body: string;
    imageUrl?: string;
    imageLinkUrl?: string;
  } | null>(null);

  // Quick Insert Modals (Text Link & CTA Button)
  const [showInsertLinkModal, setShowInsertLinkModal] = useState(false);
  const [customLinkText, setCustomLinkText] = useState('');
  const [customLinkUrl, setCustomLinkUrl] = useState('');

  const [showInsertButtonModal, setShowInsertButtonModal] = useState(false);
  const [customBtnText, setCustomBtnText] = useState('View Our Portfolio & Case Studies');
  const [customBtnUrl, setCustomBtnUrl] = useState('https://example.com/services');

  // Preview Simulation with Sample Lead
  const [previewWithLead, setPreviewWithLead] = useState(true);
  const sampleLead = {
    first_name: 'Alex',
    name: 'Alex Rivera',
    company: 'TechFlow Systems',
    website: 'techflow.io',
    phone: '+1 415-555-0199',
    email: 'alex@techflow.io',
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const aiFileInputRef = useRef<HTMLInputElement>(null);

  // Load templates on mount
  useEffect(() => {
    refreshTemplates();
  }, []);

  const refreshTemplates = () => {
    const list = getAllTemplates();
    setTemplates(list);
  };

  // Filter templates
  const filteredTemplates = templates.filter((tmpl) => {
    const matchesSearch =
      tmpl.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tmpl.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tmpl.body.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterCategory === 'custom') return tmpl.isCustom;
    if (filterCategory === 'preset') return !tmpl.isCustom;
    if (filterCategory === 'with-images') return !!tmpl.imageUrl || tmpl.body.includes('<img');

    return true;
  });

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setEditingTemplateId(null);
    setModalTitle(`My Outreach Template ${templates.filter((t) => t.isCustom).length + 1}`);
    setModalSubject('Quick question regarding {{company}}');
    setModalBody(
      `<div style="font-family: Arial, sans-serif; color: #1e293b; max-width: 600px; line-height: 1.6; font-size: 14px;">
  <p>Hi {{first_name}},</p>
  <p>I came across {{company}} and really liked what your team is building.</p>
  <p>We help growing companies scale their outbound sales pipeline and optimize web conversion by over 38%.</p>
  <div style="margin: 22px 0;">
    <a href="https://example.com" target="_blank" rel="noopener noreferrer" style="background-color: #2563eb; color: #ffffff; padding: 11px 20px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 13px; display: inline-block;">
      View Our Case Studies & Scope
    </a>
  </div>
  <p>Would you be open to a quick 10-minute chat this Thursday to see if this could be relevant for {{company}}?</p>
  <p>Best regards,<br><strong>Outreach Team</strong></p>
</div>`
    );
    setModalImageUrl('');
    setModalImageLinkUrl('');
    setModalImagePosition('top');
    setModalImageAlignment('center');
    setModalImageWidth('100%');
    setEditorTab('visual');
    setUploadSuccessMsg('');
    setShowEditorModal(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (tmpl: CustomTemplate) => {
    setEditingTemplateId(tmpl.id);
    setModalTitle(tmpl.name);
    setModalSubject(tmpl.subject);
    setModalBody(tmpl.body);
    setModalImageUrl(tmpl.imageUrl || '');
    setModalImageLinkUrl(tmpl.imageLinkUrl || '');
    setModalImagePosition(tmpl.imagePosition || 'top');
    setModalImageAlignment('center');
    setModalImageWidth('100%');
    setEditorTab('visual');
    setUploadSuccessMsg('');
    setShowEditorModal(true);
  };

  // Duplicate Template
  const handleDuplicate = (tmpl: CustomTemplate) => {
    saveCustomTemplate({
      name: `${tmpl.name} (Copy)`,
      subject: tmpl.subject,
      body: tmpl.body,
      imageUrl: tmpl.imageUrl,
      imageLinkUrl: tmpl.imageLinkUrl,
      imagePosition: tmpl.imagePosition,
    });
    refreshTemplates();
  };

  // Delete Template
  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete template "${name}"?`)) {
      deleteCustomTemplate(id);
      refreshTemplates();
    }
  };

  // Select Image File From PC for Editor
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (PNG, JPG, JPEG, WEBP, or GIF).');
      return;
    }

    setIsUploadingImage(true);
    setUploadSuccessMsg('');

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64Data = event.target?.result as string;
        try {
          const formData = new FormData();
          formData.append('file', file);
          const res = await fetch('/api/v1/templates/upload-image', {
            method: 'POST',
            body: formData,
          });
          const json = await res.json();
          if (json.success && json.url) {
            setModalImageUrl(json.url);
          } else {
            setModalImageUrl(base64Data);
          }
        } catch {
          setModalImageUrl(base64Data);
        }

        setIsUploadingImage(false);
        setUploadSuccessMsg(`"${file.name}" uploaded successfully from your PC!`);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      alert('Failed to read image file: ' + err.message);
      setIsUploadingImage(false);
    }
  };

  // Select Image File From PC for AI Generator
  const handleAiFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setAiImageUrl(base64);
    };
    reader.readAsDataURL(file);
  };

  // Insert Variable into Subject or Body
  const insertVariable = (tag: string, target: 'subject' | 'body') => {
    const variable = `{{${tag}}}`;
    if (target === 'subject') {
      setModalSubject((prev) => `${prev} ${variable}`);
    } else {
      setModalBody((prev) => `${prev}\n<p>Hey ${variable},</p>`);
    }
  };

  // Insert Text Link
  const handleInsertLink = () => {
    if (!customLinkUrl.trim()) {
      alert('Please provide a URL.');
      return;
    }
    const text = customLinkText.trim() || customLinkUrl.trim();
    const linkHtml = `<a href="${customLinkUrl.trim()}" target="_blank" rel="noopener noreferrer" style="color: #2563eb; text-decoration: underline; font-weight: 600;">${text}</a>`;
    setModalBody((prev) => `${prev} ${linkHtml}`);
    setShowInsertLinkModal(false);
    setCustomLinkText('');
    setCustomLinkUrl('');
  };

  // Insert CTA Button
  const handleInsertButton = () => {
    if (!customBtnUrl.trim()) {
      alert('Please provide a button URL.');
      return;
    }
    const text = customBtnText.trim() || 'Click Here';
    const btnHtml = `\n<div style="margin: 20px 0; text-align: left;">\n  <a href="${customBtnUrl.trim()}" target="_blank" rel="noopener noreferrer" style="background-color: #2563eb; color: #ffffff; padding: 11px 20px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 13px; display: inline-block;">\n    ${text}\n  </a>\n</div>\n`;
    setModalBody((prev) => `${prev}\n${btnHtml}`);
    setShowInsertButtonModal(false);
    setCustomBtnText('View Our Portfolio & Case Studies');
    setCustomBtnUrl('https://example.com/services');
  };

  // Construct Final HTML with Image & Clickable Link embedded
  const getCombinedHtml = () => {
    if (!modalImageUrl) return modalBody;

    const alignStyle =
      modalImageAlignment === 'center'
        ? 'margin: 0 auto; display: block;'
        : modalImageAlignment === 'right'
        ? 'margin-left: auto; display: block;'
        : 'margin-right: auto; display: block;';

    const imgElement = `<img src="${modalImageUrl}" alt="Campaign Graphic" style="max-width: ${modalImageWidth}; height: auto; border-radius: 8px; ${alignStyle} box-shadow: 0 2px 8px rgba(0,0,0,0.06); border: 0;" />`;

    const wrappedImg = modalImageLinkUrl.trim()
      ? `<a href="${modalImageLinkUrl.trim()}" target="_blank" rel="noopener noreferrer" style="text-decoration: none; display: inline-block;">\n  ${imgElement}\n</a>`
      : imgElement;

    const container = `<div style="text-align: ${modalImageAlignment}; margin: 16px 0;">\n  ${wrappedImg}\n</div>`;

    if (modalImagePosition === 'top') {
      return `${container}\n${modalBody}`;
    } else if (modalImagePosition === 'bottom') {
      return `${modalBody}\n${container}`;
    } else {
      // Middle
      const paragraphs = modalBody.split('</p>');
      if (paragraphs.length > 2) {
        const midpoint = Math.floor(paragraphs.length / 2);
        paragraphs.splice(midpoint, 0, container);
        return paragraphs.join('</p>');
      }
      return `${modalBody}\n${container}`;
    }
  };

  // Save Modal Changes
  const handleSaveModal = (andOpenCampaign = false) => {
    if (!modalTitle.trim()) {
      alert('Please provide a template title.');
      return;
    }
    if (!modalSubject.trim()) {
      alert('Please provide a subject line.');
      return;
    }

    const finalHtml = getCombinedHtml();
    const saved = saveCustomTemplate({
      id: editingTemplateId || undefined,
      name: modalTitle,
      subject: modalSubject,
      body: finalHtml,
      imageUrl: modalImageUrl || undefined,
      imageLinkUrl: modalImageLinkUrl.trim() || undefined,
      imagePosition: modalImagePosition,
    });

    setShowEditorModal(false);
    refreshTemplates();

    if (andOpenCampaign) {
      try {
        localStorage.setItem('erha_selected_template_id', saved.id);
      } catch {}
      router.push('/dashboard/campaigns');
    }
  };

  // AI Generator: Call API
  const handleGenerateTemplate = async () => {
    if (!aiPrompt.trim()) {
      setGenerationError('Please enter your template requirements or command.');
      return;
    }

    setIsGenerating(true);
    setGenerationError(null);

    try {
      const res = await fetch('/api/v1/templates/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: aiPrompt.trim(),
          tone: aiTone,
          ctaText: aiCtaText.trim() || undefined,
          ctaUrl: aiCtaUrl.trim() || undefined,
          imageUrl: aiImageUrl.trim() || undefined,
          imageLinkUrl: aiImageLinkUrl.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (data.success && data.template) {
        setGeneratedResult(data.template);
      } else {
        setGenerationError(data.error || 'Failed to generate template.');
      }
    } catch (err: any) {
      setGenerationError(err.message || 'Network error while generating template.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Apply Generated Result to Full Editor
  const handleOpenGeneratedInEditor = () => {
    if (!generatedResult) return;
    setEditingTemplateId(null);
    setModalTitle(generatedResult.name);
    setModalSubject(generatedResult.subject);
    setModalBody(generatedResult.body);
    setModalImageUrl(generatedResult.imageUrl || '');
    setModalImageLinkUrl(generatedResult.imageLinkUrl || '');
    setModalImagePosition('top');
    setModalImageAlignment('center');
    setModalImageWidth('100%');
    setEditorTab('visual');
    setUploadSuccessMsg('');
    setShowAiModal(false);
    setShowEditorModal(true);
  };

  // Directly Save Generated Result
  const handleSaveGeneratedDirectly = (andOpenCampaign = false) => {
    if (!generatedResult) return;
    const saved = saveCustomTemplate({
      name: generatedResult.name,
      subject: generatedResult.subject,
      body: generatedResult.body,
      imageUrl: generatedResult.imageUrl,
      imageLinkUrl: generatedResult.imageLinkUrl,
      imagePosition: 'top',
    });
    refreshTemplates();
    setShowAiModal(false);
    setGeneratedResult(null);
    setAiPrompt('');

    if (andOpenCampaign) {
      try {
        localStorage.setItem('erha_selected_template_id', saved.id);
      } catch {}
      router.push('/dashboard/campaigns');
    }
  };

  // Render HTML preview with simulated lead data
  const renderSimulatedPreview = (rawHtml: string, rawSubject: string) => {
    let previewHtml = rawHtml;
    let previewSubj = rawSubject;

    if (previewWithLead) {
      Object.entries(sampleLead).forEach(([key, val]) => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        previewHtml = previewHtml.replace(regex, val);
        previewSubj = previewSubj.replace(regex, val);
      });
    }

    return { previewHtml, previewSubj };
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <Header title="Email Templates" />

      {/* ========================================================= */}
      {/* HEADER SECTION - CLEAN MINIMAL THEME                     */}
      {/* ========================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 md:p-6 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0 shadow-2xs">
            <LayoutTemplate className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
                Email Templates
              </h1>
              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                {templates.length} Total
              </span>
              {templates.filter((t) => t.isCustom).length > 0 && (
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  {templates.filter((t) => t.isCustom).length} Custom
                </span>
              )}
              {templates.filter((t) => t.imageUrl || t.body.includes('<img')).length > 0 && (
                <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200 flex items-center gap-1">
                  <ImageIcon className="w-3 h-3 text-slate-500" />
                  {templates.filter((t) => t.imageUrl || t.body.includes('<img')).length} With Images
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500 mt-1">
              <span>
                {filteredTemplates.length === templates.length
                  ? `All ${templates.length} templates available for cold outreach`
                  : `Showing ${filteredTemplates.length} of ${templates.length} templates`}
              </span>
              <span className="text-slate-300 hidden sm:inline">•</span>
              <span className="text-slate-600 font-medium">Direct sync with Campaign Studio</span>
            </div>
          </div>
        </div>

        {/* Action Buttons: Generate from Prompt + Create Manually */}
        <div className="flex flex-wrap items-center gap-2 shrink-0 self-start sm:self-center">
          <button
            type="button"
            onClick={() => {
              setShowAiModal(true);
              setGenerationError(null);
            }}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Generate with Prompt</span>
          </button>

          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Template</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* SEARCH & FILTER BAR                                       */}
      {/* ========================================================= */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search templates by title, subject, or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all font-medium"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl overflow-x-auto shrink-0">
          {[
            { id: 'all', label: `All (${templates.length})` },
            { id: 'custom', label: `Custom (${templates.filter((t) => t.isCustom).length})` },
            { id: 'with-images', label: `With Images (${templates.filter((t) => t.imageUrl || t.body.includes('<img')).length})` },
            { id: 'preset', label: `Presets (${PRESET_TEMPLATES.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterCategory(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                filterCategory === tab.id
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ========================================================= */}
      {/* TEMPLATES GRID                                            */}
      {/* ========================================================= */}
      {filteredTemplates.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <LayoutTemplate className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">No templates found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {searchQuery
              ? `No templates matching "${searchQuery}". Clear your search or try a different term.`
              : 'You have not created any custom templates yet. Click below to generate one from a prompt or design manually!'}
          </p>
          <div className="flex items-center justify-center gap-2 pt-2">
            <button
              onClick={() => setShowAiModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>Generate with Prompt</span>
            </button>
            <button
              onClick={handleOpenCreateModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Template</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map((tmpl) => {
            const hasImage = tmpl.imageUrl || tmpl.body.includes('<img');

            return (
              <div
                key={tmpl.id}
                className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Top Bar: Badges & Quick Action Icons */}
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {tmpl.isCustom ? (
                        <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                          Custom
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                          Preset
                        </span>
                      )}

                      {hasImage && (
                        <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 flex items-center gap-1">
                          <ImageIcon className="w-3 h-3 text-slate-500" />
                          <span>Image Attached</span>
                        </span>
                      )}

                      {tmpl.imageLinkUrl && (
                        <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200 flex items-center gap-1">
                          <Link2 className="w-3 h-3 text-blue-600" />
                          <span>Clickable Image</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleDuplicate(tmpl)}
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                        title="Duplicate template"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(tmpl)}
                        className="p-1 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        title="Edit template"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      {tmpl.isCustom && (
                        <button
                          type="button"
                          onClick={() => handleDelete(tmpl.id, tmpl.name)}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete template"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Template Title */}
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                    {tmpl.name}
                  </h3>

                  {/* Subject Line */}
                  <div className="mt-1.5 text-xs text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-100">
                    <span className="font-semibold text-slate-800">Subject: </span>
                    <span className="line-clamp-1">{tmpl.subject}</span>
                  </div>

                  {/* Embedded Image Thumbnail Preview */}
                  {tmpl.imageUrl && (
                    <div className="mt-2.5 h-24 w-full bg-slate-100 rounded-xl overflow-hidden border border-slate-200 flex items-center justify-center relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={tmpl.imageUrl}
                        alt={tmpl.name}
                        className="w-full h-full object-cover"
                      />
                      {tmpl.imageLinkUrl && (
                        <span className="absolute bottom-1 right-1 text-[9px] font-bold text-white bg-blue-600/90 px-1.5 py-0.5 rounded flex items-center gap-1 backdrop-blur-xs">
                          <Link2 className="w-2.5 h-2.5" />
                          Clickable
                        </span>
                      )}
                    </div>
                  )}

                  {/* Body Text Snippet */}
                  <div className="mt-2.5 text-xs text-slate-500 line-clamp-3 leading-relaxed">
                    {tmpl.body.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()}
                  </div>
                </div>

                {/* Card Footer: Action Buttons */}
                <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(tmpl)}
                    className="text-xs font-semibold text-slate-700 hover:text-blue-600 flex items-center gap-1 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Preview &amp; Edit</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      try {
                        localStorage.setItem('erha_selected_template_id', tmpl.id);
                      } catch {}
                      router.push('/dashboard/campaigns');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <span>Use in Campaign</span>
                    <Send className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================= */}
      {/* 1. AI PROMPT-TO-TEMPLATE MODAL (THEME-ALIGNED)            */}
      {/* ========================================================= */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/70">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center font-bold">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    AI Template Studio
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Type your requirements or command to automatically generate a complete outreach template.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowAiModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              {/* Command Input Area */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-900">
                    Template Requirements / Command:
                  </label>
                  <span className="text-[10px] text-slate-500">Plain text or instructions</span>
                </div>
                <textarea
                  rows={4}
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="e.g. Write a cold outreach email pitching custom software development to SaaS founders. Include a link to our case studies, an invitation for a 15-minute call, and a banner graphic."
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl p-3 text-xs text-slate-900 focus:outline-none transition-all leading-relaxed font-medium resize-none shadow-2xs"
                />

                {/* Quick Suggestion Pills */}
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  <span className="text-[10px] font-bold text-slate-400 mr-1">Quick Presets:</span>
                  {[
                    { label: 'B2B SaaS Pitch', text: 'Cold outreach email to SaaS founders highlighting our deliverability platform with a demo link and 15-min call button.' },
                    { label: 'Web Agency Case Study', text: 'Introductory outreach for website design and conversion rate optimization with a case study portfolio link.' },
                    { label: 'Gentle Follow-Up', text: 'Gentle, polite follow-up email floating a previously shared proposal to the top of their inbox with video walkthrough link.' },
                    { label: 'Real Estate Pitch', text: 'Commercial real estate investor outreach offering off-market high-yield property portfolio with downloadable brochure.' },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setAiPrompt(preset.text)}
                      className="text-[10px] font-semibold text-slate-600 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 border border-slate-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tone & Style Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-bold text-slate-900 mb-1">
                    Tone of Voice:
                  </label>
                  <select
                    value={aiTone}
                    onChange={(e) => setAiTone(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-semibold focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="professional">Professional &amp; Authoritative</option>
                    <option value="direct">Direct &amp; Concise (Under 75 words)</option>
                    <option value="friendly">Friendly &amp; Conversational</option>
                    <option value="value-first">Value-First &amp; Consultative</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-900 mb-1">
                    Call-to-Action Button Label:
                  </label>
                  <input
                    type="text"
                    value={aiCtaText}
                    onChange={(e) => setAiCtaText(e.target.value)}
                    placeholder="e.g. Schedule a 10-Minute Call"
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold focus:outline-none transition-all shadow-2xs"
                  />
                </div>
              </div>

              {/* Advanced Link & Clickable Image Options Toggle */}
              <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/50">
                <button
                  type="button"
                  onClick={() => setShowAdvancedAi(!showAdvancedAi)}
                  className="w-full flex items-center justify-between text-xs font-bold text-slate-800 cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <Link2 className="w-3.5 h-3.5 text-blue-600" />
                    <span>Links &amp; Clickable Image Settings</span>
                  </span>
                  <span className="text-[10px] text-blue-600 font-semibold">
                    {showAdvancedAi ? 'Hide Settings' : 'Configure Links & Image'}
                  </span>
                </button>

                {showAdvancedAi && (
                  <div className="mt-3 pt-3 border-t border-slate-200/80 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          CTA Button Destination URL:
                        </label>
                        <input
                          type="url"
                          value={aiCtaUrl}
                          onChange={(e) => setAiCtaUrl(e.target.value)}
                          placeholder="https://calendly.com/your-team"
                          className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Clickable Image Link (Opens when image clicked):
                        </label>
                        <input
                          type="url"
                          value={aiImageLinkUrl}
                          onChange={(e) => setAiImageLinkUrl(e.target.value)}
                          placeholder="https://yourwebsite.com/portfolio"
                          className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-bold text-slate-700">
                          Template Graphic / Image:
                        </label>
                        <button
                          type="button"
                          onClick={() => aiFileInputRef.current?.click()}
                          className="text-[10px] font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
                        >
                          Browse from PC...
                        </button>
                      </div>

                      <input
                        type="file"
                        ref={aiFileInputRef}
                        onChange={handleAiFileChange}
                        accept="image/*"
                        className="hidden"
                      />

                      <input
                        type="text"
                        value={aiImageUrl}
                        onChange={(e) => setAiImageUrl(e.target.value)}
                        placeholder="Paste image URL or browse from PC above"
                        className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Generate Action Button */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-slate-500">
                  Embeds <code>{`{{first_name}}`}</code>, <code>{`{{company}}`}</code>, and <code>{`{{website}}`}</code> automatically.
                </span>

                <button
                  type="button"
                  onClick={handleGenerateTemplate}
                  disabled={isGenerating || !aiPrompt.trim()}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Generating Template...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-white" />
                      <span>Generate Template</span>
                    </>
                  )}
                </button>
              </div>

              {/* Generation Error Alert */}
              {generationError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
                  {generationError}
                </div>
              )}

              {/* Generated Result Preview Section */}
              {generatedResult && (
                <div className="border border-blue-200 bg-blue-50/20 rounded-2xl p-4 sm:p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-blue-100 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md">
                          Generated Result
                        </span>
                        <h4 className="text-sm font-bold text-slate-900">{generatedResult.name}</h4>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">
                        <strong className="text-slate-800">Subject:</strong> {generatedResult.subject}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={handleOpenGeneratedInEditor}
                        className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-slate-600" />
                        <span>Customize in Editor</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSaveGeneratedDirectly(false)}
                        className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-xs"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Save Template</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSaveGeneratedDirectly(true)}
                        className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-xs"
                      >
                        <span>Use in Campaign</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Simulated Lead View for Generated Template */}
                  <div className="bg-white border border-slate-200 rounded-xl p-4">
                    <div className="text-xs font-semibold text-slate-400 pb-2 mb-3 border-b border-slate-100 flex items-center justify-between">
                      <span>Simulated Recipient Inbox</span>
                      <span className="font-mono text-[10px] text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded">
                        To: {sampleLead.email} ({sampleLead.name})
                      </span>
                    </div>

                    <div
                      className="prose prose-sm max-w-none text-slate-800 text-xs sm:text-sm leading-relaxed"
                      dangerouslySetInnerHTML={{
                        __html: renderSimulatedPreview(generatedResult.body, generatedResult.subject).previewHtml,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                Generated templates can be edited, saved, or launched in campaigns anytime.
              </span>
              <button
                type="button"
                onClick={() => setShowAiModal(false)}
                className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold cursor-pointer shadow-2xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. FULL TEMPLATE & IMAGE STUDIO MODAL (EDIT & DESIGN)     */}
      {/* ========================================================= */}
      {showEditorModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/70">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center font-bold text-xs">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {editingTemplateId ? 'Edit Outreach Template' : 'Design New Template'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Add clickable images, custom buttons, links, and personalization variables.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowEditorModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Template Title */}
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1">
                  Template Title (Internal Name):
                </label>
                <input
                  type="text"
                  placeholder="e.g. B2B Outreach with Header Banner"
                  value={modalTitle}
                  onChange={(e) => setModalTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold focus:outline-none transition-all shadow-2xs"
                />
              </div>

              {/* Subject Line & Dynamic Variable Chips */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-900">
                    Subject Line:
                  </label>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-slate-500 font-medium">Add tag:</span>
                    {['first_name', 'company', 'website', 'phone'].map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => insertVariable(tag, 'subject')}
                        className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition-colors cursor-pointer"
                        title={`Insert {{${tag}}} tag`}
                      >
                        +{`{{${tag}}}`}
                      </button>
                    ))}
                  </div>
                </div>
                <input
                  type="text"
                  placeholder="e.g. Quick idea for {{company}}'s outbound growth"
                  value={modalSubject}
                  onChange={(e) => setModalSubject(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold focus:outline-none transition-all shadow-2xs"
                />
              </div>

              {/* ========================================================= */}
              {/* PC IMAGE UPLOAD ZONE & CLICKABLE DESTINATION LINK         */}
              {/* ========================================================= */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
                      <Upload className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        Upload Picture from PC / Laptop
                        <span className="text-[10px] font-semibold text-slate-600 bg-slate-200 px-1.5 py-0.2 rounded">
                          Direct Computer File
                        </span>
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Select any PNG, JPG, or GIF from your computer to embed in the email.
                      </p>
                    </div>
                  </div>

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingImage}
                    className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0 disabled:opacity-50"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isUploadingImage ? 'Reading Image...' : 'Browse PC File...'}</span>
                  </button>
                </div>

                {/* Upload Success Alert */}
                {uploadSuccessMsg && (
                  <div className="flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{uploadSuccessMsg}</span>
                  </div>
                )}

                {/* Attached Image Controls (If image selected) */}
                {modalImageUrl && (
                  <div className="bg-white border border-slate-200 rounded-xl p-3 space-y-3 shadow-2xs">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-12 bg-slate-100 rounded-lg overflow-hidden border border-slate-200 shrink-0 relative">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={modalImageUrl}
                            alt="Uploaded graphic"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                            <span>Image Attached to Email</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                            <span>Position: <strong>{modalImagePosition}</strong></span>
                            <span>•</span>
                            <span>Width: <strong>{modalImageWidth}</strong></span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {/* Position Picker */}
                        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-[10px] font-bold">
                          <button
                            type="button"
                            onClick={() => setModalImagePosition('top')}
                            className={`px-2 py-1 rounded-md transition-all ${
                              modalImagePosition === 'top'
                                ? 'bg-blue-600 text-white shadow-2xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            Top Banner
                          </button>
                          <button
                            type="button"
                            onClick={() => setModalImagePosition('middle')}
                            className={`px-2 py-1 rounded-md transition-all ${
                              modalImagePosition === 'middle'
                                ? 'bg-blue-600 text-white shadow-2xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            In Body
                          </button>
                          <button
                            type="button"
                            onClick={() => setModalImagePosition('bottom')}
                            className={`px-2 py-1 rounded-md transition-all ${
                              modalImagePosition === 'bottom'
                                ? 'bg-blue-600 text-white shadow-2xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            Bottom Flyer
                          </button>
                        </div>

                        {/* Width Picker */}
                        <select
                          value={modalImageWidth}
                          onChange={(e) => setModalImageWidth(e.target.value as any)}
                          className="bg-slate-100 border border-slate-200 text-slate-800 text-[10px] font-bold rounded-lg px-2 py-1 focus:outline-none cursor-pointer"
                        >
                          <option value="100%">100% Full Width</option>
                          <option value="75%">75% Large</option>
                          <option value="50%">50% Medium</option>
                          <option value="300px">300px Compact</option>
                        </select>

                        {/* Remove Image Button */}
                        <button
                          type="button"
                          onClick={() => {
                            setModalImageUrl('');
                            setModalImageLinkUrl('');
                            setUploadSuccessMsg('');
                          }}
                          className="text-xs font-semibold text-rose-600 hover:text-rose-800 p-1 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Remove image from template"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Clickable Destination Link input for Image */}
                    <div className="pt-2.5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 shrink-0">
                        <Link2 className="w-3.5 h-3.5 text-blue-600" />
                        <span>Clickable Image Destination URL:</span>
                      </div>
                      <input
                        type="url"
                        placeholder="https://yourwebsite.com/portfolio (Opens when user clicks picture)"
                        value={modalImageLinkUrl}
                        onChange={(e) => setModalImageLinkUrl(e.target.value)}
                        className="flex-1 bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-lg px-2.5 py-1 text-xs text-slate-900 font-medium focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* ========================================================= */}
              {/* QUICK INSERT TOOLS (LINK, BUTTON, VARIABLES)              */}
              {/* ========================================================= */}
              <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl">
                <div className="flex items-center gap-1 flex-wrap">
                  <span className="text-[11px] font-bold text-slate-700 mr-1">Insert Tools:</span>

                  <button
                    type="button"
                    onClick={() => setShowInsertLinkModal(true)}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-700 hover:text-blue-700 bg-white hover:bg-blue-50 border border-slate-200 transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                  >
                    <Link2 className="w-3 h-3 text-blue-600" />
                    <span>Insert Link</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowInsertButtonModal(true)}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-700 hover:text-blue-700 bg-white hover:bg-blue-50 border border-slate-200 transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                  >
                    <MousePointerClick className="w-3 h-3 text-blue-600" />
                    <span>Insert CTA Button</span>
                  </button>
                </div>

                <div className="flex items-center gap-1 flex-wrap">
                  <span className="text-[10px] text-slate-400 font-medium">Tags:</span>
                  {['first_name', 'company', 'website'].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setModalBody((prev) => `${prev} {{${tag}}}`)}
                      className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
                      title={`Insert {{${tag}}} tag`}
                    >
                      +{`{{${tag}}}`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Editor Tabs: Visual Preview vs HTML Code */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-50 border-b border-slate-200">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setEditorTab('visual')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        editorTab === 'visual'
                          ? 'bg-white text-blue-600 shadow-2xs border border-slate-200'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Live Visual Preview</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditorTab('code')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        editorTab === 'code'
                          ? 'bg-white text-blue-600 shadow-2xs border border-slate-200'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Code2 className="w-3.5 h-3.5" />
                      <span>HTML Source Code</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={previewWithLead}
                        onChange={(e) => setPreviewWithLead(e.target.checked)}
                        className="w-3.5 h-3.5 rounded text-blue-600 bg-white border-slate-300 focus:ring-blue-500"
                      />
                      <span>Sample Lead Fill</span>
                    </label>
                  </div>
                </div>

                {/* Editor Content Area */}
                {editorTab === 'code' ? (
                  <div className="p-3">
                    <textarea
                      rows={12}
                      value={modalBody}
                      onChange={(e) => setModalBody(e.target.value)}
                      className="w-full font-mono text-xs text-slate-800 bg-slate-900/5 p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 leading-relaxed resize-y"
                      placeholder="Write your email HTML code here..."
                    />
                  </div>
                ) : (
                  <div className="p-4 sm:p-5 bg-white min-h-[220px]">
                    <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/50 shadow-inner">
                      <div className="text-xs font-semibold text-slate-400 pb-2 mb-3 border-b border-slate-200 flex items-center justify-between">
                        <span>Recipient Inbox Simulation</span>
                        <span className="font-mono text-[10px] text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded">
                          To: {sampleLead.email}
                        </span>
                      </div>

                      {/* Rendered Live HTML */}
                      <div
                        className="prose prose-sm max-w-none text-slate-800 text-xs sm:text-sm leading-relaxed"
                        dangerouslySetInnerHTML={{
                          __html: renderSimulatedPreview(getCombinedHtml(), modalSubject).previewHtml,
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-t border-slate-100 bg-slate-50/70">
              <span className="text-[11px] text-slate-500">
                Templates auto-sync across Campaigns and Cold Outreach Dispatcher.
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditorModal(false)}
                  className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold transition-all shadow-2xs cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={() => handleSaveModal(false)}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save Template</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSaveModal(true)}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Save &amp; Use in Campaign</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. QUICK INSERT LINK MODAL                                */}
      {/* ========================================================= */}
      {showInsertLinkModal && (
        <div className="fixed inset-0 z-60 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Link2 className="w-4 h-4 text-blue-600" />
                <span>Insert Hyperlink</span>
              </h4>
              <button
                type="button"
                onClick={() => setShowInsertLinkModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Anchor Text (Words that will be clicked):
                </label>
                <input
                  type="text"
                  placeholder="e.g. View Our Portfolio"
                  value={customLinkText}
                  onChange={(e) => setCustomLinkText(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Destination URL:
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/portfolio"
                  value={customLinkUrl}
                  onChange={(e) => setCustomLinkUrl(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowInsertLinkModal(false)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleInsertLink}
                className="px-4 py-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-xs"
              >
                Insert Link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. QUICK INSERT CTA BUTTON MODAL                          */}
      {/* ========================================================= */}
      {showInsertButtonModal && (
        <div className="fixed inset-0 z-60 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <MousePointerClick className="w-4 h-4 text-blue-600" />
                <span>Insert Call-to-Action Button</span>
              </h4>
              <button
                type="button"
                onClick={() => setShowInsertButtonModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Button Label Text:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Schedule a 10-Minute Call"
                  value={customBtnText}
                  onChange={(e) => setCustomBtnText(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Button Destination Link (URL):
                </label>
                <input
                  type="url"
                  placeholder="https://calendly.com/your-team"
                  value={customBtnUrl}
                  onChange={(e) => setCustomBtnUrl(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowInsertButtonModal(false)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleInsertButton}
                className="px-4 py-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-xs"
              >
                Insert Button
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
