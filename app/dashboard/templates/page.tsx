'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  LayoutTemplate,
  Plus,
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
  Info,
  Link2,
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
  const [aiImageUrl, setAiImageUrl] = useState('');
  const [aiImageLinkUrl, setAiImageLinkUrl] = useState('');
  const [isUploadingAiImage, setIsUploadingAiImage] = useState(false);
  const [aiButtonText, setAiButtonText] = useState('');
  const [aiButtonUrl, setAiButtonUrl] = useState('');
  const [showAdvancedAi, setShowAdvancedAi] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [generatedResult, setGeneratedResult] = useState<{
    name: string;
    subject: string;
    body: string;
    imageUrl?: string;
    imageLinkUrl?: string;
    buttonText?: string;
    buttonUrl?: string;
  } | null>(null);

  // Quick Insert Modals (Text Link & Custom Action Button)
  const [showInsertLinkModal, setShowInsertLinkModal] = useState(false);
  const [customLinkText, setCustomLinkText] = useState('');
  const [customLinkUrl, setCustomLinkUrl] = useState('');

  const [showInsertButtonModal, setShowInsertButtonModal] = useState(false);
  const [customButtonText, setCustomButtonText] = useState('');
  const [customButtonUrl, setCustomButtonUrl] = useState('');

  // Interactive Visual Editor Refs (contentEditable direct editing)
  const visualEditorRef = useRef<HTMLDivElement>(null);
  const aiPreviewRef = useRef<HTMLDivElement>(null);

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

  // Sync modalBody to visual editor on modal open or tab switch
  useEffect(() => {
    if (showEditorModal && editorTab === 'visual' && visualEditorRef.current) {
      if (visualEditorRef.current.innerHTML !== modalBody) {
        visualEditorRef.current.innerHTML = modalBody;
      }
    }
  }, [showEditorModal, editorTab, editingTemplateId]);

  // Sync generatedResult to AI preview on generation
  useEffect(() => {
    if (showAiModal && generatedResult && aiPreviewRef.current) {
      if (aiPreviewRef.current.innerHTML !== generatedResult.body) {
        aiPreviewRef.current.innerHTML = generatedResult.body;
      }
    }
  }, [showAiModal, generatedResult?.name, generatedResult?.subject]);

  const handleVisualEditorInput = (e: React.FormEvent<HTMLDivElement>) => {
    const html = e.currentTarget.innerHTML;
    setModalBody(html);
  };

  const handleAiPreviewInput = (e: React.FormEvent<HTMLDivElement>) => {
    const html = e.currentTarget.innerHTML;
    setGeneratedResult((prev) => (prev ? { ...prev, body: html } : null));
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
      `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #0f172a; width: 100%; max-width: 580px; line-height: 1.55; font-size: 13.5px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px 16px; box-sizing: border-box;">
  <p style="font-size: 14.5px; font-weight: 600; color: #0f172a; margin: 0 0 10px 0;">Hi {{first_name}},</p>
  <p style="color: #334155; margin: 0 0 12px 0;">I came across {{company}} and really liked what your team is building.</p>
  <p style="color: #334155; margin: 0 0 12px 0;">We help growing companies scale their outbound sales pipeline and optimize conversion rates efficiently.</p>
  <p style="color: #334155; margin: 0 0 14px 0;">Would you be open to a quick 10-minute chat this Thursday to see if this could be relevant for {{company}}?</p>
  <p style="color: #334155; margin: 16px 0 0 0;">Best regards,<br><strong style="color: #0f172a;">Outreach Lead</strong></p>
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

  // Select Image File From PC for AI Generator (Instant Visual Display & Upload)
  const handleAiFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (PNG, JPG, JPEG, WEBP, or GIF).');
      return;
    }

    setIsUploadingAiImage(true);

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64Data = event.target?.result as string;
        // Instantly display the image in the UI card
        setAiImageUrl(base64Data);

        try {
          const formData = new FormData();
          formData.append('file', file);
          const res = await fetch('/api/v1/templates/upload-image', {
            method: 'POST',
            body: formData,
          });
          const json = await res.json();
          if (json.success && json.url) {
            setAiImageUrl(json.url);
          }
        } catch {
          // Keep base64Data on fallback
        } finally {
          setIsUploadingAiImage(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      alert('Failed to read image file: ' + err.message);
      setIsUploadingAiImage(false);
    }
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

  // Insert Text Link (Supports direct cursor insertion in visual editor)
  const handleInsertLink = () => {
    if (!customLinkUrl.trim()) {
      alert('Please provide a URL.');
      return;
    }
    const text = customLinkText.trim() || customLinkUrl.trim();
    const linkHtml = `<a href="${customLinkUrl.trim()}" target="_blank" rel="noopener noreferrer" style="color: #2563eb; text-decoration: underline; font-weight: 600;">${text}</a>`;
    if (editorTab === 'visual' && visualEditorRef.current) {
      visualEditorRef.current.focus();
      document.execCommand('insertHTML', false, linkHtml);
      setModalBody(visualEditorRef.current.innerHTML);
    } else {
      setModalBody((prev) => `${prev} ${linkHtml}`);
    }
    setShowInsertLinkModal(false);
    setCustomLinkText('');
    setCustomLinkUrl('');
  };

  // Insert Custom Action Button (e.g. "Our Services", "Book a Demo") into Visual Editor
  const handleInsertCustomButton = () => {
    const text = customButtonText.trim() || 'Our Services';
    const url = customButtonUrl.trim() || '#';
    const buttonHtml = `<div style="margin: 16px 0; text-align: center;"><a href="${url}" target="_blank" rel="noopener noreferrer" style="background-color: #2563eb; color: #ffffff; padding: 10px 22px; border-radius: 8px; font-weight: 700; font-size: 13.5px; text-decoration: none; display: inline-block; box-shadow: 0 2px 4px rgba(37, 99, 235, 0.25);">${text} &rarr;</a></div>`;

    if (editorTab === 'visual' && visualEditorRef.current) {
      visualEditorRef.current.focus();
      document.execCommand('insertHTML', false, buttonHtml);
      setModalBody(visualEditorRef.current.innerHTML);
    } else {
      setModalBody((prev) => `${prev}\n${buttonHtml}`);
    }
    setShowInsertButtonModal(false);
    setCustomButtonText('');
    setCustomButtonUrl('');
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
          imageUrl: aiImageUrl.trim() || undefined,
          imageLinkUrl: aiImageLinkUrl.trim() || undefined,
          buttonText: aiButtonText.trim() || undefined,
          buttonUrl: aiButtonUrl.trim() || undefined,
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
    // Body already has structured layout and image embedded inside the card
    setModalImageUrl('');
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
    setAiImageUrl('');
    setAiImageLinkUrl('');
    setAiButtonText('');
    setAiButtonUrl('');

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
    <div className="space-y-3.5 sm:space-y-4 max-w-7xl mx-auto pb-8 sm:pb-12">
      <Header title="Email Templates" />

      {/* ========================================================= */}
      {/* HEADER SECTION - FULLY RESPONSIVE & COMPACT THEME        */}
      {/* ========================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200 rounded-2xl p-3 sm:p-4 md:p-5 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0 shadow-2xs">
            <LayoutTemplate className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <h1 className="text-base sm:text-lg md:text-xl font-bold text-slate-900 tracking-tight">
                Email Templates
              </h1>
              <span className="text-[11px] sm:text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                {templates.length} Total
              </span>
              {templates.filter((t) => t.isCustom).length > 0 && (
                <span className="text-[11px] sm:text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  {templates.filter((t) => t.isCustom).length} Custom
                </span>
              )}
              {templates.filter((t) => t.imageUrl || t.body.includes('<img')).length > 0 && (
                <span className="text-[11px] sm:text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200 flex items-center gap-1">
                  <ImageIcon className="w-3 h-3 text-slate-500" />
                  {templates.filter((t) => t.imageUrl || t.body.includes('<img')).length} Images
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons: Generate from Prompt + Create Manually (Grid on Mobile, Flex on Desktop) */}
        <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full sm:w-auto shrink-0">
          <button
            type="button"
            onClick={() => {
              setShowAiModal(true);
              setGenerationError(null);
            }}
            className="w-full sm:w-auto px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer text-center"
          >
            <span className="truncate">AI Prompt</span>
          </button>

          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="w-full sm:w-auto px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer text-center"
          >
            <Plus className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">New Template</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* SEARCH & FILTER BAR                                       */}
      {/* ========================================================= */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 bg-white border border-slate-200 rounded-2xl p-2.5 sm:p-3 shadow-xs">
        {/* Search Input */}
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search templates by title, subject, or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3.5 pr-8 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all font-medium"
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
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl overflow-x-auto shrink-0 scrollbar-none">
          {[
            { id: 'all', label: `All (${templates.length})` },
            { id: 'custom', label: `Custom (${templates.filter((t) => t.isCustom).length})` },
            { id: 'with-images', label: `Images (${templates.filter((t) => t.imageUrl || t.body.includes('<img')).length})` },
            { id: 'preset', label: `Presets (${PRESET_TEMPLATES.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterCategory(tab.id as any)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {filteredTemplates.map((tmpl) => {
            const hasImage = tmpl.imageUrl || tmpl.body.includes('<img');

            return (
              <div
                key={tmpl.id}
                className="bg-white border border-slate-200 rounded-2xl p-3.5 sm:p-4 shadow-xs hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Top Bar: Badges & Quick Action Icons */}
                  <div className="flex items-center justify-between gap-1.5 mb-2">
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
                        <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded-md border border-slate-200 flex items-center gap-1">
                          <ImageIcon className="w-2.5 h-2.5 text-slate-500" />
                          <span>Image</span>
                        </span>
                      )}

                      {tmpl.imageLinkUrl && (
                        <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded-md border border-blue-200 flex items-center gap-1">
                          <Link2 className="w-2.5 h-2.5 text-blue-600" />
                          <span>Link</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-0.5 shrink-0">
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
                  <div className="mt-1.5 text-xs text-slate-600 bg-slate-50 p-1.5 sm:p-2 rounded-xl border border-slate-100">
                    <span className="font-semibold text-slate-800">Subject: </span>
                    <span className="line-clamp-1">{tmpl.subject}</span>
                  </div>

                  {/* Embedded Image Thumbnail Preview */}
                  {tmpl.imageUrl && (
                    <div className="mt-2 h-20 sm:h-24 w-full bg-slate-100 rounded-xl overflow-hidden border border-slate-200 flex items-center justify-center relative">
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
                  <div className="mt-2 text-xs text-slate-500 line-clamp-2 sm:line-clamp-3 leading-relaxed">
                    {tmpl.body.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()}
                  </div>
                </div>

                {/* Card Footer: Action Buttons */}
                <div className="pt-2.5 mt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
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
                    className="px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
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
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-2.5 sm:p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-3xl sm:max-w-4xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-4 py-3 sm:px-5 sm:py-3.5 border-b border-slate-100 bg-slate-50/70 shrink-0">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  AI Template Studio
                </h3>
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
            <div className="p-3.5 sm:p-5 space-y-3 sm:space-y-3.5 overflow-y-auto flex-1">
              {/* Command Input Area */}
              <div>
                <div className="mb-1">
                  <label className="text-xs font-bold text-slate-900">
                    Template Requirements / Command:
                  </label>
                </div>
                <textarea
                  rows={3}
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="e.g. Write a cold outreach email pitching custom software development to SaaS founders. Include a link to our case studies, an invitation for a 15-minute call, and a banner graphic."
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none transition-all leading-relaxed font-medium resize-none shadow-2xs"
                />

                {/* Quick Suggestion Pills */}
                <div className="flex flex-wrap items-center gap-1 mt-1.5">
                  <span className="text-[10px] font-bold text-slate-400 mr-0.5">Quick Presets:</span>
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
                      className="text-[10px] font-semibold text-slate-600 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 border border-slate-200 px-2 py-0.5 rounded-md transition-colors cursor-pointer"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tone of Voice */}
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1">
                  Tone of Voice:
                </label>
                <select
                  value={aiTone}
                  onChange={(e) => setAiTone(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 font-semibold focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="professional">Professional &amp; Authoritative</option>
                  <option value="direct">Direct &amp; Concise (Under 75 words)</option>
                  <option value="friendly">Friendly &amp; Conversational</option>
                  <option value="value-first">Value-First &amp; Consultative</option>
                </select>
              </div>

              {/* Clickable Image & Custom Action Button Settings */}
              <div className="border border-slate-200 rounded-xl p-2.5 sm:p-3 bg-slate-50/50">
                <button
                  type="button"
                  onClick={() => setShowAdvancedAi(!showAdvancedAi)}
                  className="w-full flex items-center justify-between text-xs font-bold text-slate-800 cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
                    <span>Clickable Image &amp; Custom Action Button</span>
                  </span>
                  <span className="text-[10px] text-blue-600 font-semibold flex items-center gap-1">
                    {(aiImageUrl || aiButtonText.trim()) && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                    )}
                    {showAdvancedAi
                      ? 'Hide Settings'
                      : (aiImageUrl || aiButtonText.trim())
                      ? 'Configured'
                      : 'Add Image or Button'}
                  </span>
                </button>

                {showAdvancedAi && (
                  <div className="mt-2.5 pt-2.5 border-t border-slate-200/80 space-y-3">
                    {/* 1. Clickable Image Destination Link */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Clickable Image Link (Opens when image clicked):
                      </label>
                      <input
                        type="url"
                        value={aiImageLinkUrl}
                        onChange={(e) => setAiImageLinkUrl(e.target.value)}
                        placeholder="https://yourwebsite.com/portfolio (e.g. Portfolio or case study)"
                        className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:outline-none"
                      />
                    </div>

                    {/* 2. Image Selector & Live Preview Card */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-bold text-slate-700">
                          Template Graphic / Image:
                        </label>
                        {!aiImageUrl && (
                          <button
                            type="button"
                            onClick={() => aiFileInputRef.current?.click()}
                            disabled={isUploadingAiImage}
                            className="text-[10px] font-bold text-blue-600 hover:text-blue-800 cursor-pointer disabled:opacity-50"
                          >
                            {isUploadingAiImage ? 'Reading...' : 'Browse from PC...'}
                          </button>
                        )}
                      </div>

                      <input
                        type="file"
                        ref={aiFileInputRef}
                        onChange={handleAiFileChange}
                        accept="image/*"
                        className="hidden"
                      />

                      {aiImageUrl ? (
                        /* Live Image Preview Card showing the exact image! */
                        <div className="border border-slate-200 rounded-xl p-2.5 bg-white flex items-center justify-between gap-3 shadow-2xs">
                          <div className="flex items-center gap-2.5 overflow-hidden">
                            <div className="w-16 h-12 bg-slate-100 rounded-lg border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center relative">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={aiImageUrl}
                                alt="Selected Graphic"
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                                <span>Image Attached</span>
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                              </div>
                              <p className="text-[11px] text-slate-500 truncate">
                                {aiImageLinkUrl ? `Click link: ${aiImageLinkUrl}` : 'Image will be embedded in template'}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => aiFileInputRef.current?.click()}
                              disabled={isUploadingAiImage}
                              className="px-2.5 py-1 rounded-lg text-[10px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors cursor-pointer"
                            >
                              {isUploadingAiImage ? 'Reading...' : 'Change'}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setAiImageUrl('');
                                if (aiFileInputRef.current) aiFileInputRef.current.value = '';
                              }}
                              className="p-1 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Remove image"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={aiImageUrl}
                            onChange={(e) => setAiImageUrl(e.target.value)}
                            placeholder="Paste image URL or browse from PC..."
                            className="flex-1 bg-white border border-slate-200 focus:border-blue-500 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => aiFileInputRef.current?.click()}
                            disabled={isUploadingAiImage}
                            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0 disabled:opacity-50"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>{isUploadingAiImage ? 'Reading...' : 'Browse PC...'}</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* 3. Custom Action Button (e.g. "Our Services", "Book Demo") */}
                    <div className="pt-2.5 border-t border-slate-200/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                          <Sliders className="w-3.5 h-3.5 text-blue-600" />
                          <span>Custom Action Button (Optional):</span>
                        </label>
                        {aiButtonText.trim() && (
                          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            Button Active
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                            Button Text (Label):
                          </label>
                          <input
                            type="text"
                            value={aiButtonText}
                            onChange={(e) => setAiButtonText(e.target.value)}
                            placeholder="e.g. Our Services, Book a Demo, View Pricing"
                            className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">
                            Button Destination URL (Link):
                          </label>
                          <input
                            type="url"
                            value={aiButtonUrl}
                            onChange={(e) => setAiButtonUrl(e.target.value)}
                            placeholder="https://yourwebsite.com/services"
                            className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Live Button Preview */}
                      {aiButtonText.trim() && (
                        <div className="bg-slate-100/80 border border-slate-200 rounded-lg p-2 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-slate-500 font-semibold">Button Preview:</span>
                            <span className="inline-block px-3 py-1 bg-blue-600 text-white font-bold text-[11px] rounded-md shadow-2xs">
                              {aiButtonText.trim()} &rarr;
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setAiButtonText('');
                              setAiButtonUrl('');
                            }}
                            className="text-[10px] text-rose-500 hover:text-rose-700 font-semibold cursor-pointer"
                          >
                            Clear Button
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Generate Action Button */}
              <div className="flex items-center justify-end pt-0.5">
                <button
                  type="button"
                  onClick={handleGenerateTemplate}
                  disabled={isGenerating || !aiPrompt.trim()}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-center"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Generating Executive Template...</span>
                    </>
                  ) : (
                    <span>Generate Template</span>
                  )}
                </button>
              </div>

              {/* Generation Error Alert */}
              {generationError && (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
                  {generationError}
                </div>
              )}

              {/* Generated Result Preview Section */}
              {generatedResult && (
                <div className="border border-blue-200 bg-blue-50/20 rounded-2xl p-3 sm:p-4 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-blue-100 pb-2.5">
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

                    <div className="grid grid-cols-1 sm:flex sm:items-center gap-1.5 w-full sm:w-auto shrink-0">
                      <button
                        type="button"
                        onClick={handleOpenGeneratedInEditor}
                        className="w-full sm:w-auto px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1 shadow-2xs text-center"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-slate-600" />
                        <span>Customize in Editor</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSaveGeneratedDirectly(false)}
                        className="w-full sm:w-auto px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 shadow-xs text-center"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Save Template</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSaveGeneratedDirectly(true)}
                        className="w-full sm:w-auto px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 shadow-xs text-center"
                      >
                        <span>Use in Campaign</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Clickable Live Preview for Generated Template */}
                  <div className="bg-white border border-slate-200 rounded-xl p-2.5 sm:p-3">
                    <div className="text-[11px] sm:text-xs font-semibold text-slate-400 pb-1.5 mb-2 border-b border-slate-100 flex items-center justify-between">
                      <span>Clickable Preview (Click text to edit)</span>
                      <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium border border-emerald-200">
                        Editing Active
                      </span>
                    </div>

                    <div
                      ref={aiPreviewRef}
                      contentEditable
                      suppressContentEditableWarning
                      onInput={handleAiPreviewInput}
                      className="overflow-x-auto text-slate-800 text-xs sm:text-sm leading-relaxed outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 rounded-lg p-1.5 min-h-[180px] sm:min-h-[220px] cursor-text bg-white"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-4 py-2.5 sm:px-5 sm:py-3 border-t border-slate-100 bg-slate-50/70 flex items-center justify-end shrink-0">
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
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-3xl sm:max-w-4xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-4 py-3 sm:px-5 sm:py-3.5 border-b border-slate-100 bg-slate-50/70 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center font-bold text-xs">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">
                    {editingTemplateId ? 'Edit Outreach Template' : 'Design New Template'}
                  </h3>
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
            <div className="p-3 sm:p-4.5 space-y-2.5 sm:space-y-3 overflow-y-auto flex-1">
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
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 font-semibold focus:outline-none transition-all shadow-2xs"
                />
              </div>

              {/* Subject Line */}
              <div>
                <div className="mb-1">
                  <label className="text-xs font-bold text-slate-900">
                    Subject Line:
                  </label>
                </div>
                <input
                  type="text"
                  placeholder="e.g. Quick idea for {{company}}'s outbound growth"
                  value={modalSubject}
                  onChange={(e) => setModalSubject(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl px-2.5 py-1.5 text-xs text-slate-900 font-semibold focus:outline-none transition-all shadow-2xs"
                />
              </div>

              {/* ========================================================= */}
              {/* PC IMAGE UPLOAD ZONE & CLICKABLE DESTINATION LINK         */}
              {/* ========================================================= */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 sm:p-3 space-y-2.5">
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
                    className="w-full sm:w-auto px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer shrink-0 disabled:opacity-50 text-center"
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
                  <div className="bg-white border border-slate-200 rounded-xl p-2.5 sm:p-3 space-y-2.5 shadow-2xs">
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
              {/* CLICKABLE FORMATTING TOOLBAR                              */}
              {/* ========================================================= */}
              <div className="flex flex-wrap items-center justify-between gap-1.5 sm:gap-2 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-xl">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] font-bold text-slate-700 mr-1">Format:</span>

                  <button
                    type="button"
                    onClick={() => document.execCommand('bold')}
                    className="w-7 h-7 rounded-lg text-xs font-bold text-slate-700 hover:text-blue-700 bg-white hover:bg-blue-50 border border-slate-200 transition-colors flex items-center justify-center cursor-pointer shadow-2xs"
                    title="Bold"
                  >
                    B
                  </button>

                  <button
                    type="button"
                    onClick={() => document.execCommand('italic')}
                    className="w-7 h-7 rounded-lg text-xs font-serif italic text-slate-700 hover:text-blue-700 bg-white hover:bg-blue-50 border border-slate-200 transition-colors flex items-center justify-center cursor-pointer shadow-2xs"
                    title="Italic"
                  >
                    I
                  </button>

                  <button
                    type="button"
                    onClick={() => document.execCommand('underline')}
                    className="w-7 h-7 rounded-lg text-xs underline text-slate-700 hover:text-blue-700 bg-white hover:bg-blue-50 border border-slate-200 transition-colors flex items-center justify-center cursor-pointer shadow-2xs"
                    title="Underline"
                  >
                    U
                  </button>

                  <div className="h-4 w-px bg-slate-200 mx-1" />

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
                    onClick={() => {
                      setCustomButtonText('Our Services');
                      setCustomButtonUrl('https://');
                      setShowInsertButtonModal(true);
                    }}
                    className="px-2.5 py-1 rounded-lg text-xs font-bold text-blue-700 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                    title="Insert Custom Action Button into template"
                  >
                    <ExternalLink className="w-3 h-3 text-blue-600" />
                    <span>Insert Button</span>
                  </button>
                </div>

                <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 sm:px-2.5 py-1 rounded-lg font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="hidden sm:inline">Clickable Visual Editing Active (Click text to edit)</span>
                  <span className="sm:hidden">Click to edit</span>
                </div>
              </div>

              {/* Editor Tabs: Visual Editor vs HTML Code */}
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
                      <span>Clickable Visual Editor</span>
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
                </div>

                {/* Editor Content Area */}
                {editorTab === 'code' ? (
                  <div className="p-3">
                    <textarea
                      rows={10}
                      value={modalBody}
                      onChange={(e) => setModalBody(e.target.value)}
                      className="w-full font-mono text-xs text-slate-800 bg-slate-900/5 p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 leading-relaxed resize-y"
                      placeholder="Write your email HTML code here..."
                    />
                  </div>
                ) : (
                  <div className="p-2 sm:p-3 bg-white min-h-[240px]">
                    <div className="border border-slate-200 rounded-xl p-2 sm:p-2.5 bg-slate-50/50">
                      <div className="text-[11px] sm:text-xs font-semibold text-slate-400 pb-1.5 mb-2 border-b border-slate-200 flex items-center justify-between">
                        <span>Interactive Email Canvas (Click text to edit directly)</span>
                        <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium border border-emerald-200">
                          Direct Clickable Editing
                        </span>
                      </div>

                      {/* Directly Clickable and Editable Visual Canvas */}
                      <div
                        ref={visualEditorRef}
                        contentEditable
                        suppressContentEditableWarning
                        onInput={handleVisualEditorInput}
                        className="overflow-x-auto text-slate-800 text-xs sm:text-sm leading-relaxed outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 rounded-lg p-1.5 sm:p-2 min-h-[220px] sm:min-h-[260px] cursor-text bg-white"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 px-3.5 py-2.5 sm:px-5 sm:py-3 border-t border-slate-100 bg-slate-50/70 shrink-0">
              <button
                type="button"
                onClick={() => setShowEditorModal(false)}
                className="w-full sm:w-auto px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold transition-all shadow-2xs cursor-pointer text-center"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => handleSaveModal(false)}
                className="w-full sm:w-auto px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer text-center"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Save Template</span>
              </button>

              <button
                type="button"
                onClick={() => handleSaveModal(true)}
                className="w-full sm:w-auto px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer text-center"
              >
                <span>Save &amp; Use in Campaign</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. QUICK INSERT LINK MODAL                                */}
      {/* ========================================================= */}
      {showInsertLinkModal && (
        <div className="fixed inset-0 z-60 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-sm sm:max-w-md p-4 sm:p-5 shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Link2 className="w-4 h-4 text-blue-600" />
                <span>Insert Hyperlink</span>
              </h4>
              <button
                type="button"
                onClick={() => setShowInsertLinkModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Anchor Text (Words that will be clicked):
                </label>
                <input
                  type="text"
                  placeholder="e.g. View Our Portfolio"
                  value={customLinkText}
                  onChange={(e) => setCustomLinkText(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-medium focus:outline-none"
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
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-medium focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowInsertLinkModal(false)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleInsertLink}
                className="px-4 py-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-xs cursor-pointer"
              >
                Insert Link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. QUICK INSERT CUSTOM BUTTON MODAL                       */}
      {/* ========================================================= */}
      {showInsertButtonModal && (
        <div className="fixed inset-0 z-60 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-sm sm:max-w-md p-4 sm:p-5 shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <ExternalLink className="w-4 h-4 text-blue-600" />
                <span>Insert Custom Action Button</span>
              </h4>
              <button
                type="button"
                onClick={() => setShowInsertButtonModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Button Label / Text (e.g. Our Services, Book a Demo):
                </label>
                <input
                  type="text"
                  placeholder="e.g. Our Services"
                  value={customButtonText}
                  onChange={(e) => setCustomButtonText(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-medium focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Button Destination Link (URL):
                </label>
                <input
                  type="url"
                  placeholder="https://yourwebsite.com/services"
                  value={customButtonUrl}
                  onChange={(e) => setCustomButtonUrl(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-medium focus:outline-none"
                />
              </div>

              {/* Live Preview in Modal */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-center">
                <div className="text-[10px] text-slate-400 font-semibold mb-1.5">Preview:</div>
                <span className="inline-block px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-lg shadow-xs">
                  {customButtonText.trim() || 'Our Services'} &rarr;
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowInsertButtonModal(false)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleInsertCustomButton}
                className="px-4 py-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-xs cursor-pointer"
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
