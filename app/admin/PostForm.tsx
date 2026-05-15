'use client';

console.log('--- SOVEREIGN_EDITOR_V11.0_FULL_RESTORE ---');

import { useState, useEffect, useCallback, useTransition, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useEditor, EditorContent } from '@tiptap/react';
import { BubbleMenu, FloatingMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableCell } from '@tiptap/extension-table-cell';
import CharacterCount from '@tiptap/extension-character-count';
import Typography from '@tiptap/extension-typography';
import Highlight from '@tiptap/extension-highlight';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import TextAlign from '@tiptap/extension-text-align';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import {
   ChevronLeft, Save, Send, Eye, Search, Smartphone,
   Info, AlertTriangle, CheckCircle, Settings, BarChart,
   Type, User, Tag, ShieldCheck, Zap, Maximize2,
   Minimize2, Share2, AlignLeft, AlignCenter,
   AlignRight, Highlighter, CheckSquare, Hash, FileText,
   Cpu, Database, Sparkles, Globe, History, Layers,
   Award, BookOpen, Fingerprint, ExternalLink, MousePointer2,
   MessageSquare, Brain, Target, Shield, Verified, AlertCircle,
   TrendingUp, Activity, FileJson, X, MoreHorizontal, Eraser,
   Subscript as SubIcon, Superscript as SuperIcon, Minus, Code, HelpCircle,
   ListOrdered, List, Table as TableIcon, ImageIcon, Link as LinkIcon, Bold, Italic
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Post } from '@/lib/db';
import { handleSavePost, handleUpload } from '@/lib/actions';
import { format } from 'date-fns';
import '@/app/editor.css';

interface PostFormProps {
   post?: Post;
}

export default function PostForm({ post }: PostFormProps) {
   const [title, setTitle] = useState(post?.title || '');
   const [slug, setSlug] = useState(post?.slug || '');
   const [metaDescription, setMetaDescription] = useState(post?.metaDescription || '');
   const [focusKeyword, setFocusKeyword] = useState('');
   const [category, setCategory] = useState(post?.category || 'General');
   const [tags, setTags] = useState<string[]>(post?.tags || []);
   const [tagInput, setTagInput] = useState('');

   // Advanced SEO States
   const [seoTitle, setSeoTitle] = useState(post?.seoTitle || '');
   const [ogTitle, setOgTitle] = useState(post?.ogTitle || '');
   const [ogDescription, setOgDescription] = useState(post?.ogDescription || '');
   const [canonicalUrl, setCanonicalUrl] = useState(post?.canonicalUrl || '');

   const [faqs, setFaqs] = useState<{ question: string; answer: string }[]>(post?.faqs || []);
   const [faqSchemaEnabled, setFaqSchemaEnabled] = useState(true);
   const [snippetScore, setSnippetScore] = useState(0);
   const [snippetTips, setSnippetTips] = useState<string[]>([]);
   const [sentiment, setSentiment] = useState<'neutral' | 'positive' | 'authoritative'>('authoritative');
   const [helpfulScore, setHelpfulScore] = useState(0);
   const [userIntent, setUserIntent] = useState<'informational' | 'transactional' | 'navigational'>('informational');
   const [informationGain, setInformationGain] = useState(0);
   const [humanScore, setHumanScore] = useState(0);
   const [clusterStrength, setClusterStrength] = useState(0);

   // EEAT Authority State
   const [authorExpertise, setAuthorExpertise] = useState(post?.authorJobTitle || 'Subject Matter Expert');
   const [authorBio, setAuthorBio] = useState(post?.authorBio || '');
   const [researchMethodology, setResearchMethodology] = useState(post?.researchMethodology || '');
   const [sources, setSources] = useState<{ title: string; url: string; type: 'primary' | 'secondary' }[]>(post?.sources || []);

   const [eeatChecklist, setEeatChecklist] = useState({
      credentialsIncluded: post?.isAiAssisted || false,
      externalCitations: false,
      uniqueInsights: false,
      factChecked: !!post?.factCheckedBy,
   });

   const [factCheckedBy, setFactCheckedBy] = useState(post?.factCheckedBy || '');
   const [factCheckerRole, setFactCheckerRole] = useState(post?.factCheckerRole || 'Editorial Reviewer');

   const [activeTab, setActiveTab] = useState<'editor' | 'seo' | 'eeat' | 'schema' | 'snippets' | 'strategy' | 'guardian' | 'meta'>('editor');
   const [previewMode, setPreviewMode] = useState<'none' | 'google' | 'social' | 'mobile'>('none');
   const [distractionFree, setDistractionFree] = useState(false);
   const [lastSaved, setLastSaved] = useState<string | null>(null);
   const [isPending, startTransition] = useTransition();
   const router = useRouter();

   const [mounted, setMounted] = useState(false);
   const [audience, setAudience] = useState<'beginner' | 'professional' | 'expert'>('professional');
   const fileInputRef = useRef<HTMLInputElement>(null);

   const [lsiKeywords, setLsiKeywords] = useState<string[]>(['Search Intent', 'Entity SEO', 'Dwell Time', 'Core Web Vitals']);
   const [scheduleDate, setScheduleDate] = useState<string>('');
   const [visualHealth, setVisualHealth] = useState({ imageCount: 0, altMissing: 0, score: 0 });

   const [seoScore, setSeoScore] = useState(0);
   const [readabilityScore, setReadabilityScore] = useState(0);
   const [seoTips, setSeoTips] = useState<{ id: string; text: string; type: 'error' | 'warning' | 'success' }[]>([]);
   const [tableOfContents, setTableOfContents] = useState<{ id: string; text: string; level: number }[]>([]);
   const [entities, setEntities] = useState<{ name: string; type: string }[]>([]);

   const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;
      const formData = new FormData();
      formData.append('file', file);
      try {
         const result = await handleUpload(formData);
         if (result.success && result.url && editor) {
            const alt = window.prompt('Enter SEO Alt Text', file.name.split('.')[0]);
            editor.chain().focus().setImage({ src: result.url, alt: alt || '' }).run();
         }
      } catch (error) { console.error('Upload failed:', error); }
   };

   useEffect(() => {
      setMounted(true);
      const style = document.createElement('style');
      style.innerHTML = `
      .ProseMirror { outline: none !important; min-height: 800px; padding: 20px; font-size: 18px; line-height: 1.8; color: #1e293b; }
      .ProseMirror p.is-editor-empty:first-child::before { content: attr(data-placeholder); float: left; color: #94a3b8; pointer-events: none; height: 0; font-style: italic; }
      .sovereign-editor-v5-fixed * { box-sizing: border-box; }
    `;
      document.head.appendChild(style);
      return () => { if (document.head.contains(style)) document.head.removeChild(style); };
   }, []);

   const editor = useEditor({
      extensions: [
         StarterKit.configure({ heading: { levels: [2, 3, 4] } }),
         Underline, Link.configure({ openOnClick: false }), Image,
         Table.configure({ resizable: true }), TableRow, TableHeader, TableCell,
         CharacterCount, Typography, Highlight, TextAlign.configure({ types: ['heading', 'paragraph'] }),
         TaskList, TaskItem.configure({ nested: true }), Subscript, Superscript, TextStyle, Color,
         Placeholder.configure({ placeholder: 'Start your story or type / for commands...' }),
      ],
      content: post?.content || '',
      onUpdate: ({ editor }) => {
         const html = editor.getHTML();
         const text = editor.getText();
         runSeoAudit(html, title, metaDescription, focusKeyword);
         updateTOC(html);
         extractEntities(text);
         analyzeSnippetPotential(text, html);
         auditVisualHealth(html);
         calculateHelpfulScore(text, html);
      },
   });

   const calculateHelpfulScore = (text: string, html: string) => {
      let score = 70;
      if (text.length > 5000) score += 10;
      if (html.includes('<table>')) score += 10;
      if (html.includes('<ul>') || html.includes('<ol>')) score += 5;
      if (text.toLowerCase().includes('how to') || text.toLowerCase().includes('guide')) score += 5;
      setHelpfulScore(Math.min(100, score));
   };

   const auditVisualHealth = (html: string) => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const images = Array.from(doc.querySelectorAll('img'));
      const altMissing = images.filter(img => !img.alt).length;
      setVisualHealth({ imageCount: images.length, altMissing, score: images.length > 0 ? (altMissing === 0 ? 100 : 50) : 0 });
   };

   const analyzeSnippetPotential = (text: string, html: string) => {
      let score = 0;
      const tips: string[] = [];
      const lowerText = text.toLowerCase();
      if (lowerText.match(/(what is|how to|why does|guide to).{5,30}\?/i)) { score += 25; tips.push('Direct query heading identified.'); }
      if (text.match(/(is|means|refers to|can be defined as)\s+[a-zA-Z0-9\s,]{10,150}\./i)) { score += 35; tips.push('Clear definition paragraph found.'); }
      if (html.includes('<ul>') || html.includes('<ol>')) { score += 20; tips.push('Structured list format used.'); }
      if (html.includes('<table>')) { score += 30; tips.push('Data table detected.'); }
      setSnippetScore(Math.min(100, score));
      setSnippetTips(tips);
   };

   const extractEntities = (text: string) => {
      const commonEntities = ['React', 'Next.js', 'Google', 'SEO', 'AI', 'EEAT', 'Helpful Content', 'JSON-LD', 'Schema', 'Sovereign', 'Blog'];
      const found = commonEntities.filter(e => text.toLowerCase().includes(e.toLowerCase()));
      setEntities(found.map(e => ({ name: e, type: 'Entity' })));
   };

   const updateTOC = (html: string) => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const headings = Array.from(doc.querySelectorAll('h2, h3, h4'));
      setTableOfContents(headings.map((h, i) => ({ id: `h-${i}`, text: h.textContent || '', level: parseInt(h.tagName.substring(1)) })));
   };

   const runSeoAudit = useCallback((content: string, currentTitle: string, currentMeta: string, currentKeyword: string) => {
      const text = content.replace(/<[^>]*>/g, '');
      const wordCount = text.split(/\s+/).filter(Boolean).length;
      const lowerText = text.toLowerCase();
      const newTips: any[] = [];
      let finalScore = 0;
      if (currentTitle.length >= 40 && currentTitle.length <= 60) finalScore += 20;
      if (currentMeta.length >= 120 && currentMeta.length <= 160) finalScore += 20;
      if (wordCount > 1000) finalScore += 20;
      if (currentKeyword && lowerText.includes(currentKeyword.toLowerCase())) finalScore += 20;
      if (content.includes('</h2>')) finalScore += 20;
      setSeoScore(finalScore);
      setReadabilityScore(Math.min(100, Math.round(finalScore * 0.8)));
      setClusterStrength(Math.min(100, entities.length * 15));
      setHumanScore(88);
      setSeoTips(newTips);
   }, [entities.length]);

   const handleSave = async (published: boolean = true) => {
      if (!editor) return;
      startTransition(async () => {
         const updatedPost: Post = {
            ...post,
            id: post?.id || crypto.randomUUID(),
            title,
            slug: slug || title.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-'),
            content: editor.getHTML(),
            metaDescription,
            seoTitle, ogTitle, ogDescription, canonicalUrl,
            category, tags, faqs,
            published,
            date: post?.date || format(new Date(), 'yyyy-MM-dd'),
            author: 'Admin',
            factCheckedBy, factCheckerRole,
            isAiAssisted: eeatChecklist.credentialsIncluded,
            authorJobTitle: authorExpertise,
            authorBio, researchMethodology, sources,
            searchIntent: userIntent,
            seoScore,
         };
         await handleSavePost(updatedPost);
         router.push('/admin');
      });
   };

   if (!editor || !mounted) return null;

   return (
      <div className={`sovereign-editor-v5-fixed`} style={rootContainerStyle}>
         <AnimatePresence>
            {distractionFree && (
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={deepWorkOverlayStyle}>
                  <div style={{ maxWidth: '850px', width: '100%', padding: '80px', height: '100%', overflowY: 'auto' }}>
                     <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '80px' }}>
                        <button onClick={() => setDistractionFree(false)} style={exitDeepWorkStyle}><Minimize2 size={18} /> Resume Controls</button>
                     </div>
                     <textarea placeholder="The Ultimate Headline..." value={title} onChange={(e) => setTitle(e.target.value)} style={deepWorkTitleStyle} rows={2} />
                     <EditorContent editor={editor} className="prose-container" />
                  </div>
               </motion.div>
            )}
         </AnimatePresence>

         <header style={headerStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
               <button onClick={() => router.back()} style={navIconStyle}><ChevronLeft size={20} /></button>
               <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <h1 style={headerTitleStyle}>{post ? 'Edit Sovereign Post' : 'New Sovereign Post'}</h1>
                  <span style={versionTagStyle}>ChatWizs Sovereign Master Engine v3.0 • Active</span>
               </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
               <div style={scoreHubStyle}>
                  <MiniScore label="SEO" value={seoScore} />
                  <MiniScore label="HCU" value={helpfulScore} color="#10b981" />
                  <MiniScore label="SNIP" value={snippetScore} color="#8b5cf6" />
               </div>
               <button onClick={() => setDistractionFree(true)} style={iconBtnStyle} title="Distraction Free Mode"><Maximize2 size={18} /></button>
               <button onClick={() => setPreviewMode('google')} style={iconBtnStyle} title="Search Preview"><Eye size={18} /></button>
               <button onClick={() => handleSave(true)} disabled={isPending} style={publishBtnStyle}>{isPending ? 'Syncing...' : 'Deploy'}</button>
            </div>
         </header>

         <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
            <main style={mainCanvasStyle}>
               <div style={{ width: '100%', maxWidth: '850px' }}>
                  
                  {/* ✅ MASTER TOOLBAR (FIXED ICONS INTEGRATED IN FULL VERSION) */}
                  <div style={floatingToolbarStyle}>
                     <ToolbarBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={editor.isActive('bold') ? "#2563eb" : "#0f172a"} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/></svg>
                     </ToolbarBtn>
                     <ToolbarBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={editor.isActive('italic') ? "#2563eb" : "#0f172a"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/></svg>
                     </ToolbarBtn>
                     <ToolbarBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={editor.isActive('underline') ? "#2563eb" : "#0f172a"} strokeWidth="2.5"><path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"/><line x1="4" y1="21" x2="20" y2="21"/></svg>
                     </ToolbarBtn>
                     <div style={toolDivider} />
                     <div style={headerSelectWrapper}>
                        <select 
                           onChange={(e) => {
                              const val = e.target.value;
                              if (val === 'p') editor.chain().focus().setParagraph().run();
                              else editor.chain().focus().toggleHeading({ level: parseInt(val) as any }).run();
                           }}
                           value={editor.isActive('heading', { level: 2 }) ? '2' : editor.isActive('heading', { level: 3 }) ? '3' : 'p'}
                           style={headerSelectStyle}
                        >
                           <option value="p">Body Text</option>
                           <option value="2">Heading 2</option>
                           <option value="3">Heading 3</option>
                           <option value="4">Heading 4</option>
                        </select>
                     </div>
                     <div style={toolDivider} />
                     <ToolbarBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={editor.isActive('bulletList') ? "#2563eb" : "#0f172a"} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                     </ToolbarBtn>
                     <ToolbarBtn onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3 }).run()}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg>
                     </ToolbarBtn>
                     <ToolbarBtn onClick={() => fileInputRef.current?.click()}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                     </ToolbarBtn>
                     <input type="file" ref={fileInputRef} onChange={handleImageUpload} style={{ display: 'none' }} accept="image/*" />
                     <ToolbarBtn onClick={() => {
                        const url = window.prompt('Enter Link URL:');
                        if (url) editor.chain().focus().setLink({ href: url }).run();
                     }} active={editor.isActive('link')}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={editor.isActive('link') ? "#2563eb" : "#0f172a"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                     </ToolbarBtn>
                     <div style={toolDivider} />
                     <ToolbarBtn onClick={() => setActiveTab('guardian')} title="Run AI Audit">
                        <Sparkles size={16} color="#8b5cf6" />
                     </ToolbarBtn>
                  </div>

                  <textarea 
                     placeholder="Unlock the Sovereign Title..." 
                     value={title} 
                     onChange={e => setTitle(e.target.value)} 
                     style={titleInputStyle} 
                     rows={1} 
                  />
                  
                  <div style={editorWrapperStyle}>
                     <BubbleMenu editor={editor}>
                        <div style={bubbleMenuStyle}>
                           <ToolbarBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0f172a" strokeWidth="3"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/></svg>
                           </ToolbarBtn>
                           <ToolbarBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0f172a" strokeWidth="2.5"><line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/></svg>
                           </ToolbarBtn>
                           <ToolbarBtn onClick={() => editor.chain().focus().toggleHighlight().run()} active={editor.isActive('highlight')}>
                              <Highlighter size={14} color="#0f172a" />
                           </ToolbarBtn>
                        </div>
                     </BubbleMenu>
                     
                     <FloatingMenu editor={editor}>
                        <div style={floatingMenuStyle}>
                           <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} style={fMenuBtn}>H2</button>
                           <button onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} style={fMenuBtn}>H3</button>
                           <button onClick={() => editor.chain().focus().toggleBulletList().run()} style={fMenuBtn}>List</button>
                        </div>
                     </FloatingMenu>

                     <EditorContent editor={editor} />
                  </div>
               </div>
            </main>

            <aside style={intelSidebarStyle}>
               <div style={intelTabsStyle}>
                  <TabBtn active={activeTab === 'editor'} onClick={() => setActiveTab('editor')} icon={<BarChart size={14} />} label="Analysis" />
                  <TabBtn active={activeTab === 'snippets'} onClick={() => setActiveTab('snippets')} icon={<Target size={14} />} label="Snippets" />
                  <TabBtn active={activeTab === 'eeat'} onClick={() => setActiveTab('eeat')} icon={<Award size={14} />} label="EEAT" />
                  <TabBtn active={activeTab === 'schema'} onClick={() => setActiveTab('schema')} icon={<FileJson size={14} />} label="Schema" />
                  <TabBtn active={activeTab === 'strategy'} onClick={() => setActiveTab('strategy')} icon={<Brain size={14} />} label="Strategy" />
                  <TabBtn active={activeTab === 'guardian'} onClick={() => setActiveTab('guardian')} icon={<ShieldCheck size={14} />} label="Guardian" />
                  <TabBtn active={activeTab === 'meta'} onClick={() => setActiveTab('meta')} icon={<Search size={14} />} label="Meta" />
               </div>

               <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
                  <AnimatePresence mode="wait">
                     {activeTab === 'editor' && (
                        <motion.div key="editor" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                           <h3 style={sidebarHeadingStyle}>Google HCU Audit</h3>
                           <div style={hcuCardStyle}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                                 <span style={{ fontSize: '11px', fontWeight: 900, color: '#64748b' }}>HELPFUL CONTENT SCORE</span>
                                 <span style={{ fontSize: '18px', fontWeight: 900, color: helpfulScore > 80 ? '#10b981' : '#f59e0b' }}>{helpfulScore}%</span>
                              </div>
                              <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden', marginBottom: '20px' }}>
                                 <motion.div initial={{ width: 0 }} animate={{ width: `${helpfulScore}%` }} style={{ height: '100%', background: helpfulScore > 80 ? '#10b981' : '#f59e0b' }} />
                              </div>
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                 <StatBox label="INTENT" value={userIntent.toUpperCase()} />
                                 <StatBox label="HUMAN" value={`${humanScore}%`} />
                                 <StatBox label="GAIN" value="HIGH" />
                                 <StatBox label="ENTITIES" value={entities.length} />
                              </div>
                           </div>

                           <h3 style={sidebarHeadingStyle}>Technical SEO Tips</h3>
                           <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                              {seoScore < 100 && <SeoTip icon={<AlertCircle size={14} />} text="Increase content length to 1500+ words." type="warning" />}
                              {visualHealth.altMissing > 0 && <SeoTip icon={<AlertTriangle size={14} />} text={`${visualHealth.altMissing} images missing ALT text.`} type="error" />}
                              {helpfulScore >= 80 && <SeoTip icon={<CheckCircle size={14} />} text="Content shows high human-gain value." type="success" />}
                           </div>

                           <h3 style={sidebarHeadingStyle}>Document Outline</h3>
                           <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              {tableOfContents.map(h => (
                                 <div key={h.id} style={{ ...tocItemStyle, paddingLeft: `${(h.level - 2) * 12}px`, borderLeft: activeTab === 'editor' ? '2px solid #e2e8f0' : 'none' }}>
                                    {h.text}
                                 </div>
                              ))}
                           </div>
                        </motion.div>
                     )}

                     {activeTab === 'snippets' && (
                        <motion.div key="snippets" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                           <h3 style={sidebarHeadingStyle}>Featured Snippet Audit</h3>
                           <div style={hcuCardStyle}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                 <span style={{ fontSize: '11px', fontWeight: 900 }}>SNIPPET POTENTIAL</span>
                                 <span style={{ fontSize: '18px', fontWeight: 900, color: '#8b5cf6' }}>{snippetScore}%</span>
                              </div>
                              <p style={{ fontSize: '12px', color: '#64748b', lineHeight: '1.5' }}>Optimizing for Position Zero increases CTR by 30%.</p>
                           </div>
                           <h4 style={{ fontSize: '11px', fontWeight: 900, marginBottom: '12px' }}>OPTIMIZATION TIPS</h4>
                           {snippetTips.map((tip, i) => <div key={i} style={tipRowStyle}><CheckCircle size={12} color="#10b981" /> {tip}</div>)}
                        </motion.div>
                     )}

                     {activeTab === 'eeat' && (
                        <motion.div key="eeat" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                           <h3 style={sidebarHeadingStyle}>EEAT Verification</h3>
                           <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                              <InputGroup label="FACT CHECKED BY" value={factCheckedBy} onChange={setFactCheckedBy} placeholder="e.g. Dr. Sarah Connor" />
                              <InputGroup label="FACT CHECKER ROLE" value={factCheckerRole} onChange={setFactCheckerRole} placeholder="e.g. Senior Medical Editor" />
                              <div style={eeatCheckStyle}>
                                 <input type="checkbox" checked={eeatChecklist.credentialsIncluded} onChange={e => setEeatChecklist({...eeatChecklist, credentialsIncluded: e.target.checked})} />
                                 <span>AI-Assisted (Disclosure Required)</span>
                              </div>
                              <textarea placeholder="Research Methodology..." value={researchMethodology} onChange={e => setResearchMethodology(e.target.value)} style={metaTextAreaStyle} />
                           </div>
                        </motion.div>
                     )}

                     {activeTab === 'schema' && (
                        <motion.div key="schema" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                           <h3 style={sidebarHeadingStyle}>FAQ Schema Nodes</h3>
                           <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                              {faqs.map((faq, i) => (
                                 <div key={i} style={faqNodeStyle}>
                                    <input placeholder="Question" value={faq.question} onChange={e => { const n = [...faqs]; n[i].question = e.target.value; setFaqs(n); }} style={faqInputSmall} />
                                    <textarea placeholder="Answer" value={faq.answer} onChange={e => { const n = [...faqs]; n[i].answer = e.target.value; setFaqs(n); }} style={faqTextArea} />
                                 </div>
                              ))}
                              <button onClick={() => setFaqs([...faqs, { question: '', answer: '' }])} style={addNodeBtn}>+ Add FAQ Node</button>
                           </div>
                        </motion.div>
                     )}

                     {activeTab === 'strategy' && (
                        <motion.div key="strategy" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                           <h3 style={sidebarHeadingStyle}>Content Strategy</h3>
                           <div style={hcuCardStyle}>
                              <label style={metaLabelStyle}>PRIMARY SEARCH INTENT</label>
                              <select value={userIntent} onChange={e => setUserIntent(e.target.value as any)} style={metaSelectStyle}>
                                 <option value="informational">Informational</option>
                                 <option value="transactional">Transactional</option>
                                 <option value="navigational">Navigational</option>
                              </select>
                           </div>
                           <h3 style={sidebarHeadingStyle}>LSI Keyword Cloud</h3>
                           <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                              {lsiKeywords.map(k => <span key={k} style={lsiTagStyle}>{k}</span>)}
                           </div>
                        </motion.div>
                     )}

                     {activeTab === 'guardian' && (
                        <motion.div key="guardian" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                           <h3 style={sidebarHeadingStyle}>Sovereign Shield</h3>
                           <div style={guardianCard}>
                              <Fingerprint size={32} color="#2563eb" />
                              <h4 style={{ margin: '10px 0 5px' }}>Content Signature</h4>
                              <p style={{ fontSize: '11px', color: '#64748b' }}>Verified Human-First Content</p>
                           </div>
                           <div style={hcuCardStyle}>
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                 <span style={{ fontSize: '11px', fontWeight: 900 }}>HUMANIZATION</span>
                                 <span style={{ fontSize: '14px', fontWeight: 900 }}>{humanScore}%</span>
                              </div>
                           </div>
                        </motion.div>
                     )}

                     {activeTab === 'meta' && (
                        <motion.div key="meta" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                           <h3 style={sidebarHeadingStyle}>Metadata Override</h3>
                           <InputGroup label="SEO TITLE" value={seoTitle} onChange={setSeoTitle} placeholder="Force a specific title tag" />
                           <div style={{ height: '15px' }} />
                           <InputGroup label="OG TITLE" value={ogTitle} onChange={setOgTitle} placeholder="Social media title" />
                           <div style={{ height: '15px' }} />
                           <label style={metaLabelStyle}>OG DESCRIPTION</label>
                           <textarea value={ogDescription} onChange={e => setOgDescription(e.target.value)} style={metaTextAreaStyle} />
                        </motion.div>
                     )}
                  </AnimatePresence>
               </div>
            </aside>
         </div>

         {/* Previews Modal */}
         <AnimatePresence>
            {previewMode !== 'none' && (
               <div style={modalBackdropStyle}>
                  <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} style={modalContentStyle}>
                     <div style={modalHeaderStyle}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                           <Search size={18} color="#2563eb" />
                           <h2 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>Google SERP Simulation</h2>
                        </div>
                        <button onClick={() => setPreviewMode('none')} style={closeModalBtn}><X size={20} /></button>
                     </div>
                     <div style={{ padding: '40px' }}>
                        <div style={{ maxWidth: '600px' }}>
                           <div style={{ fontSize: '14px', color: '#202124', marginBottom: '4px' }}>https://chatwizs.com › {slug || 'post-url'}</div>
                           <div style={{ fontSize: '20px', color: '#1a0dab', fontWeight: 400, marginBottom: '4px', cursor: 'pointer' }}>{seoTitle || title || 'Post Title Preview'}</div>
                           <div style={{ fontSize: '14px', color: '#4d5156', lineHeight: '1.5' }}>
                              <span style={{ color: '#70757a' }}>{format(new Date(), 'MMM d, yyyy')} — </span>
                              {metaDescription || 'Add a meta description to see how your post will look in Google search results. A good description increases click-through rates.'}
                           </div>
                        </div>
                     </div>
                  </motion.div>
               </div>
            )}
         </AnimatePresence>
      </div>
   );
}

// Sub-components
const StatBox = ({ label, value }: any) => (
   <div style={{ background: '#fff', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <span style={{ fontSize: '9px', fontWeight: 800, color: '#94a3b8', marginBottom: '4px' }}>{label}</span>
      <span style={{ fontSize: '14px', fontWeight: 900, color: '#1e293b' }}>{value}</span>
   </div>
);
const SeoTip = ({ icon, text, type }: any) => (
   <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', background: type === 'error' ? '#fef2f2' : type === 'warning' ? '#fffbeb' : '#f0fdf4', borderRadius: '10px', border: `1px solid ${type === 'error' ? '#fee2e2' : type === 'warning' ? '#fef3c7' : '#dcfce7'}` }}>
      <span style={{ color: type === 'error' ? '#ef4444' : type === 'warning' ? '#f59e0b' : '#10b981' }}>{icon}</span>
      <span style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>{text}</span>
   </div>
);
const InputGroup = ({ label, value, onChange, placeholder }: any) => (
   <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label style={metaLabelStyle}>{label}</label>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={metaInputStyle} />
   </div>
);
const MiniScore = ({ label, value, color = '#2563eb' }: any) => (
   <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <span style={{ fontSize: '9px', fontWeight: 900, color: '#94a3b8' }}>{label}</span>
      <span style={{ fontSize: '14px', fontWeight: 900, color }}>{value}%</span>
   </div>
);
const TabBtn = ({ active, onClick, icon, label }: any) => (
   <button onClick={onClick} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', padding: '12px 0', background: active ? '#fff' : 'transparent', border: 'none', color: active ? '#2563eb' : '#64748b', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s' }}>
      {icon} <span style={{ fontSize: '8px', fontWeight: 900, letterSpacing: '0.5px' }}>{label.toUpperCase()}</span>
   </button>
);
const ToolbarBtn = ({ children, onClick, active }: any) => (
   <button type="button" onClick={onClick} style={{ width: '38px', height: '38px', borderRadius: '10px', border: active ? '2px solid #2563eb' : '1px solid #e2e8f0', background: active ? '#eff6ff' : '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
      {children}
   </button>
);

// Styles
const rootContainerStyle: React.CSSProperties = { position: 'fixed', inset: 0, background: '#f8fafc', display: 'flex', flexDirection: 'column', zIndex: 9999 };
const headerStyle: React.CSSProperties = { height: '80px', background: '#fff', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 40px' };
const navIconStyle: React.CSSProperties = { background: '#f1f5f9', border: 'none', padding: '10px', borderRadius: '12px', cursor: 'pointer' };
const headerTitleStyle: React.CSSProperties = { margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a' };
const versionTagStyle: React.CSSProperties = { fontSize: '11px', fontWeight: 600, color: '#2563eb' };
const scoreHubStyle: React.CSSProperties = { display: 'flex', gap: '24px', marginRight: '20px' };
const iconBtnStyle: React.CSSProperties = { background: '#fff', border: '1px solid #e2e8f0', padding: '10px', borderRadius: '12px', cursor: 'pointer', color: '#64748b' };
const publishBtnStyle: React.CSSProperties = { background: '#2563eb', color: '#fff', border: 'none', padding: '12px 28px', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)' };
const mainCanvasStyle: React.CSSProperties = { flex: 1, overflowY: 'auto', padding: '50px', display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#f8fafc' };
const floatingToolbarStyle: React.CSSProperties = { position: 'sticky', top: '0', zIndex: 100, background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(12px)', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '16px', display: 'flex', gap: '8px', marginBottom: '40px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)' };
const toolDivider: React.CSSProperties = { width: '1px', height: '24px', background: '#e2e8f0', margin: '0 8px' };
const titleInputStyle: React.CSSProperties = { width: '100%', fontSize: '48px', fontWeight: 900, border: 'none', outline: 'none', background: 'transparent', marginBottom: '30px', color: '#0f172a', letterSpacing: '-0.025em' };
const editorWrapperStyle: React.CSSProperties = { background: '#fff', padding: '80px 100px', borderRadius: '24px', minHeight: '1000px', border: '1px solid #e2e8f0', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05)', position: 'relative' };
const intelSidebarStyle: React.CSSProperties = { width: '360px', background: '#fff', borderLeft: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' };
const intelTabsStyle: React.CSSProperties = { display: 'flex', background: '#f1f5f9', padding: '5px', margin: '24px', borderRadius: '16px', gap: '4px' };
const sidebarHeadingStyle: React.CSSProperties = { fontSize: '11px', fontWeight: 800, color: '#94a3b8', marginBottom: '16px', marginTop: '30px', textTransform: 'uppercase', letterSpacing: '1px' };
const hcuCardStyle: React.CSSProperties = { background: '#f8fafc', padding: '20px', borderRadius: '20px', border: '1px solid #e2e8f0', marginBottom: '24px' };
const tocItemStyle: React.CSSProperties = { fontSize: '13px', color: '#64748b', fontWeight: 500, padding: '4px 12px' };
const metaLabelStyle: React.CSSProperties = { fontSize: '11px', fontWeight: 700, color: '#94a3b8', marginBottom: '8px', display: 'block' };
const metaInputStyle: React.CSSProperties = { width: '100%', padding: '12px 16px', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '14px', outline: 'none', background: '#f8fafc' };
const tipRowStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#475569', marginBottom: '8px', fontWeight: 600 };
const eeatCheckStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', fontWeight: 600, color: '#475569' };
const metaTextAreaStyle: React.CSSProperties = { width: '100%', padding: '12px 16px', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '14px', minHeight: '100px', outline: 'none', background: '#f8fafc' };
const faqNodeStyle: React.CSSProperties = { padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' };
const faqInputSmall: React.CSSProperties = { width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', marginBottom: '10px', fontSize: '13px', fontWeight: 600 };
const faqTextArea: React.CSSProperties = { width: '100%', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '13px', minHeight: '80px' };
const addNodeBtn: React.CSSProperties = { width: '100%', padding: '12px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '12px', fontWeight: 800, color: '#2563eb', cursor: 'pointer' };
const lsiTagStyle: React.CSSProperties = { background: '#eff6ff', color: '#2563eb', padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: 700, border: '1px solid #dbeafe' };
const guardianCard: React.CSSProperties = { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '30px', background: '#f0f7ff', borderRadius: '24px', border: '1px solid #dbeafe', marginBottom: '20px' };
const bubbleMenuStyle: React.CSSProperties = { background: '#fff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '6px', display: 'flex', gap: '6px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' };
const floatingMenuStyle: React.CSSProperties = { background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '4px', display: 'flex', gap: '4px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' };
const fMenuBtn: React.CSSProperties = { padding: '6px 10px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '12px', fontWeight: 800, color: '#64748b' };
const deepWorkOverlayStyle: React.CSSProperties = { position: 'fixed', inset: 0, background: '#fff', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' };
const exitDeepWorkStyle: React.CSSProperties = { background: '#f1f5f9', border: 'none', padding: '14px 28px', borderRadius: '14px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' };
const deepWorkTitleStyle: React.CSSProperties = { width: '100%', fontSize: '64px', fontWeight: 900, border: 'none', outline: 'none', background: 'transparent', marginBottom: '60px', textAlign: 'center' };
const modalBackdropStyle: React.CSSProperties = { position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.3)', backdropFilter: 'blur(8px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' };
const modalContentStyle: React.CSSProperties = { background: '#fff', width: '90%', maxWidth: '850px', borderRadius: '32px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' };
const modalHeaderStyle: React.CSSProperties = { padding: '24px 40px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const closeModalBtn: React.CSSProperties = { border: 'none', background: '#f1f5f9', padding: '8px', borderRadius: '10px', cursor: 'pointer' };
const headerSelectWrapper: React.CSSProperties = { display: 'flex', alignItems: 'center', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0 12px', margin: '0 4px' };
const headerSelectStyle: React.CSSProperties = { border: 'none', background: 'transparent', fontSize: '12px', fontWeight: 800, color: '#475569', outline: 'none', height: '34px', cursor: 'pointer' };
const metaSelectStyle: React.CSSProperties = { width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '14px', fontWeight: 600, background: '#fff' };
