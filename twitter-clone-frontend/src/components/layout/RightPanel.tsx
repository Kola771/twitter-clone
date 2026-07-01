'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RightPanel() {
  const [query, setQuery] = useState('');
  const router = useRouter();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/explore?q=${encodeURIComponent(query.trim())}`);
    }
  }

  return (
    <aside className="hidden lg:flex flex-col w-72 xl:w-80 px-4 py-3 h-screen sticky top-0 gap-4">
      {/* Search */}
      <form onSubmit={handleSearch}>
        <div className="relative">
          <svg
            viewBox="0 0 24 24"
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 fill-none stroke-slate-400 stroke-2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803a7.5 7.5 0 0010.607 0z" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher"
            className="w-full bg-slate-800 rounded-full py-3 pl-10 pr-4 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
        </div>
      </form>

      {/* Trends placeholder */}
      <div className="bg-slate-900 rounded-2xl p-4">
        <h2 className="text-lg font-bold mb-4">Tendances</h2>
        <p className="text-slate-400 text-sm">Les tendances apparaîtront ici.</p>
      </div>

      {/* Who to follow placeholder */}
      <div className="bg-slate-900 rounded-2xl p-4">
        <h2 className="text-lg font-bold mb-4">Qui suivre</h2>
        <p className="text-slate-400 text-sm">Les suggestions apparaîtront ici.</p>
      </div>
    </aside>
  );
}
