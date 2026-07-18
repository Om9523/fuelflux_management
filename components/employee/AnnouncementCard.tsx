'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Bell, Calendar, ShieldCheck, User } from 'lucide-react';
import { Announcement } from '@/lib/mock-db';

interface AnnouncementCardProps {
  announcement: Announcement;
}

export const AnnouncementCard: React.FC<AnnouncementCardProps> = ({ announcement }) => {
  const { title, content, type, date, author } = announcement;

  const getTypeStyles = (t: Announcement['type']) => {
    switch (t) {
      case 'Urgent':
        return {
          bg: 'bg-red-50 border-red-150',
          text: 'text-red-700',
          iconBg: 'bg-red-100 text-red-600',
          icon: <AlertTriangle className="h-4 w-4" />,
          badge: 'bg-red-500 text-white',
        };
      case 'Safety':
        return {
          bg: 'bg-amber-50 border-amber-150',
          text: 'text-amber-700',
          iconBg: 'bg-amber-100 text-amber-600',
          icon: <ShieldCheck className="h-4 w-4" />,
          badge: 'bg-amber-500 text-white',
        };
      case 'Holiday':
        return {
          bg: 'bg-green-50 border-green-150',
          text: 'text-green-700',
          iconBg: 'bg-green-100 text-green-600',
          icon: <Calendar className="h-4 w-4" />,
          badge: 'bg-green-600 text-white',
        };
      default: // General
        return {
          bg: 'bg-blue-50 border-blue-150',
          text: 'text-blue-700',
          iconBg: 'bg-blue-100 text-blue-600',
          icon: <Bell className="h-4 w-4" />,
          badge: 'bg-blue-500 text-white',
        };
    }
  };

  const style = getTypeStyles(type);

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={`border rounded-2xl p-5 ${style.bg} transition-all duration-200 text-left flex gap-4`}
    >
      <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${style.iconBg} shadow-sm`}>
        {style.icon}
      </div>

      <div className="flex flex-col gap-1.5 flex-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h4 className={`text-sm font-extrabold tracking-tight ${style.text}`}>{title}</h4>
          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${style.badge}`}>
            {type}
          </span>
        </div>

        <p className="text-xs font-medium text-slate-600 leading-relaxed mt-0.5">{content}</p>

        <div className="flex items-center gap-4 text-[10px] text-slate-400 font-bold mt-2 pt-2.5 border-t border-slate-100/50">
          <span className="flex items-center gap-1">
            <User className="h-3.5 w-3.5 text-slate-350" />
            {author}
          </span>
          <span className="flex items-center gap-1 font-mono">
            <Calendar className="h-3.5 w-3.5 text-slate-350" />
            {date}
          </span>
        </div>
      </div>
    </motion.div>
  );
};
export default AnnouncementCard;
