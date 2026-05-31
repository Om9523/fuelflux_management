"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Phone, Mail, MessageSquare, Video } from 'lucide-react';

const DUMMY_LOGS = [
  { id: 'LOG-001', customer: 'Acme Logistics', type: 'Email', subject: 'Invoice #INV-2992 Sent', date: '2023-10-25T14:30:00Z', status: 'Sent', agent: 'System' },
  { id: 'LOG-002', customer: 'John Doe', type: 'Phone', subject: 'Inquired about loyalty points', date: '2023-10-24T11:15:00Z', status: 'Resolved', agent: 'Sarah K.' },
  { id: 'LOG-003', customer: 'City Cabs Co.', type: 'Chat', subject: 'Follow up on Ticket #4431', date: '2023-10-25T09:00:00Z', status: 'Ongoing', agent: 'Mike T.' },
  { id: 'LOG-004', customer: 'Metro Transports', type: 'Meeting', subject: 'Quarterly Contract Renewal', date: '2023-10-20T14:00:00Z', status: 'Completed', agent: 'David W.' },
];

export default function CommunicationLogs() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = DUMMY_LOGS.filter(l => 
    l.customer.toLowerCase().includes(searchTerm.toLowerCase()) || 
    l.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.agent.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Email': return <Mail className="w-4 h-4 text-blue-500" />;
      case 'Phone': return <Phone className="w-4 h-4 text-green-500" />;
      case 'Chat': return <MessageSquare className="w-4 h-4 text-orange-500" />;
      case 'Meeting': return <Video className="w-4 h-4 text-purple-500" />;
      default: return <MessageSquare className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Communication Logs</h1>
          <p className="text-sm text-gray-500">History of all customer interactions across channels</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          Log Interaction
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-white">
          <div className="relative w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search logs, customers, or agents..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:border-orange-500 focus:bg-white focus:outline-none transition-colors"
            />
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 text-sm font-semibold text-gray-600 bg-gray-50 px-4 py-2 rounded-lg hover:bg-gray-100">
              <Filter className="w-4 h-4" /> Filter
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="table-base w-full">
            <thead>
              <tr>
                <th>Log ID</th>
                <th>Type</th>
                <th>Customer</th>
                <th>Subject/Summary</th>
                <th>Date & Time</th>
                <th>Agent</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log, idx) => (
                <motion.tr 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  key={log.id}
                >
                  <td className="font-semibold text-gray-900">{log.id}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-gray-50 rounded-lg">
                        {getTypeIcon(log.type)}
                      </div>
                      <span className="font-medium text-gray-700">{log.type}</span>
                    </div>
                  </td>
                  <td className="font-bold text-gray-900">{log.customer}</td>
                  <td className="text-sm text-gray-700">{log.subject}</td>
                  <td>{new Date(log.date).toLocaleString()}</td>
                  <td className="font-medium text-gray-700">{log.agent}</td>
                  <td>
                    <span className={`badge ${
                      log.status === 'Completed' || log.status === 'Resolved' || log.status === 'Sent' ? 'badge-green' : 
                      'badge-orange'
                    }`}>
                      {log.status}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {filteredLogs.length === 0 && (
            <div className="p-12 text-center text-gray-500">
              No communication logs found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
