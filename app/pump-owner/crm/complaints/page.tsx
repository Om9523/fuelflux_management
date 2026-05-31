"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, AlertCircle, CheckCircle2, Clock, MoreVertical, MessageSquare } from 'lucide-react';

const DUMMY_COMPLAINTS = [
  { id: 'TKT-4429', customer: 'Acme Logistics', subject: 'Delayed Delivery', status: 'Pending', priority: 'High', date: '2023-10-25T10:30:00Z' },
  { id: 'TKT-4430', customer: 'John Doe', subject: 'Payment failed but deducted', status: 'In Progress', priority: 'Medium', date: '2023-10-24T14:15:00Z' },
  { id: 'TKT-4431', customer: 'City Cabs Co.', subject: 'Wrong fuel type delivered', status: 'Pending', priority: 'High', date: '2023-10-25T08:00:00Z' },
  { id: 'TKT-4432', customer: 'Sarah Smith', subject: 'QR Code not scanning', status: 'Completed', priority: 'Low', date: '2023-10-20T16:45:00Z' },
  { id: 'TKT-4433', customer: 'Metro Transports', subject: 'Refund not received', status: 'In Progress', priority: 'Medium', date: '2023-10-22T09:20:00Z' },
];

export default function ComplaintManagement() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredComplaints = DUMMY_COMPLAINTS.filter(c => 
    c.customer.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Complaint Management</h1>
          <p className="text-sm text-gray-500">Track and resolve customer support tickets</p>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-white">
          <div className="relative w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search tickets..." 
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
                <th>Ticket ID</th>
                <th>Customer</th>
                <th>Subject</th>
                <th>Date</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredComplaints.map((ticket, idx) => (
                <motion.tr 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  key={ticket.id}
                >
                  <td className="font-semibold text-gray-900">{ticket.id}</td>
                  <td className="font-bold text-gray-900">{ticket.customer}</td>
                  <td className="text-gray-700">{ticket.subject}</td>
                  <td>{new Date(ticket.date).toLocaleDateString()}</td>
                  <td>
                    <span className={`badge ${ticket.priority === 'High' ? 'badge-red' : ticket.priority === 'Medium' ? 'badge-orange' : 'badge-blue'}`}>
                      {ticket.priority}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${ticket.status === 'Completed' ? 'badge-green' : ticket.status === 'Pending' ? 'badge-red' : 'badge-orange'}`}>
                      {ticket.status === 'Completed' ? <CheckCircle2 className="w-3 h-3"/> :
                       ticket.status === 'Pending' ? <AlertCircle className="w-3 h-3"/> :
                       <Clock className="w-3 h-3"/>}
                      {ticket.status}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors title='Reply'">
                        <MessageSquare className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {filteredComplaints.length === 0 && (
            <div className="p-12 text-center text-gray-500">
              No tickets found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
