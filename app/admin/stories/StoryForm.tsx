'use client';

import { useState, useEffect, useCallback, useTransition, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { WebStory, StorySlide } from '@/lib/db';
import { handleUpload, handleSaveStory } from '@/lib/actions';
import { format } from 'date-fns';

export default function StoryForm({ story }: { story?: WebStory }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [title, setTitle] = useState(story?.title || '');
  const [slug, setSlug] = useState(story?.slug || '');
  const [description, setDescription] = useState(story?.description || '');
  const [category, setCategory] = useState(story?.category || 'General');
  const [tags, setTags] = useState<string[]>(story?.tags || []);
  const [posterImage, setPosterImage] = useState(story?.posterImage || '');
  const [author, setAuthor] = useState(story?.author || 'SEO Expert');
  const [publisherLogo, setPublisherLogo] = useState(story?.publisherLogo || 'https://chatwizs.com/logo-96x96.png');
  const [slides, setSlides] = useState<StorySlide[]>(story?.slides || [
    { id: 'sl1', image: '', text: 'Slide 1' }
  ]);
  const [id, setId] = useState(story?.id || '');

  useEffect(() => {
    if (!id && !story?.id) {
      setId(crypto.randomUUID());
    }
  }, [id, story?.id]);

  const [uploading, setUploading] = useState(false);

  const uploadFile = async (file: File): Promise<string> => {
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const result = await handleUpload(formData);
      setUploading(false);
      if (result.success && result.url) {
        return result.url;
      } else {
        alert(`Upload failed: ${result.error || 'Unknown error'}`);
        return '';
      }
    } catch (e: any) {
      setUploading(false);
      alert(`Upload failed: ${e.message || 'Connection error'}`);
      return '';
    }
  };

  const addSlide = () => {
    setSlides([...slides, { id: `sl${Date.now()}`, image: '', text: '' }]);
  };

  const updateSlide = (index: number, field: keyof StorySlide, value: string) => {
    const newSlides = [...slides];
    newSlides[index] = { ...newSlides[index], [field]: value } as StorySlide;
    setSlides(newSlides);
  };

  const removeSlide = (index: number) => {
    const newSlides = [...slides];
    newSlides.splice(index, 1);
    setSlides(newSlides);
  };

  const handleSave = async (published: boolean) => {
    startTransition(async () => {
      const cleanSlug = (slug || title)
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
      const updatedStory: WebStory = {
        id: id,
        title,
        slug: cleanSlug,
        description,
        category,
        tags,
        posterImage: posterImage || 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=640&h=853&q=80',
        date: story?.date || format(new Date(), 'yyyy-MM-dd'),
        lastModified: format(new Date(), 'yyyy-MM-dd'),
        author,
        publisherLogo,
        slides,
        published
      };

      try {
        const result = await handleSaveStory(updatedStory);
        
        if (!result.success) {
          throw new Error(result.error || 'Failed to save story');
        }

        // Give the server a moment to settle the disk write
        await new Promise(resolve => setTimeout(resolve, 1000));
        router.push('/admin/stories');
      } catch (error) {
        console.error('Save failed:', error);
        alert('Critical error: Web Story could not be deployed.');
      }
    });
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 9999, background: '#f8fafc', overflowY: 'auto' }}>
      <div style={{ width: '100%', padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <button onClick={() => router.push('/admin/stories')} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#64748b' }}>←</button>
            <h1 style={{ fontSize: '24px', fontWeight: 600, margin: 0 }}>{story ? 'Edit Web Story' : 'New Web Story'}</h1>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => handleSave(false)} disabled={isPending || uploading} style={draftBtn}>Save Draft</button>
          <button onClick={() => handleSave(true)} disabled={isPending || uploading} style={publishBtn}>{isPending ? 'Saving...' : 'Publish Story'}</button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={panelStyle}>
          <h2 style={panelHeader}>Story Details</h2>
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Story Title (max 90 chars)" maxLength={90} style={inputStyle} />
          <input value={slug} onChange={e => setSlug(e.target.value)} placeholder="URL Slug (auto-generated if empty)" style={inputStyle} />
          <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Meta Description for SEO (150-160 chars)" style={{ ...inputStyle, minHeight: '80px' }} />
          <div style={{ display: 'flex', gap: '10px' }}>
            <input value={category} onChange={e => setCategory(e.target.value)} placeholder="Category (e.g. SEO, Technology)" style={{ ...inputStyle, flex: 1, marginBottom: 0 }} />
            <input
              value={tags.join(', ')}
              onChange={e => setTags(e.target.value.split(',').map(t => t.trim()).filter(Boolean))}
              placeholder="Tags (comma separated)"
              style={{ ...inputStyle, flex: 2, marginBottom: 0 }}
            />
          </div>
          
          <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
            <input value={posterImage} onChange={e => setPosterImage(e.target.value)} placeholder="Poster Image URL (Portrait)" style={{ ...inputStyle, flex: 1 }} />
            <label style={uploadBtnStyle}>
              {uploading ? '...' : 'Upload'}
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={async e => {
                if (e.target.files?.[0]) {
                  const url = await uploadFile(e.target.files[0]);
                  if (url) setPosterImage(url);
                }
              }} />
            </label>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
             <input value={author} onChange={e => setAuthor(e.target.value)} placeholder="Author" style={{ ...inputStyle, flex: 1 }} />
             <input value={publisherLogo} onChange={e => setPublisherLogo(e.target.value)} placeholder="Publisher Logo URL" style={{ ...inputStyle, flex: 1 }} />
          </div>
        </div>

        <div style={panelStyle}>
          <h2 style={panelHeader}>Slides</h2>
          {slides.map((slide, index) => (
            <div key={slide.id} style={slideBox}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '14px', fontWeight: 600 }}>
                    Slide {index + 1}
                    {slides.length > 1 && <button onClick={() => removeSlide(index)} style={delBtn}>Remove</button>}
                  </div>
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                    <input value={slide.image} onChange={e => updateSlide(index, 'image', e.target.value)} placeholder="Image URL" style={{ ...inputStyle, marginBottom: 0 }} />
                    <label style={{ ...uploadBtnStyle, marginBottom: 0 }}>
                      {uploading ? '...' : 'Upload'}
                      <input type="file" accept="image/*" style={{ display: 'none' }} onChange={async e => {
                        if (e.target.files?.[0]) {
                          const url = await uploadFile(e.target.files[0]);
                          if (url) updateSlide(index, 'image', url);
                        }
                      }} />
                    </label>
                  </div>
                  <textarea value={slide.text || ''} onChange={e => updateSlide(index, 'text', e.target.value)} placeholder="Overlay Text" style={{ ...inputStyle, minHeight: '60px' }} />
                </div>
                {slide.image && (
                  <div style={{ width: '120px', height: '160px', background: '#e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                    <img src={slide.image} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}
            </div>
          ))}
          <button onClick={addSlide} style={addBtn}>+ Add New Slide</button>
        </div>
      </div>
      </div>
    </div>
  );
}

const draftBtn: React.CSSProperties = { background: '#f1f5f9', color: '#475569', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '14px' };
const publishBtn: React.CSSProperties = { background: '#2563eb', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '14px' };
const panelStyle: React.CSSProperties = { background: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '20px' };
const panelHeader: React.CSSProperties = { margin: '0 0 20px 0', fontSize: '18px', fontWeight: 700 };
const inputStyle: React.CSSProperties = { width: '100%', padding: '12px 16px', marginBottom: '16px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '14px' };
const uploadBtnStyle: React.CSSProperties = { background: '#f1f5f9', padding: '12px 20px', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center' };
const slideBox: React.CSSProperties = { display: 'flex', gap: '20px', padding: '20px', border: '1px solid #e2e8f0', borderRadius: '12px', marginBottom: '16px', background: '#f8fafc' };
const delBtn: React.CSSProperties = { background: '#fee2e2', color: '#dc2626', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' };
const addBtn: React.CSSProperties = { width: '100%', padding: '16px', background: '#f8fafc', border: '2px dashed #cbd5e1', borderRadius: '12px', cursor: 'pointer', fontWeight: 600 };
