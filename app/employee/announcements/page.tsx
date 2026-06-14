'use client';

import React, { useEffect, useState } from 'react';
import { Megaphone } from 'lucide-react';
import { AnnouncementCard } from '@/components/employee/AnnouncementCard';
import { useEmployeeStore } from '@/stores/employee.store';

export default function AnnouncementsPage() {
  const { announcements, fetchAnnouncements, isLoadingAnnouncements } = useEmployeeStore();
  const [filter, setFilter] = useState<'All' | 'Urgent' | 'Safety' | 'Holiday' | 'General'>('All');

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  const filteredAnnouncements = announcements.filter((ann) => {
    if (filter === 'All') return true;
    return ann.type === filter;
  });

  const categories: ('All' | 'Urgent' | 'Safety' | 'Holiday' | 'General')[] = [
    'All',
    'Urgent',
    'Safety',
    'Holiday',
    'General',
  ];

  return (
    <div className="flex flex-col gap-6 text-left font-sans">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
            <Megaphone className="h-5.5 w-5.5 text-orange-500 animate-bounce" />
            Company Announcements Board
          </h1>
          <p className="text-xs text-slate-400 font-semibold mt-1">Check critical shift alerts, safety mandates, and holidays calendar updates.</p>
        </div>

        {/* Tab Filters */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl self-start sm:self-auto border border-slate-200/50">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider rounded-lg transition-all cursor-pointer outline-none ${
                filter === cat
                  ? 'bg-white text-orange-500 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {isLoadingAnnouncements ? (
        <div className="min-h-[300px] w-full flex items-center justify-center bg-transparent">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-orange-500" />
        </div>
      ) : filteredAnnouncements.length === 0 ? (
        <div className="bg-white border border-orange-100 rounded-2xl p-12 text-center text-slate-450 font-semibold text-xs">
          No notices found in the "{filter}" category.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filteredAnnouncements.map((ann) => (
            <AnnouncementCard key={ann.id} announcement={ann} />
          ))}
        </div>
      )}
    </div>
  );
}
