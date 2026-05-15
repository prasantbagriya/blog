'use server';

import { deletePost, deleteStory, savePost, saveStory, Post } from './db';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { writeFile, access, mkdir } from 'fs/promises';
import path from 'path';

export async function handleAdminLogin(password: string) {
  const masterPassword = process.env.ADMIN_PASSWORD || 'admin123';

  if (password === masterPassword) {
    const cookieStore = await cookies();
    cookieStore.set('admin_session', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });
    return { success: true };
  }
  return { success: false, error: 'Unauthorized' };
}

export async function handleSavePost(post: Post) {
  try {
    await savePost(post);
    revalidatePath('/admin');
    revalidatePath('/blog');
    revalidatePath(`/blog/${post.slug}`);
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Failed to save post:', error);
    return { success: false, error: 'Failed to save post' };
  }
}

export async function handleSaveStory(story: any) {
  try {
    await saveStory(story);
    revalidatePath('/admin/stories');
    revalidatePath('/stories');
    revalidatePath(`/stories/${story.slug}`);
    revalidatePath('/');
    return { success: true, story };
  } catch (error) {
    console.error('Failed to save story:', error);
    return { success: false, error: 'Failed to save story' };
  }
}

export async function handleDeletePost(id: string) {
  try {
    await deletePost(id);
    revalidatePath('/admin');
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete post:', error);
    return { success: false, error: 'Failed to delete post' };
  }
}

export async function handleDeleteStory(id: string) {
  try {
    await deleteStory(id);
    revalidatePath('/admin/stories');
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete story:', error);
    return { success: false, error: 'Failed to delete story' };
  }
}

export async function handleUpload(formData: FormData) {
  try {
    const file = formData.get('file') as File | null;
    if (!file) {
      return { success: false, error: 'No file uploaded' };
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.name);
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
  } catch (error) {
    console.error('Upload Error:', error);
    return { success: false, error: 'Upload failed' };
  }
}
