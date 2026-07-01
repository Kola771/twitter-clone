'use client';

import { useEffect, useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/axios';
import { Tweet } from '@/types/tweet';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import StickerPicker from './StickerPicker';
import { formatDate } from '@/lib/utils';
import Image from 'next/image';

interface ReplyModalProps {
  tweet: Tweet;
  queryKeys?: string[];
  onClose: () => void;
}

const MAX_CHARS = 280;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/quicktime'];

export default function ReplyModal({ tweet, queryKeys = [], onClose }: ReplyModalProps) {
  const [content, setContent] = useState('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [gifUrl, setGifUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [stickerOpen, setStickerOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const user = useAuthStore((s) => s.user);
  const qc = useQueryClient();
  const router = useRouter();

  useEffect(() => {
    textareaRef.current?.focus();
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

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

  const mutation = useMutation({
    mutationFn: (mediaUrl?: string) =>
      api.post('/tweets', { content: content.trim(), replyToId: tweet.id, mediaUrl }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['replies', tweet.id] });
      qc.invalidateQueries({ queryKey: ['feed'] });
      qc.invalidateQueries({ queryKey: ['tweet', tweet.id] });
      queryKeys.forEach((key) => qc.invalidateQueries({ queryKey: [key] }));
      onClose();
      router.push(`/tweet/${tweet.id}`);
    },
  });

  function handleInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setContent(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }

  async function handleSubmit() {
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

    mutation.mutate(mediaUrl);
  }

  const remaining = MAX_CHARS - content.length;
  const isOverLimit = remaining < 0;
  const isLoading = uploading || mutation.isPending;
  const hasMedia = !!(mediaPreview || gifUrl);

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm pt-16 px-4"
      onClick={(e) => { if (e.target === backdropRef.current) onClose(); }}
    >
      <div className="bg-slate-900 rounded-2xl w-full max-w-lg shadow-2xl border border-slate-700">
        {/* Header */}
        <div className="flex items-center px-4 py-3 border-b border-slate-800">
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-800 transition-colors mr-4"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <span className="text-sm text-sky-400 font-medium">Répondre</span>
        </div>

        <div className="p-4">
          {/* Tweet original */}
          <div className="flex gap-3 mb-4">
            <div className="flex flex-col items-center">
              <Avatar src={tweet.author.avatarUrl} alt={tweet.author.name} size="md" />
              <div className="w-0.5 flex-1 bg-slate-700 mt-2 mb-1 min-h-[24px]" />
            </div>
            <div className="flex-1 pb-2">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="font-bold text-sm">{tweet.author.name}</span>
                <span className="text-slate-400 text-sm">@{tweet.author.username}</span>
                <span className="text-slate-500 text-sm">· {formatDate(tweet.createdAt)}</span>
              </div>
              <p className="text-slate-300 text-sm">{tweet.content}</p>
              <p className="text-slate-500 text-sm mt-2">
                En réponse à <span className="text-sky-400">@{tweet.author.username}</span>
              </p>
            </div>
          </div>

          {/* Zone de saisie */}
          <div className="flex gap-3">
            <Avatar src={user?.avatarUrl} alt={user?.name ?? 'You'} size="md" />
            <div className="flex-1">
              <textarea
                ref={textareaRef}
                value={content}
                onChange={handleInput}
                placeholder="Rédige ta réponse…"
                rows={3}
                className="w-full bg-transparent text-slate-100 placeholder:text-slate-500 text-lg resize-none focus:outline-none"
              />

              {/* Media preview */}
              {hasMedia && (
                <div className="relative rounded-2xl overflow-hidden border border-slate-700 mt-2 max-h-48">
                  {gifUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={gifUrl} alt="GIF" className="w-full object-cover max-h-48" />
                  ) : mediaFile?.type.startsWith('video/') ? (
                    <video src={mediaPreview!} controls className="w-full max-h-48 object-cover" />
                  ) : (
                    <Image
                      src={mediaPreview!}
                      alt="Aperçu"
                      width={400}
                      height={300}
                      unoptimized
                      className="w-full object-cover max-h-48"
                    />
                  )}
                  <button
                    type="button"
                    onClick={clearMedia}
                    className="absolute top-2 right-2 bg-black/70 hover:bg-black/90 text-white rounded-full w-6 h-6 flex items-center justify-center transition-colors"
                  >
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-none stroke-current stroke-2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sticker picker contenu */}
        {stickerOpen && (
          <div className="px-4 pb-3 flex">
            <StickerPicker
              contained
              onEmojiSelect={handleEmojiSelect}
              onGifSelect={handleGifSelect}
              onClose={() => setStickerOpen(false)}
            />
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-800">
          <div className="flex items-center gap-1">
            {/* Sticker / Emoji button */}
            <button
              type="button"
              onClick={() => setStickerOpen((o) => !o)}
              disabled={isLoading}
              className={`p-1.5 rounded-full transition-colors disabled:opacity-50 ${stickerOpen ? 'text-sky-400 bg-sky-400/10' : 'text-sky-400 hover:bg-sky-400/10'}`}
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
              className="p-1.5 rounded-full text-sky-400 hover:bg-sky-400/10 transition-colors disabled:opacity-50"
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

            <span className={`text-sm font-medium ml-1 ${isOverLimit ? 'text-red-400' : remaining <= 20 ? 'text-yellow-400' : 'text-slate-400'}`}>
              {remaining}
            </span>
          </div>

          <Button
            size="sm"
            loading={isLoading}
            disabled={(!content.trim() && !hasMedia) || isOverLimit}
            onClick={handleSubmit}
          >
            {uploading ? 'Upload…' : 'Répondre'}
          </Button>
        </div>
      </div>
    </div>
  );
}
