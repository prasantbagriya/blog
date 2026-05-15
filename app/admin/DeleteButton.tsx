'use client';

import { useState } from 'react';
import { handleDeletePost, handleDeleteStory } from '@/lib/actions';

interface DeleteButtonProps {
  id: string;
  type: 'post' | 'story';
}

export default function DeleteButton({ id, type }: DeleteButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const onDelete = async () => {
    if (!confirm('Are you sure you want to delete this? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    try {
      let result;
      if (type === 'post') {
        result = await handleDeletePost(id);
      } else {
        result = await handleDeleteStory(id);
      }
      
      if (result.success) {
        window.location.reload();
      } else {
        alert(result.error || 'Error deleting item');
        setIsDeleting(false);
      }
    } catch (err) {
      alert('Connection error');
      setIsDeleting(false);
    }
  };

  return (
    <button 
      onClick={onDelete}
      disabled={isDeleting}
      aria-label={isDeleting ? `Deleting...` : `Delete ${type}`}
      style={{ 
        color: '#ef4444', 
        background: 'none', 
        border: 'none', 
        padding: '0.5rem 0', 
        cursor: 'pointer', 
        fontSize: '13px', 
        fontWeight: 600,
        opacity: isDeleting ? 0.5 : 1,
        minWidth: '60px',
        textAlign: 'left'
      }}
    >
      {isDeleting ? 'Deleting...' : 'Delete'}
    </button>
  );
}
