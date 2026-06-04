'use client';

import React, { useEffect, useState } from 'react';
import { useAdminStore } from '@/stores/admin.store';
import { SupportTicket } from '@/lib/mock-db';
import { MessageSquare, Clock, ShieldAlert, Send, User, ChevronDown, Check, Ban } from 'lucide-react';
import { toast } from '@/components/feedback/Toast';

export default function AdminSupportPage() {
  const { supportTickets, fetchSupportTickets, replySupportTicket, isLoading } = useAdminStore();
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | SupportTicket['status']>('all');

  useEffect(() => {
    fetchSupportTickets();
  }, []);

  const filteredTickets = supportTickets.filter((ticket) => {
    return statusFilter === 'all' || ticket.status === statusFilter;
  });

  // Set default selected ticket if none
  useEffect(() => {
    if (filteredTickets.length > 0 && !selectedTicketId) {
      setSelectedTicketId(filteredTickets[0].id);
    }
  }, [filteredTickets, selectedTicketId]);

  const activeTicket = supportTickets.find((t) => t.id === selectedTicketId);

  const handlePostReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTicket || !replyMessage.trim()) return;

    try {
      // Set status to in_progress upon reply
      const nextStatus = activeTicket.status === 'open' ? 'in_progress' : activeTicket.status;
      await replySupportTicket(activeTicket.id, replyMessage.trim(), nextStatus);
      setReplyMessage('');
      toast.success('Response dispatched to ticket stream.');
      fetchSupportTickets();
    } catch (e) {
      toast.error('Failed to post reply.');
    }
  };

  const handleUpdateStatus = async (status: SupportTicket['status']) => {
    if (!activeTicket) return;
    try {
      await replySupportTicket(activeTicket.id, '', status);
      toast.success(`Ticket status updated to "${status}"`);
      fetchSupportTickets();
    } catch (e) {
      toast.error('Failed to update status.');
    }
  };

  const getPriorityColor = (priority: string) => {
    const prs = {
      low: 'bg-blue-50 text-blue-600 border-blue-100',
      medium: 'bg-amber-50 text-amber-600 border-amber-100',
      high: 'bg-orange-50 text-orange-600 border-orange-100',
      urgent: 'bg-rose-50 text-rose-600 border-rose-100 animate-pulse',
    };
    return (prs as any)[priority] || 'bg-slate-50 text-slate-600';
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      open: 'bg-amber-50 text-amber-600 border-amber-100',
      in_progress: 'bg-blue-50 text-blue-600 border-blue-100',
      waiting: 'bg-indigo-50 text-indigo-600 border-indigo-100',
      resolved: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      closed: 'bg-slate-100 text-slate-500 border-slate-200',
    };
    return (badges as any)[status] || 'bg-slate-50';
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
          Client Support Resolve Queue
        </h1>
        <p className="text-xs text-slate-500 font-semibold mt-0.5">
          Moderate complaints, assign service managers, post replies, and close customer threads.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Queue List */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs flex flex-col">
          {/* Header Filters */}
          <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center text-xs font-bold text-slate-500">
            <span>TICKET QUEUE</span>
            <select
              value={statusFilter}
              onChange={(e: any) => setStatusFilter(e.target.value)}
              className="bg-transparent border-0 outline-none text-slate-800 font-extrabold cursor-pointer"
            >
              <option value="all">All statuses</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="waiting">Waiting</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center text-xs font-bold text-slate-400">Syncing tickets...</div>
            ) : filteredTickets.length === 0 ? (
              <div className="p-8 text-center text-xs font-bold text-slate-400">No support tickets match filters.</div>
            ) : (
              filteredTickets.map((ticket) => (
                <button
                  key={ticket.id}
                  onClick={() => setSelectedTicketId(ticket.id)}
                  className={`w-full p-4 text-left hover:bg-slate-50 transition-colors space-y-2.5 outline-none cursor-pointer border-l-4 border-transparent
                    ${selectedTicketId === ticket.id ? 'bg-orange-50/40 border-l-orange-500' : ''}
                  `}
                >
                  <div className="flex justify-between items-start">
                    <span className="text-[9px] font-mono font-bold text-slate-400">ID: {ticket.id}</span>
                    <div className="flex gap-1.5 items-center">
                      <span className={`text-[8.5px] font-extrabold px-1.5 py-0.5 border rounded-full uppercase ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority}
                      </span>
                      <span className={`text-[8.5px] font-extrabold px-1.5 py-0.5 border rounded-full uppercase ${getStatusBadge(ticket.status)}`}>
                        {ticket.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  <span className="text-xs font-extrabold text-slate-800 block truncate">
                    {ticket.subject}
                  </span>

                  <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold">
                    <span>{ticket.userName} ({ticket.userRole.replace('_', ' ')})</span>
                    <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right: Message Stream */}
        <div className="lg:col-span-8">
          {activeTicket ? (
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs flex flex-col h-[560px]">
              {/* Active Ticket Metadata Header */}
              <div className="p-5 border-b border-slate-100 flex justify-between items-start bg-slate-50/60 shrink-0">
                <div className="space-y-1.5 max-w-[70%]">
                  <h3 className="text-sm font-extrabold text-slate-900 leading-tight">
                    {activeTicket.subject}
                  </h3>
                  <div className="flex flex-wrap gap-2 text-[10.5px] font-semibold text-slate-500">
                    <span>From: <strong className="text-slate-700">{activeTicket.userName}</strong> ({activeTicket.userEmail})</span>
                    <span>•</span>
                    <span>Role: <span className="uppercase text-slate-700 font-bold">{activeTicket.userRole.replace('_', ' ')}</span></span>
                  </div>
                </div>

                <div className="flex gap-2 shrink-0">
                  {activeTicket.status !== 'resolved' && activeTicket.status !== 'closed' && (
                    <button
                      onClick={() => handleUpdateStatus('resolved')}
                      className="flex items-center gap-1 px-3 py-1.5 text-[10.5px] font-extrabold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 rounded-xl cursor-pointer transition-colors outline-none"
                    >
                      <Check className="h-3.5 w-3.5" />
                      Mark Resolved
                    </button>
                  )}
                  {activeTicket.status !== 'closed' && (
                    <button
                      onClick={() => handleUpdateStatus('closed')}
                      className="flex items-center gap-1 px-3 py-1.5 text-[10.5px] font-extrabold text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl cursor-pointer transition-colors outline-none"
                    >
                      <Ban className="h-3.5 w-3.5" />
                      Close Thread
                    </button>
                  )}
                </div>
              </div>

              {/* Chat timeline */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/20">
                {activeTicket.messages.map((msg, idx) => {
                  const isAdmin = msg.sender === 'admin';
                  return (
                    <div key={idx} className={`flex gap-3 max-w-[80%] ${isAdmin ? 'ml-auto flex-row-reverse' : ''}`}>
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 font-bold text-xs text-white shadow-inner
                        ${isAdmin ? 'bg-orange-500' : 'bg-slate-700'}
                      `}>
                        {msg.senderName.charAt(0)}
                      </div>
                      <div className="space-y-1">
                        <div className={`rounded-2xl p-3.5 text-xs font-semibold leading-relaxed border
                          ${isAdmin
                            ? 'bg-orange-500 text-white border-orange-400'
                            : 'bg-white text-slate-700 border-slate-200/80 shadow-xs'
                          }
                        `}>
                          {msg.message}
                        </div>
                        <span className={`text-[9px] font-bold text-slate-400 block font-mono ${isAdmin ? 'text-right' : ''}`}>
                          {msg.senderName} • {new Date(msg.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Chat Input form */}
              {activeTicket.status !== 'closed' ? (
                <form onSubmit={handlePostReply} className="p-4 border-t border-slate-100 bg-white shrink-0 flex gap-2">
                  <input
                    type="text"
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder="Type your official administrative response..."
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-semibold text-slate-700 outline-none placeholder:text-slate-400/80 focus:bg-white focus:border-orange-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white border-0 rounded-xl cursor-pointer transition-colors shrink-0 flex items-center justify-center outline-none"
                  >
                    <Send className="h-4.5 w-4.5" />
                  </button>
                </form>
              ) : (
                <div className="p-4 border-t border-slate-100 bg-slate-50/50 shrink-0 text-center text-xs font-extrabold text-slate-400">
                  This support ticket is officially closed. No additional replies can be posted.
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-3xl p-24 text-center text-xs font-bold text-slate-400">
              Select a support ticket from the queue to start resolution discussions.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
