'use client';

import { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/axios';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import StickerPicker from './StickerPicker';
import { CreateTweetRequest } from '@/types/tweet';
import Image from 'next/image';

const MAX_CHARS = 280;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/quicktime'];

interface TweetFormProps {
  placeholder?: string;
  replyToId?: string;
  queryKeys?: string[];
  onSuccess?: () => void;
}

export default function TweetForm({
  placeholder = "Quoi de neuf ?",
  replyToId,
  queryKeys = ['feed'],
  onSuccess,
}: TweetFormProps) {
  const [content, setContent] = useState('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [gifUrl, setGifUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [stickerOpen, setStickerOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const user = useAuthStore((s) => s.user);
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: (body: CreateTweetRequest) => api.post('/tweets', body),
    onSuccess: () => {
      setContent('');
      clearMedia();
      queryKeys.forEach((key) => qc.invalidateQueries({ queryKey: [key] }));
      onSuccess?.();
    },
  });

  function clearMedia() {
    setMediaFile(null);
    if (mediaPreview) URL.revokeObjectURL(mediaPreview);
    setMediaPreview(null);
    setGifUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ALLOWED_TYPES.includes(file.type)) {
      alert('Format non supporté. Utilise jpg, png, gif, webp, mp4 ou mov.');
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      alert('Fichier trop volumineux (max 50 Mo).');
      return;
    }
    clearMedia();
    setMediaFile(file);
    setMediaPreview(URL.createObjectURL(file));
  }

  function handleEmojiSelect(emoji: string) {
    const el = textareaRef.current;
    if (!el) {
      setContent((c) => c + emoji);
      return;
    }
    const start = el.selectionStart ?? content.length;
    const end = el.selectionEnd ?? content.length;
    const next = content.slice(0, start) + emoji + content.slice(end);
    setContent(next);
    setTimeout(() => {
      el.focus();
      el.selectionStart = el.selectionEnd = start + emoji.length;
    }, 0);
  }

  function handleGifSelect(url: string) {
    clearMedia();
    setGifUrl(url);
  }

  function handleInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setContent(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if ((!content.trim() && !hasMedia) || content.length > MAX_CHARS) return;

    let mediaUrl: string | undefined;

    if (gifUrl) {
      mediaUrl = gifUrl;
    } else if (mediaFile) {
      setUploading(true);
      try {
        const formData = new FormData();
        formData.append('file', mediaFile);
        const res = await api.post<{ url: string }>('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        mediaUrl = res.data.url;
      } catch {
        alert("Échec de l'upload du média. Réessaie.");
        setUploading(false);
        return;
      } finally {
        setUploading(false);
      }
    }

    mutation.mutate({ content: content.trim() || undefined, replyToId, mediaUrl });
  }

  const remaining = MAX_CHARS - content.length;
  const isOverLimit = remaining < 0;
  const isNearLimit = remaining <= 20;
  const isLoading = uploading || mutation.isPending;
  const hasMedia = !!(mediaPreview || gifUrl);

  return (
    <form onSubmit={handleSubmit} className="flex gap-3 px-4 py-4 border-b border-slate-800">
      <Avatar src={user?.avatarUrl} alt={user?.name ?? 'You'} size="md" />

      <div className="flex-1 flex flex-col gap-3">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleInput}
          placeholder={placeholder}
          rows={1}
          className="w-full bg-transparent text-slate-100 placeholder:text-slate-500 text-lg resize-none focus:outline-none min-h-[2.5rem]"
        />

        {/* Media preview */}
        {hasMedia && (
          <div className="relative rounded-2xl overflow-hidden border border-slate-700 max-h-72">
            {gifUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={gifUrl} alt="GIF" className="w-full object-cover max-h-72" />
            ) : mediaFile?.type.startsWith('video/') ? (
              <video src={mediaPreview!} controls className="w-full max-h-72 object-cover" />
            ) : (
              <Image
                src={mediaPreview!}
                alt="Aperçu"
                width={600}
                height={400}
                unoptimized
                className="w-full object-cover max-h-72"
              />
            )}
            <button
              type="button"
              onClick={clearMedia}
              className="absolute top-2 right-2 bg-black/70 hover:bg-black/90 text-white rounded-full w-7 h-7 flex items-center justify-center transition-colors"
              aria-label="Supprimer le média"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        <div className="flex items-center justify-between border-t border-slate-800 pt-3">
          <div className="relative flex items-center gap-1">
            {/* Sticker / Emoji button */}
            <button
              type="button"
              onClick={() => setStickerOpen((o) => !o)}
              disabled={isLoading}
              className="p-2 rounded-full text-sky-400 hover:bg-sky-400/10 transition-colors disabled:opacity-50"
              aria-label="Emoji et GIFs"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2">
                <circle cx="12" cy="12" r="10" />
                <path strokeLinecap="round" d="M8 13s1.5 2 4 2 4-2 4-2" />
                <line x1="9" y1="9" x2="9.01" y2="9" strokeWidth="3" strokeLinecap="round" />
                <line x1="15" y1="9" x2="15.01" y2="9" strokeWidth="3" strokeLinecap="round" />
              </svg>
            </button>

            {/* Media button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className="p-2 rounded-full text-sky-400 hover:bg-sky-400/10 transition-colors disabled:opacity-50"
              aria-label="Ajouter une image ou vidéo"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp,video/mp4,video/quicktime"
              className="hidden"
              onChange={handleFileChange}
            />

            {/* Sticker picker */}
            {stickerOpen && (
              <StickerPicker
                onEmojiSelect={handleEmojiSelect}
                onGifSelect={handleGifSelect}
                onClose={() => setStickerOpen(false)}
              />
            )}
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`text-sm font-medium ${
                isOverLimit ? 'text-red-400' : isNearLimit ? 'text-yellow-400' : 'text-slate-400'
              }`}
            >
              {remaining}
            </span>
            <Button
              type="submit"
              size="sm"
              loading={isLoading}
              disabled={(!content.trim() && !hasMedia) || isOverLimit}
            >
              {uploading ? 'Upload…' : 'Tweeter'}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
