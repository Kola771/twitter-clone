'use client';

import { useState, useEffect, useRef } from 'react';

const EMOJI_CATEGORIES = [
  {
    label: '😀', name: 'Smileys',
    emojis: ['😀','😂','🤣','😊','😍','🥰','😘','😎','🤔','😴','🥳','🤩','😢','😭','😡','🤬','😱','🤗','😏','🙄','😇','🤤','🥺','😤','🤯','🥴','😵','🤪','😜','😝','🤑','🫡','🫶','😆','😅','🙂','🙃','😉','😇','🥲'],
  },
  {
    label: '👋', name: 'Gestes',
    emojis: ['👋','👍','👎','👏','🙏','💪','🤞','👌','✌️','🤙','👊','✊','🖐️','🤚','🫂','🙌','🤲','👐','🤝','💅','🫰','☝️','🤌','🤏','🦾','💃','🕺'],
  },
  {
    label: '❤️', name: 'Coeurs',
    emojis: ['❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔','❤️‍🔥','💕','💞','💓','💗','💖','💘','💝','💟','❣️','🫀','💌','💋','😻'],
  },
  {
    label: '🐶', name: 'Animaux',
    emojis: ['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐮','🐷','🐸','🐵','🐔','🐧','🦋','🐠','🦄','🐙','🦈','🐬','🦩','🦜','🐢','🦎','🐍','🦅','🦉'],
  },
  {
    label: '🍕', name: 'Nourriture',
    emojis: ['🍕','🍔','🍟','🌮','🌯','🍜','🍣','🍦','🍰','🎂','🍩','🍪','🥤','☕','🍺','🍻','🥂','🍷','🥐','🍳','🧇','🥗','🥘','🍲','🍛','🫕','🧆','🥙','🍱','🍜'],
  },
  {
    label: '⚽', name: 'Sports',
    emojis: ['⚽','🏀','🏈','⚾','🎾','🏐','🎱','🏓','🎮','🎯','🎲','🏆','🥇','🥈','🥉','🎪','🎭','🎨','🎵','🎸','🎹','🎤','🎬','🎠','🎡','🎢','🃏','🎳'],
  },
  {
    label: '✨', name: 'Symboles',
    emojis: ['✨','💫','⭐','🌟','💥','🔥','🌊','💧','🌈','☀️','🌙','⚡','❄️','🌪️','🎉','🎊','🎈','🎁','💯','✅','❌','🆕','💬','💭','🗯️','🔔','⚠️','♻️','🚀','🛸'],
  },
  {
    label: '🚗', name: 'Voyage',
    emojis: ['🚗','🚕','🚌','🚎','🏎️','🚓','🚑','🚒','✈️','🚀','🛸','🚁','⛵','🚤','🚂','🏔️','🏖️','🏕️','🌍','🌎','🌏','🏙️','🌃','🌄','🌅','🏠','🏰','🗼','🗽','⛩️'],
  },
];

interface GifItem {
  id: string;
  title: string;
  url: string;
}

interface StickerPickerProps {
  onEmojiSelect: (emoji: string) => void;
  onGifSelect: (url: string) => void;
  onClose: () => void;
  /** Rendu inline dans un conteneur (pas de position absolue) */
  contained?: boolean;
}

export default function StickerPicker({ onEmojiSelect, onGifSelect, onClose, contained }: StickerPickerProps) {
  const [tab, setTab] = useState<'emoji' | 'gif'>('emoji');
  const [activeCategory, setActiveCategory] = useState(0);
  const [gifQuery, setGifQuery] = useState('');
  const [gifs, setGifs] = useState<GifItem[]>([]);
  const [gifLoading, setGifLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const apiKey = process.env.NEXT_PUBLIC_GIPHY_API_KEY;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onClose]);

  useEffect(() => {
    if (tab !== 'gif' || !apiKey) return;
    setGifLoading(true);
    const timer = setTimeout(async () => {
      try {
        const endpoint = gifQuery
          ? `https://api.giphy.com/v1/gifs/search?api_key=${apiKey}&q=${encodeURIComponent(gifQuery)}&limit=24&rating=g`
          : `https://api.giphy.com/v1/gifs/trending?api_key=${apiKey}&limit=24&rating=g`;
        const res = await fetch(endpoint);
        const json = await res.json();
        setGifs(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (json.data ?? []).map((g: any) => ({
            id: g.id,
            title: g.title,
            url: g.images.fixed_height.url,
          }))
        );
      } catch {
        setGifs([]);
      } finally {
        setGifLoading(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [gifQuery, tab, apiKey]);

  return (
    <div
      ref={contained ? undefined : ref}
      className={
        contained
          ? 'w-80 bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-lg'
          : 'absolute bottom-full mb-2 left-0 z-50 w-80 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden'
      }
    >
      {/* Tabs */}
      <div className="flex border-b border-slate-800">
        {(['emoji', 'gif'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
              tab === t
                ? 'text-sky-400 border-b-2 border-sky-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t === 'emoji' ? 'Emoji' : 'GIF'}
          </button>
        ))}
      </div>

      {tab === 'emoji' ? (
        <>
          {/* Category strip */}
          <div className="flex gap-0.5 px-2 py-1.5 border-b border-slate-800 overflow-x-auto [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
            {EMOJI_CATEGORIES.map((cat, i) => (
              <button
                key={cat.name}
                title={cat.name}
                onClick={() => setActiveCategory(i)}
                className={`flex-shrink-0 text-lg w-8 h-8 rounded-lg transition-colors ${
                  activeCategory === i ? 'bg-slate-700' : 'hover:bg-slate-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Emoji grid */}
          <div className="grid grid-cols-8 gap-0.5 p-2 h-48 overflow-y-auto [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
            {EMOJI_CATEGORIES[activeCategory].emojis.map((emoji, i) => (
              <button
                key={`${emoji}-${i}`}
                onClick={() => onEmojiSelect(emoji)}
                className="text-xl w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-800 transition-colors"
              >
                {emoji}
              </button>
            ))}
          </div>
        </>
      ) : (
        <>
          {/* GIF search */}
          <div className="px-3 py-2 border-b border-slate-800">
            <input
              type="text"
              placeholder="Rechercher un GIF…"
              value={gifQuery}
              onChange={(e) => setGifQuery(e.target.value)}
              autoFocus
              className="w-full bg-slate-800 text-slate-100 placeholder:text-slate-500 text-sm rounded-full px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>

          {/* GIF grid */}
          <div className="h-56 overflow-y-auto p-2">
            {!apiKey ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 text-xs text-center gap-1 px-4">
                <span>Configure</span>
                <code className="text-sky-400 bg-slate-800 px-1.5 py-0.5 rounded">NEXT_PUBLIC_GIPHY_API_KEY</code>
                <span>dans .env.local</span>
              </div>
            ) : gifLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="w-6 h-6 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : gifs.length === 0 ? (
              <div className="flex items-center justify-center h-full text-slate-400 text-sm">
                Aucun GIF trouvé
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-1.5">
                {gifs.map((gif) => (
                  <button
                    key={gif.id}
                    onClick={() => { onGifSelect(gif.url); onClose(); }}
                    className="rounded-xl overflow-hidden hover:opacity-80 transition-opacity"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={gif.url}
                      alt={gif.title}
                      className="w-full h-24 object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
