import React, { useState, useEffect } from 'react';
import { AdminSidebar } from '../components/admin/AdminSidebar';
import { apiFetch } from '../utils/api';
import { useTheme } from '../theme/ThemeProvider';
import { useSocket } from '../context/SocketContext';
import { 
  Palette, 
  Eye, 
  Save, 
  Send, 
  RotateCcw, 
  Check, 
  Sparkles, 
  Type, 
  Layout, 
  Sliders,
  History,
  CheckCircle2
} from 'lucide-react';

export function AdminDesignStudioPage() {
  const { theme, setTheme, applyThemeToDOM, fetchActiveTheme } = useTheme();
  const { socket } = useSocket();

  const [formConfig, setFormConfig] = useState({ ...theme });
  const [activeTab, setActiveTab] = useState('branding'); // branding, colors, typography, components, hero
  const [versions, setVersions] = useState([]);
  const [publishing, setPublishing] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);

  const loadVersions = async () => {
    try {
      const res = await apiFetch('/config/theme-versions');
      setVersions(res.versions || []);
    } catch (err) {
      console.error('Failed to fetch versions:', err);
    }
  };

  useEffect(() => {
    setFormConfig({ ...theme });
    loadVersions();
  }, [theme]);

  const handleFieldChange = (field, value) => {
    const updated = { ...formConfig, [field]: value };
    setFormConfig(updated);
    // Apply live draft preview to DOM style
    applyThemeToDOM(updated);
  };

  const handleSaveDraft = async () => {
    try {
      await apiFetch('/config/design-studio/save-draft', {
        method: 'POST',
        body: JSON.stringify(formConfig)
      });
      setStatusMsg('Theme draft saved successfully.');
      setTimeout(() => setStatusMsg(null), 3000);
      loadVersions();
    } catch (err) {
      alert(`Save draft failed: ${err.message}`);
    }
  };

  const handlePublish = async () => {
    setPublishing(true);
    try {
      const res = await apiFetch('/config/design-studio/publish', {
        method: 'POST',
        body: JSON.stringify(formConfig)
      });

      setTheme(res.theme);
      applyThemeToDOM(res.theme);

      // Broadcast socket event for instant client updates across all connected browsers
      if (socket) {
        socket.emit('theme_published', res.theme);
      }

      setStatusMsg(`Theme Version ${res.version_num} Published Live! Public site is now updated.`);
      setTimeout(() => setStatusMsg(null), 4000);
      loadVersions();
    } catch (err) {
      alert(`Publish failed: ${err.message}`);
    } finally {
      setPublishing(false);
    }
  };

  const handleRollback = async (versionId) => {
    if (!window.confirm('Roll back public theme to this historical version?')) return;
    try {
      const res = await apiFetch(`/config/design-studio/rollback/${versionId}`, { method: 'POST' });
      setTheme(res.config);
      setFormConfig(res.config);
      applyThemeToDOM(res.config);

      if (socket) socket.emit('theme_published', res.config);

      setStatusMsg('Rollback complete! Published settings updated.');
      setTimeout(() => setStatusMsg(null), 3000);
      loadVersions();
    } catch (err) {
      alert(`Rollback failed: ${err.message}`);
    }
  };

  return (
    <div className="flex h-screen bg-[#090D16] text-slate-100 font-sans overflow-hidden">
      <AdminSidebar />

      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Action Bar */}
        <div className="h-16 bg-[#0B0F17] border-b border-white/10 px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#0284C7]/20 text-[#0284C7] rounded-lg">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-extrabold font-display text-white">Admin Design Studio</h1>
              <p className="text-[11px] text-slate-400">Live Theme & Brand Control Center</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {statusMsg && (
              <span className="text-xs text-emerald-400 font-semibold bg-emerald-950/40 border border-emerald-500/30 px-3 py-1.5 rounded-lg flex items-center gap-1.5 animate-fade-in">
                <CheckCircle2 className="w-4 h-4" /> {statusMsg}
              </span>
            )}

            <button
              onClick={handleSaveDraft}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-white/10 flex items-center gap-2 transition"
            >
              <Save className="w-4 h-4" /> Save Draft
            </button>

            <button
              onClick={handlePublish}
              disabled={publishing}
              className="px-5 py-2 bg-gradient-to-r from-[#0284C7] to-emerald-600 hover:from-sky-500 hover:to-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-sky-900/30 flex items-center gap-2 transition"
            >
              <Send className="w-4 h-4" /> {publishing ? 'Publishing...' : 'Publish Live Theme'}
            </button>
          </div>
        </div>

        {/* Studio Main Grid */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Config Panel */}
          <div className="w-[450px] bg-[#0B0F17] border-r border-white/10 flex flex-col h-full overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-white/10 text-xs bg-[#0F172A] overflow-x-auto">
              {['branding', 'colors', 'typography', 'components', 'hero', 'history'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-3 font-semibold capitalize whitespace-nowrap transition border-b-2 ${
                    activeTab === tab
                      ? 'border-[#0284C7] text-white bg-slate-900'
                      : 'border-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab Forms */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {activeTab === 'branding' && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider text-[11px]">Brand Identity</h3>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Brand Name</label>
                    <input
                      type="text"
                      value={formConfig.brand_name || ''}
                      onChange={(e) => handleFieldChange('brand_name', e.target.value)}
                      className="w-full bg-[#111827] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#0284C7]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Tagline</label>
                    <input
                      type="text"
                      value={formConfig.tagline || ''}
                      onChange={(e) => handleFieldChange('tagline', e.target.value)}
                      className="w-full bg-[#111827] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#0284C7]"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'colors' && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider text-[11px]">Color Palette</h3>
                  {[
                    { key: 'primary_color', label: 'Primary Brand Color' },
                    { key: 'secondary_color', label: 'Secondary / Highlight Blue' },
                    { key: 'accent_color', label: 'Accent / Online Status Emerald' },
                    { key: 'bg_color', label: 'Background Dark Tone' },
                    { key: 'surface_color', label: 'Surface Container Tone' },
                    { key: 'text_color', label: 'Primary Text Color' }
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-3 bg-slate-900 rounded-xl border border-white/5">
                      <div>
                        <p className="text-xs font-semibold text-white">{item.label}</p>
                        <p className="text-[10px] text-slate-400 uppercase">{formConfig[item.key]}</p>
                      </div>
                      <input
                        type="color"
                        value={formConfig[item.key] || '#ffffff'}
                        onChange={(e) => handleFieldChange(item.key, e.target.value)}
                        className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                      />
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'typography' && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider text-[11px]">Typography System</h3>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Font Family</label>
                    <select
                      value={formConfig.font_family || 'Plus Jakarta Sans, sans-serif'}
                      onChange={(e) => handleFieldChange('font_family', e.target.value)}
                      className="w-full bg-[#111827] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#0284C7]"
                    >
                      <option value="Plus Jakarta Sans, sans-serif">Plus Jakarta Sans (Modern Clean)</option>
                      <option value="Outfit, sans-serif">Outfit (Bold Creator Geometric)</option>
                      <option value="Inter, sans-serif">Inter (SaaS Standard)</option>
                      <option value="Roboto, sans-serif">Roboto (Classic Tech)</option>
                    </select>
                  </div>
                </div>
              )}

              {activeTab === 'components' && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider text-[11px]">Component Geometry</h3>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Button Corner Radius</label>
                    <select
                      value={formConfig.button_radius || '8px'}
                      onChange={(e) => handleFieldChange('button_radius', e.target.value)}
                      className="w-full bg-[#111827] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    >
                      <option value="4px">4px (Subtle Square)</option>
                      <option value="8px">8px (Modern Rounded)</option>
                      <option value="12px">12px (Soft Curved)</option>
                      <option value="999px">999px (Full Pill)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Card Corner Radius</label>
                    <select
                      value={formConfig.card_radius || '12px'}
                      onChange={(e) => handleFieldChange('card_radius', e.target.value)}
                      className="w-full bg-[#111827] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    >
                      <option value="8px">8px (Compact)</option>
                      <option value="12px">12px (Standard Smooth)</option>
                      <option value="20px">20px (Floating Deep)</option>
                    </select>
                  </div>
                </div>
              )}

              {activeTab === 'hero' && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider text-[11px]">Homepage Content CMS</h3>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Hero Headline</label>
                    <textarea
                      value={formConfig.hero_headline || ''}
                      onChange={(e) => handleFieldChange('hero_headline', e.target.value)}
                      rows={2}
                      className="w-full bg-[#111827] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#0284C7] resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Hero Subheadline</label>
                    <textarea
                      value={formConfig.hero_subheadline || ''}
                      onChange={(e) => handleFieldChange('hero_subheadline', e.target.value)}
                      rows={3}
                      className="w-full bg-[#111827] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#0284C7] resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Primary CTA Button Copy</label>
                    <input
                      type="text"
                      value={formConfig.hero_cta_text || ''}
                      onChange={(e) => handleFieldChange('hero_cta_text', e.target.value)}
                      className="w-full bg-[#111827] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'history' && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider text-[11px]">Version History</h3>
                  <div className="space-y-2">
                    {versions.map((ver) => (
                      <div key={ver.id} className="p-3 bg-slate-900 rounded-xl border border-white/5 flex items-center justify-between text-xs">
                        <div>
                          <p className="font-bold text-white">Version #{ver.version_num}</p>
                          <p className="text-[10px] text-slate-400">{new Date(ver.created_at).toLocaleString()}</p>
                        </div>
                        {ver.status === 'published' ? (
                          <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded">
                            Active Published
                          </span>
                        ) : (
                          <button
                            onClick={() => handleRollback(ver.id)}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[10px] font-semibold flex items-center gap-1"
                          >
                            <RotateCcw className="w-3 h-3" /> Rollback
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Live Preview Box */}
          <div className="flex-1 bg-[#090D16] p-8 overflow-y-auto flex flex-col items-center justify-start">
            <div className="w-full max-w-2xl space-y-6">
              <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-white/10">
                <span className="font-semibold flex items-center gap-2">
                  <Eye className="w-4 h-4 text-[#0284C7]" /> Live Interactive Preview
                </span>
                <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-300">Draft Render</span>
              </div>

              {/* Preview Card representing published style */}
              <div
                className="p-8 rounded-2xl border transition-all space-y-6 shadow-2xl"
                style={{
                  backgroundColor: formConfig.surface_color || '#111827',
                  borderColor: 'rgba(255,255,255,0.1)',
                  borderRadius: formConfig.card_radius || '12px',
                  fontFamily: formConfig.font_family || 'sans-serif'
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="font-bold text-lg text-white" style={{ color: formConfig.text_color }}>
                    {formConfig.brand_name || 'LWS Direct'}
                  </div>
                  <span
                    className="text-xs px-2.5 py-1 rounded font-semibold"
                    style={{
                      backgroundColor: `${formConfig.accent_color}20`,
                      color: formConfig.accent_color
                    }}
                  >
                    Online Status Accent
                  </span>
                </div>

                <div className="space-y-2">
                  <h2 className="text-2xl font-extrabold text-white" style={{ color: formConfig.text_color }}>
                    {formConfig.hero_headline || 'Hero Headline Text'}
                  </h2>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {formConfig.hero_subheadline || 'Hero subheadline description...'}
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    className="px-6 py-3 font-bold text-xs text-white shadow-lg transition-all"
                    style={{
                      backgroundColor: formConfig.secondary_color || '#0284C7',
                      borderRadius: formConfig.button_radius || '8px'
                    }}
                  >
                    {formConfig.hero_cta_text || 'Start a Conversation'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
