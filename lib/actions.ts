'use server';

import { deletePost, deleteStory, savePost, saveStory, Post } from './db';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { writeFile, access, mkdir } from 'fs/promises';
import path from 'path';
import { randomBytes } from 'crypto';
import { activeSessions, SESSION_TTL, checkAdminAuth } from './auth';

export async function handleAdminLogin(password: string) {
  const masterPassword = process.env.ADMIN_PASSWORD || 'admin123';

  if (password === masterPassword) {
    const sessionToken = randomBytes(32).toString('hex');
    activeSessions.set(sessionToken, Date.now() + SESSION_TTL);

    const cookieStore = await cookies();
    cookieStore.set('admin_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });
    return { success: true };
  }
  return { success: false, error: 'Unauthorized' };
}

export async function handleSavePost(post: Post) {
  try {
    await checkAdminAuth(); // 🔒 Secure action with unified verification
    await savePost(post);
    revalidatePath('/admin');
    revalidatePath('/blog');
    revalidatePath(`/blog/${post.slug}`);
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    console.error('Failed to save post:', error);
    return { success: false, error: error.message || 'Failed to save post' };
  }
}

export async function handleSaveStory(story: any) {
  try {
    await checkAdminAuth(); // 🔒 Secure action with unified verification
    await saveStory(story);
    revalidatePath('/admin/stories');
    revalidatePath('/stories');
    revalidatePath(`/stories/${story.slug}`);
    revalidatePath('/');
    return { success: true, story };
  } catch (error: any) {
    console.error('Failed to save story:', error);
    return { success: false, error: error.message || 'Failed to save story' };
  }
}

export async function handleDeletePost(id: string) {
  try {
    await checkAdminAuth(); // 🔒 Secure action with unified verification
    await deletePost(id);
    revalidatePath('/admin');
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    console.error('Failed to delete post:', error);
    return { success: false, error: error.message || 'Failed to delete post' };
  }
}

export async function handleDeleteStory(id: string) {
  try {
    await checkAdminAuth(); // 🔒 Secure action with unified verification
    await deleteStory(id);
    revalidatePath('/admin/stories');
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    console.error('Failed to delete story:', error);
    return { success: false, error: error.message || 'Failed to delete story' };
  }
}

export async function handleUpload(formData: FormData) {
  try {
    await checkAdminAuth(); // 🔒 Secure action with unified verification
    
    const file = formData.get('file') as File | null;
    if (!file) {
      return { success: false, error: 'No file uploaded' };
    }

    // 🔒 Security: Validate file extension
    const extension = path.extname(file.name).toLowerCase();
    const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'];
    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      return { success: false, error: 'File type not allowed. Please upload images only.' };
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const filename = 'media-' + uniqueSuffix + extension;

    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    
    try {
      await access(uploadDir);
    } catch {
      await mkdir(uploadDir, { recursive: true });
    }

    const filepath = path.join(uploadDir, filename);
    await writeFile(filepath, buffer);

    const fileUrl = `/uploads/${filename}`;
    return { success: true, url: fileUrl };
  } catch (error: any) {
    console.error('Upload Error:', error);
    return { success: false, error: error.message || 'Upload failed' };
  }
}
