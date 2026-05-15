import { promises as fs } from 'fs';
import path from 'path';
import { existsSync, readFileSync } from 'fs';

export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  metaDescription: string;
  seoTitle?: string;
  ogTitle?: string;
  ogDescription?: string;
  canonicalUrl?: string;
  keywords?: string;
  coverImage: string;
  videoUrl?: string;
  author: string;
  authorBio: string;
  authorImage: string;
  authorJobTitle: string; 
  authorExperienceYears?: number; 
  authorAwards?: string[]; 
  authorAlumniOf?: { name: string; sameAs: string }[]; 
  authorSocials: {
    twitter?: string;
    linkedin?: string;
    website?: string; 
  };
  date: string;
  lastModified?: string;
  category: string;
  tags: string[];
  published: boolean;
  readingTime?: number;
  seoScore?: number;
  isSponsored?: boolean;
  isAiAssisted?: boolean;
  factCheckedBy?: string;
  factCheckerRole?: string; 
  authorKnowsAbout?: { name: string; sameAs: string }[]; 
  keyTakeaways?: string[];
  sources?: { title: string; url: string; type: 'primary' | 'secondary' }[]; 
  researchMethodology?: string; 
  reviewCycleDays?: number;
  nextReviewDate?: string;
  faqs?: { question: string; answer: string }[]; 
  searchIntent?: 'informational' | 'transactional' | 'commercial' | 'navigational'; 
  isPillarPage?: boolean;
  semanticMentions?: { name: string; sameAs: string }[]; 
  integrityHash?: string; 
}

export interface StorySlide {
  id: string;
  image: string;
  video?: string;
  text?: string;
}

export interface WebStory {
  id: string;
  title: string;               
  slug: string;
  description: string;         
  category: string;            
  tags: string[];              
  posterImage: string;         
  squarePoster?: string;       
  landscapePoster?: string;    
  videoUrl?: string;
  date: string;                
  lastModified?: string;       
  author: string;
  authorBio?: string;          
  authorImage?: string;        
  authorSocials?: {            
    twitter?: string;
    linkedin?: string;
    website?: string;
  };
  publisherLogo: string;       
  slides: StorySlide[];
  published: boolean;
  seoTitle?: string;           
  metaDescription?: string;    
  isSponsored?: boolean;       
  textLength?: number;         
}

// ✅ ULTRA-STABLE PATHS
const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_PATH = path.join(DATA_DIR, 'posts.json');
const STORIES_PATH = path.join(DATA_DIR, 'stories.json');

// Cache posts in memory to avoid disk I/O on every request
// We refresh this cache every 10 seconds to balance speed and sync
let cachedPosts: Post[] | null = null;
let cachedStories: WebStory[] | null = null;
let lastRead = 0;
const CACHE_WINDOW = 10000; // 10 seconds

async function fastWrite(filePath: string, data: any) {
  try {
    const json = JSON.stringify(data, null, 2);
    await fs.writeFile(filePath, json, 'utf-8');
    // Clear cache to force next read to be fresh
    lastRead = 0;
  } catch (err) {
    console.error('CRITICAL WRITE ERROR:', err);
  }
}

async function loadData<T>(filePath: string): Promise<T[]> {
  const now = Date.now();
  
  // Use memory cache if available and fresh
  if (filePath === DB_PATH && cachedPosts && (now - lastRead < CACHE_WINDOW)) {
    return cachedPosts as unknown as T[];
  }
  if (filePath === STORIES_PATH && cachedStories && (now - lastRead < CACHE_WINDOW)) {
    return cachedStories as unknown as T[];
  }

  try {
    // If file doesn't exist, return empty (don't create here to save I/O)
    if (!existsSync(filePath)) return [];
    
    const raw = await fs.readFile(filePath, 'utf-8');
    const data = JSON.parse(raw || '[]');
    
    if (filePath === DB_PATH) cachedPosts = data;
    if (filePath === STORIES_PATH) cachedStories = data;
    lastRead = now;
    
    return data;
  } catch (err) {
    return [];
  }
}

export async function getStories(): Promise<WebStory[]> {
  return await loadData<WebStory>(STORIES_PATH);
}

export async function getStoryBySlug(slug: string): Promise<WebStory | undefined> {
  const stories = await getStories();
  return stories.find(s => s.slug === slug);
}

export async function saveStory(story: WebStory) {
  const stories = await getStories();
  const index = stories.findIndex(s => s.id === story.id);
  if (index > -1) stories[index] = story;
  else stories.push(story);
  await fastWrite(STORIES_PATH, stories);
}

export async function deleteStory(id: string) {
  const stories = await getStories();
  const filtered = stories.filter(s => s.id !== id);
  await fastWrite(STORIES_PATH, filtered);
}

export async function getPosts(): Promise<Post[]> {
  return await loadData<Post>(DB_PATH);
}

export async function getPostBySlug(slug: string): Promise<Post | undefined> {
  const posts = await getPosts();
  return posts.find(p => p.slug === slug);
}

export async function savePost(post: Post) {
  const posts = await getPosts();
  const index = posts.findIndex(p => p.id === post.id);
  const updatedPost = { ...post, lastModified: new Date().toISOString().split('T')[0] };
  if (index > -1) posts[index] = updatedPost;
  else posts.push(updatedPost);
  await fastWrite(DB_PATH, posts);
}

export async function deletePost(id: string) {
  const posts = await getPosts();
  const filtered = posts.filter(p => p.id !== id);
  await fastWrite(DB_PATH, filtered);
}
